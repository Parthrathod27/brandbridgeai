import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import { connectDB } from "@/lib/mongodb";
import { generateText } from "@/lib/gemini";
import { Types } from "mongoose";

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const uid = new Types.ObjectId(authResult.auth.userId);
    const myProfile = await Profile.findOne({ userId: uid });

    if (!myProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    const { targetBrandName } = await req.json();

    if (!targetBrandName) {
      return NextResponse.json({ error: "Target brand name is required" }, { status: 400 });
    }

    const prompt = `You are an expert partnership manager writing a cold outreach email.
Write a compelling, professional, yet approachable cold email proposing a co-marketing collaboration.
Do not include any placeholders like [Your Name] unless absolutely necessary; use the information provided.

Sender's Company: ${myProfile.companyName || "Our Brand"}
Sender's Industry: ${myProfile.industry || "N/A"}
Sender's Value Proposition / Bio: ${myProfile.bio || "N/A"}

Recipient's Company: ${targetBrandName}

The email should:
1. Have a catchy subject line (starting with "Subject: ")
2. Compliment the recipient's brand briefly.
3. Introduce the sender's brand and the potential synergy.
4. Propose a high-level collaboration idea (e.g., co-branded content, cross-promotion).
5. End with a soft call to action to chat further.
`;

    let emailDraft = await generateText(prompt);

    if (!emailDraft) {
      console.warn("Outreach email generation rate-limited, using intelligent fallback.");
      emailDraft = `Subject: Exploring a Co-Marketing Partnership: ${myProfile.companyName || "Our Brand"} x ${targetBrandName}

Hi there,

I hope this email finds you well. I’ve been a big fan of ${targetBrandName} and love what you're doing in the industry!

I’m reaching out from ${myProfile.companyName || "Our Brand"}. We specialize in ${myProfile.industry || "our industry"}, and we've been helping our audience with ${myProfile.bio || "our services"}. 

Given the natural synergy between our audiences, I’d love to explore a co-marketing collaboration. I think a joint campaign—perhaps a cross-promotion or shared content piece—would provide immense value to both of our customer bases.

Would you be open to a quick 10-minute chat next week to brainstorm some high-level ideas?

Best regards,
The ${myProfile.companyName || "Our Brand"} Team`;
    }

    return NextResponse.json({ emailDraft });
  } catch (error: any) {
    console.error("Outreach API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate outreach email" }, { status: 500 });
  }
}
