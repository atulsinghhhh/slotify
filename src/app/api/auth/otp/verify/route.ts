import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { email, token } = await req.json();

        if (!email || !token) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 });
        }

        const record = await prisma.verificationToken.findFirst({
            where: {
                identifier: email,
                token: token,
                expires: { gt: new Date() }
            }
        });

        if (!record) {
            return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
        }

        // Cleanup used token
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token: token
                }
            }
        });

        return NextResponse.json({ message: "Verified" }, { status: 200 });

    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
