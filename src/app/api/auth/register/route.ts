import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateOtp, signToken, setAuthCookie } from "@/lib/auth";
import { zodErrorMessage } from "@/lib/zod-utils";
import { registerSchema } from "@/lib/validators";
import { sendOtpEmail } from "@/lib/mail";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 },
      );
    }

    const { name, email: rawEmail, password, role } = parsed.data;
    const email = rawEmail.toLowerCase().trim();

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: "email",
      isEmailVerified: false,
      role,
      onboardingComplete: true,
      otp: { code: otp, expiresAt: otpExpires },
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (mailError) {
      // Log the mail error to server-error.log as well
      try {
        const logPath = path.join(process.cwd(), "server-error.log");
        fs.appendFileSync(
          logPath,
          `[${new Date().toISOString()}] MAIL ERROR DURING REGISTRATION:\n${mailError instanceof Error ? mailError.stack : String(mailError)}\n\n`
        );
      } catch (e) {
        console.error("Failed to write to server-error.log:", e);
      }
      return NextResponse.json(
        { error: "Account created but failed to send verification email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Registration successful. Please verify your email.",
      email,
    });
  } catch (error) {
    try {
      const logPath = path.join(process.cwd(), "server-error.log");
      fs.appendFileSync(
        logPath,
        `[${new Date().toISOString()}] REGISTER ERROR:\n${error instanceof Error ? error.stack : String(error)}\n\n`
      );
    } catch (e) {
      console.error("Failed to write to server-error.log:", e);
    }
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

