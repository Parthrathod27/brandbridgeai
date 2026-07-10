import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import User from "@/models/User";
import Collaboration from "@/models/Collaboration";
import BrandMatchCache from "@/models/BrandMatchCache";
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
      let cache = await BrandMatchCache.findOne({ brandA: myProfile.userId, brandB: id });
      
      if (!cache) {
        const match = await analyzeBrandCompatibility(myProfile as any, { ...profile.toObject(), brandId: id } as any);
        cache = await BrandMatchCache.create({
          brandA: myProfile.userId,
          brandB: id,
          compatibilityScore: match.compatibilityScore,
          scoreBreakdown: match.scoreBreakdown,
          audienceMatch: match.audienceMatch,
          campaignSuggestions: match.campaignSuggestions,
          marketingStrategy: match.marketingStrategy,
          suggestedFreelancerCategories: match.suggestedFreelancerCategories,
          estimatedReach: match.estimatedReach,
        });
      }

      compatibility = {
        score: cache.compatibilityScore,
        reason: cache.audienceMatch,
        estimatedReach: cache.estimatedReach,
        breakdown: cache.scoreBreakdown,
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
        companySize: profile.companySize,
        foundedYear: profile.foundedYear,
        businessType: profile.businessType,
        targetGender: profile.targetGender,
        primaryMarket: profile.primaryMarket,
        collaborationLookingFor: profile.collaborationLookingFor,
        preferredCollaborationType: profile.preferredCollaborationType,
        budgetRange: profile.budgetRange,
        availabilityStatus: profile.availabilityStatus,
        socialMediaReach: profile.socialMediaReach,
      },
      compatibility,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
