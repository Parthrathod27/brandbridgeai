import { NextResponse } from "next/server";
import { requireAuth, jsonError } from "@/lib/api-utils";
import { generateText } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const { campaignName, type, goal, budget, partnerName, initiatorName } = body;

    if (!campaignName || !partnerName) {
      return jsonError("Missing required fields", 400);
    }

    const prompt = `
You are an expert marketing strategist. Generate a concise, professional Campaign Brief for the following collaboration:
Initiating Brand: ${initiatorName || "Our Brand"}
Partner Brand: ${partnerName}
Campaign Name: ${campaignName}
Campaign Type: ${type || "General Campaign"}
Goal: ${goal || "Increase brand awareness"}
Budget: $${budget || "Not specified"}

The brief should include:
1. Executive Summary
2. Target Audience
3. Key Messages
4. Proposed Timeline structure

Keep it concise and formatted in markdown.
`;

    const brief = await generateText(prompt);

    if (!brief) {
      return jsonError("Failed to generate campaign brief. Please try again later.", 500);
    }

    return NextResponse.json({ brief });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
