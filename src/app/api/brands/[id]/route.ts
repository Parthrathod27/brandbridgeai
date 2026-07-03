import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import User from "@/models/User";
import Collaboration from "@/models/Collaboration";
import { analyzeBrandCompatibility } from "@/lib/ai/matching";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    await connectDB();

    const [profile, user, myProfile] = await Promise.all([
      Profile.findOne({ userId: id, role: "brand" }),
      User.findById(id).select("name email createdAt"),
      Profile.findOne({ userId: result.auth.userId }),
    ]);

    if (!profile || !user) return jsonError("Brand not found", 404);

    const pastCollaborations = await Collaboration.countDocuments({
      $or: [
        { initiatorId: id, status: "accepted" },
        { partnerId: id, status: "accepted" },
      ],
    });

    let compatibility = null;
    if (myProfile) {
      const match = await analyzeBrandCompatibility(
        {
          companyName: myProfile.companyName,
          industry: myProfile.industry,
          targetAudience: myProfile.targetAudience,
          marketingBudget: myProfile.marketingBudget,
          bio: myProfile.bio,
        },
        {
          brandId: id,
          companyName: profile.companyName,
          industry: profile.industry,
          targetAudience: profile.targetAudience,
          marketingBudget: profile.marketingBudget,
          bio: profile.bio,
        },
      );
      compatibility = {
        score: match.compatibilityScore,
        reason: match.audienceMatch,
        estimatedReach: match.estimatedReach,
        breakdown: {
          audienceOverlap: Math.min(100, match.compatibilityScore + 5),
          categoryRelevance: Math.min(100, match.compatibilityScore - 3),
          engagementScore: Math.min(100, match.compatibilityScore - 8),
        },
      };
    }

    return NextResponse.json({
      brand: {
        userId: id,
        name: user.name,
        companyName: profile.companyName,
        logo: profile.logo,
        bio: profile.bio,
        industry: profile.industry,
        location: profile.location,
        website: profile.website,
        targetAudience: profile.targetAudience,
        marketingBudget: profile.marketingBudget,
        verified: profile.profileComplete,
        audienceSize: profile.targetAudience
          ? `Est. ${profile.targetAudience.split(",")[0]?.trim() || "100K+"} reach`
          : "Audience data pending",
        pastCollaborations,
        socialLinks: profile.socialLinks,
      },
      compatibility,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
