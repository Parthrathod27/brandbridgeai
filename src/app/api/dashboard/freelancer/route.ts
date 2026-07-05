import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import FreelancerProfile from "@/models/FreelancerProfile";
import PortfolioItem from "@/models/PortfolioItem";
import Campaign from "@/models/Campaign";
import Hire from "@/models/Hire";
import Proposal from "@/models/Proposal";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { calculateProfileCompleteness } from "@/lib/profile-completeness";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);

    const [myProfile, fp, portfolioCount] = await Promise.all([
      Profile.findOne({ userId: uid }),
      FreelancerProfile.findOne({ userId: uid }),
      PortfolioItem.countDocuments({ userId: uid }),
    ]);

    if (!myProfile) return jsonError("Complete your profile first", 400);

    const [activeHires, pendingHires, completedHires, proposalsSent] = await Promise.all([
      Hire.countDocuments({ freelancerId: uid, status: "active" }),
      Hire.countDocuments({ freelancerId: uid, status: "pending" }),
      Hire.countDocuments({ freelancerId: uid, status: "completed" }),
      Proposal.countDocuments({ freelancerId: uid }),
    ]);

    const earningsAgg = await Hire.aggregate([
      { $match: { freelancerId: uid, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$rate" } } },
    ]);
    const totalEarnings = earningsAgg[0]?.total ?? 0;

    const stats = [
      { label: "Active Projects", value: activeHires },
      { label: "Pending Requests", value: pendingHires },
      { label: "Proposals Sent", value: proposalsSent },
      { label: "Total Earnings", value: totalEarnings },
    ];

    const openCampaigns = await Campaign.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("ownerId", "name")
      .lean();

    const projectOpportunities = openCampaigns.map((c) => ({
      _id: c._id.toString(),
      title: c.title,
      description: c.description,
      budget: c.budget,
      brandName: (c.ownerId as { name?: string })?.name ?? "Brand",
      createdAt: c.createdAt,
    }));

    const pendingHireRequests = await Hire.find({ freelancerId: uid, status: "pending" })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("hirerId", "name email")
      .populate("campaignId", "title")
      .lean();

    const pendingRequests = pendingHireRequests.map((h) => ({
      _id: h._id.toString(),
      hirerName: (h.hirerId as { name?: string })?.name ?? "Client",
      campaignTitle: (h.campaignId as { title?: string })?.title,
      rate: h.rate,
      createdAt: h.createdAt,
    }));

    const portfolioItems = await PortfolioItem.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const portfolioHighlights = portfolioItems.map((p) => ({
      _id: p._id.toString(),
      title: p.title,
      mediaUrl: p.mediaUrl,
      category: p.category,
    }));

    const myProposals = await Proposal.find({ freelancerId: uid })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("campaignId", "title")
      .lean();

    const recentProposals = myProposals.map((p) => ({
      _id: p._id.toString(),
      campaignTitle: (p.campaignId as { title?: string })?.title ?? "Campaign",
      status: p.status,
      rate: p.rate,
      createdAt: p.createdAt,
    }));

    const notifications = await Notification.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const activity: { type: string; message: string; timestamp: string }[] = [];

    for (const n of notifications) {
      activity.push({
        type: n.type,
        message: n.message,
        timestamp: n.createdAt.toISOString(),
      });
    }

    const recentHires = await Hire.find({ freelancerId: uid })
      .sort({ updatedAt: -1 })
      .limit(3)
      .populate("hirerId", "name")
      .lean();

    for (const h of recentHires) {
      const hirer = h.hirerId as { name?: string };
      activity.push({
        type: "hire",
        message: `Hire request from ${hirer?.name ?? "a brand"} — ${h.status}`,
        timestamp: h.updatedAt.toISOString(),
      });
    }

    activity.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const profileCompleteness = calculateProfileCompleteness(
      myProfile.toObject(),
      "freelancer",
      {
        skills: fp?.skills,
        categories: fp?.categories,
        hourlyRate: fp?.hourlyRate,
        portfolioCount,
      },
    );

    const activeProjectsList = await Hire.find({ freelancerId: uid, status: "active" })
      .sort({ updatedAt: -1 })
      .limit(3)
      .populate("hirerId", "name")
      .populate("campaignId", "title")
      .lean();

    const activeProjects = activeProjectsList.map((h) => ({
      _id: h._id.toString(),
      clientName: (h.hirerId as { name?: string })?.name ?? "Client",
      campaignTitle: (h.campaignId as { title?: string })?.title,
      rate: h.rate,
    }));

    return NextResponse.json({
      stats,
      projectOpportunities,
      pendingRequests,
      portfolioHighlights,
      recentProposals,
      activity: activity.slice(0, 8),
      profileCompleteness,
      earnings: {
        total: totalEarnings,
        pending: pendingHires,
        active: activeHires,
        completed: completedHires,
      },
      activeProjects,
      freelancerMeta: {
        rating: fp?.rating ?? 0,
        completedProjects: fp?.completedProjects ?? completedHires,
        hourlyRate: fp?.hourlyRate,
        categories: fp?.categories ?? [],
        skills: fp?.skills ?? [],
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
