import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { reviewSchema } from "@/lib/validators";
import Review from "@/models/Review";
import FreelancerProfile from "@/models/FreelancerProfile";
import Hire from "@/models/Hire";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(reviewSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();

    const { hireId, freelancerId, rating, text } = parsed.data!;

    // Ensure the hire exists, belongs to the reviewer, and is completed
    const hire = await Hire.findById(hireId);
    if (!hire) return jsonError("Hire not found", 404);
    if (hire.hirerId.toString() !== result.auth.userId) return jsonError("Forbidden", 403);
    if (hire.status !== "completed") return jsonError("Only completed hires can be reviewed", 400);

    // Check for duplicate review
    const existing = await Review.findOne({ hireId });
    if (existing) return jsonError("Review already exists for this hire", 400);

    const review = await Review.create({
      hireId,
      reviewerId: result.auth.userId,
      freelancerId,
      rating,
      text,
    });

    // Update freelancer profile stats
    const allReviews = await Review.find({ freelancerId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await FreelancerProfile.findOneAndUpdate(
      { userId: freelancerId },
      { 
        rating: Number(averageRating.toFixed(1)),
        $inc: { completedProjects: 1 } 
      }
    );

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if ((error as any).code === 11000) {
      return NextResponse.json({ error: "Review already exists for this hire" }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
