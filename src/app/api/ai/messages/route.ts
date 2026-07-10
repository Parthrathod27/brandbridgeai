import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-utils";
import { generateText } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { action, role, messages, notes } = await request.json();

    if (!action || !messages) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const conversationContext = messages.map((m: any) => 
      `${m.senderId?._id === result.auth.userId ? "Me" : "Them"}: ${m.text}`
    ).join("\n");

    if (action === "smart_reply") {
      const prompt = `
You are an AI assistant helping a user (role: ${role}) reply to a conversation on a brand collaboration platform.
Here is the recent conversation:
${conversationContext}

Generate 3 short, professional, and natural-sounding reply options the user can send. 
The tone should reflect their role (e.g., if freelancer, be professional and eager; if brand, be polite and direct).
Format the output as a JSON array of strings ONLY. No markdown, no explanation. Example: ["Yes, that works.", "Can we discuss this further?"]
      `;
      
      const text = await generateText(prompt);
      const trimmedText = text.trim();
      let replies = [];
      try {
        replies = JSON.parse(trimmedText);
      } catch (e) {
        // fallback regex to extract array if wrapped in backticks
        const match = trimmedText.match(/\[[\s\S]*\]/);
        if (match) replies = JSON.parse(match[0]);
      }
      return NextResponse.json({ replies: Array.isArray(replies) ? replies.slice(0, 3) : [] });
    }

    if (action === "draft_reply") {
      const prompt = `
You are an AI assistant helping a user (role: ${role}) draft a professional reply.
Here is the recent conversation:
${conversationContext}

The user provided these rough notes for their reply:
"${notes}"

Draft a polished, professional, and natural-sounding message based on these notes that fits the context of the conversation. Output ONLY the drafted message, nothing else.
      `;
      const text = await generateText(prompt);
      return NextResponse.json({ draft: text.trim() });
    }

    if (action === "summarize") {
      const prompt = `
Summarize the following conversation in 2-3 short, concise bullet points:
${conversationContext}
      `;
      const text = await generateText(prompt);
      return NextResponse.json({ summary: text.trim() });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("AI Messages Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
