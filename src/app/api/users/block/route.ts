import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { userIdToBlock, unblock } = await request.json();
    if (!userIdToBlock) return jsonError("userIdToBlock is required");

    await connectDB();
    const currentUser = await User.findById(result.auth.userId);
    if (!currentUser) return jsonError("User not found", 404);

    const targetId = new Types.ObjectId(userIdToBlock);

    if (!currentUser.blockedUsers) {
      currentUser.blockedUsers = [];
    }

    const isCurrentlyBlocked = currentUser.blockedUsers.some(id => id.toString() === userIdToBlock);

    if (unblock) {
      if (isCurrentlyBlocked) {
        currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== userIdToBlock);
        await currentUser.save();
      }
    } else {
      if (!isCurrentlyBlocked) {
        currentUser.blockedUsers.push(targetId);
        await currentUser.save();
      }
    }

    return NextResponse.json({ success: true, blockedUsers: currentUser.blockedUsers });
  } catch (error) {
    console.error("Block User Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
