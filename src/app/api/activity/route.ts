import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api-utils";
import ActivityLog from "@/models/ActivityLog";
import { Types } from "mongoose";

export async function GET(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId");
    const entityType = searchParams.get("entityType");

    if (!entityId || !entityType) {
      return NextResponse.json({ error: "Missing entityId or entityType" }, { status: 400 });
    }

    await connectDB();
    
    // Find all activity logs that match the entityId and entityType in the metadata
    const logs = await ActivityLog.find({
      "metadata.entityId": new Types.ObjectId(entityId),
      "metadata.entityType": entityType
    }).sort({ createdAt: -1 });

    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
