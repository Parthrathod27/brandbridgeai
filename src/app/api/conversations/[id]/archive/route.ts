import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Conversation from "@/models/Conversation";
import { Types } from "mongoose";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { unarchive } = await request.json();
    const params = await props.params;
    const conversationId = params.id;

    await connectDB();
    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === result.auth.userId)) {
      return jsonError("Conversation not found", 404);
    }

    // Find current user's state
    const stateIndex = conv.participantStates.findIndex(s => s.userId.toString() === result.auth.userId);

    if (stateIndex === -1) {
      conv.participantStates.push({
        userId: new Types.ObjectId(result.auth.userId),
        unreadCount: 0,
        isPinned: false,
        isArchived: !unarchive,
      });
    } else {
      conv.participantStates[stateIndex].isArchived = !unarchive;
    }

    await conv.save();

    return NextResponse.json({ success: true, isArchived: !unarchive });
  } catch (error) {
    console.error("Archive Conversation Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
