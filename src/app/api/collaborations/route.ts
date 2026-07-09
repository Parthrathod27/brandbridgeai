import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { collaborationSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import Collaboration from "@/models/Collaboration";
import Profile from "@/models/Profile";
import User from "@/models/User";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);
    const raw = await Collaboration.find({
      $or: [{ initiatorId: uid }, { partnerId: uid }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const collaborations = await Promise.all(
      raw.map(async (c) => {
        const isIncoming = c.partnerId.toString() === uid.toString();
        const otherId = isIncoming ? c.initiatorId : c.partnerId;
        const [otherUser, otherProfile] = await Promise.all([
          User.findById(otherId).select("name email").lean(),
          Profile.findOne({ userId: otherId }).select("companyName").lean(),
        ]);
        const partnerName =
          otherProfile?.companyName || otherUser?.name || "Unknown brand";

        return {
          _id: c._id.toString(),
          status: c.status,
          message: c.message,
          proposal: c.proposal,
          compatibilityScore: c.compatibilityScore,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          isIncoming,
          partnerName,
        };
      }),
    );

    return NextResponse.json({ collaborations });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(collaborationSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const partner = await User.findById(parsed.data!.partnerId);
    if (!partner) return jsonError("Partner not found", 404);

    const existing = await Collaboration.findOne({
      $or: [
        { initiatorId: result.auth.userId, partnerId: parsed.data!.partnerId },
        { initiatorId: parsed.data!.partnerId, partnerId: result.auth.userId },
      ],
    });
    if (existing) return jsonError("Collaboration already exists", 409);

    const collaboration = await Collaboration.create({
      initiatorId: result.auth.userId,
      partnerId: parsed.data!.partnerId,
      message: parsed.data!.message,
      proposal: parsed.data!.proposal,
      emailDraft: parsed.data!.emailDraft,
      compatibilityScore: parsed.data!.compatibilityScore,
    });

    await createNotification(
      parsed.data!.partnerId,
      "collaboration",
      "New collaboration request",
      "You received a new collaboration request.",
      `/dashboard/${partner.role}/collaborations`,
    );

    return NextResponse.json({ collaboration }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
