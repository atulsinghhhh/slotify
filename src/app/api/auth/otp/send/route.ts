import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        // 1. Check if email already exists
        const existingUser = await prisma.user.findUnique({
             where: { email }
        });
        

        // 2. Generate OTP
        const token = crypto.randomInt(100000, 999999).toString();
        const expires = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 minutes


        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires
            }
        });

        // 4. Send Email
        await sendVerificationEmail(email, token);

        return NextResponse.json({ message: "OTP sent" }, { status: 200 });

    } catch (error) {
        console.error("OTP Error:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
