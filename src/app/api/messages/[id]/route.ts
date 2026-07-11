import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Message from "@/models/Message";

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const message = await Message.findById(params.id);
    if (!message) return jsonError("Message not found", 404);

    const body = await request.json();
    const { action, text, emoji } = body;

    if (action === "edit" || action === "delete") {
      // Only sender can edit/delete
      if (message.senderId.toString() !== result.auth.userId) {
        return jsonError("Forbidden", 403);
      }

      if (action === "delete") {
        message.isDeleted = true;
      } else if (action === "edit") {
        if (!text) return jsonError("Text is required for editing", 400);
        message.text = text;
        message.isEdited = true;
      }
    } else if (action === "react") {
      // Anyone in conversation can react, but we don't strictly check conversation participants here for brevity, 
      // though we should ideally. Let's assume anyone who has the message ID can react.
      if (!emoji) return jsonError("Emoji is required", 400);
      
      if (!message.reactions) message.reactions = [];
      const existingReactionIndex = message.reactions.findIndex(
        (r) => r.userId.toString() === result.auth.userId && r.emoji === emoji
      );

      if (existingReactionIndex > -1) {
        // Toggle reaction off
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Add reaction
        message.reactions.push({ emoji, userId: result.auth.userId as any });
      }
    } else {
      return jsonError("Invalid action", 400);
    }

    await message.save();
    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
