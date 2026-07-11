import { NextResponse } from "next/server";
import { requireAuth, jsonError } from "@/lib/api-utils";
import { generateText } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const { campaignName, type, goal, partnerName, initiatorName } = body;

    if (!campaignName || !partnerName) {
      return jsonError("Missing required fields", 400);
    }

    const prompt = `
You are an expert content strategist. Generate 3 to 5 short, actionable content or post ideas for a collaborative marketing campaign.
Initiating Brand: ${initiatorName || "Our Brand"}
Partner Brand: ${partnerName}
Campaign Name: ${campaignName}
Campaign Type: ${type || "General Campaign"}
Goal: ${goal || "Increase brand awareness"}

Format the response as a bulleted list of ideas. Each idea should be 1-2 sentences. Do not include extra conversational text, just the list.
`;

    const ideasText = await generateText(prompt);

    if (!ideasText) {
      return jsonError("Failed to generate content ideas. Please try again later.", 500);
    }

    // Split by newlines and filter out empty strings, bullet points, etc. to return an array of strings
    const ideas = ideasText
      .split('\n')
      .map(idea => idea.replace(/^[-*•\d.]\s*/, '').trim())
      .filter(idea => idea.length > 0);

    return NextResponse.json({ ideas });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
