import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "provider") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                business: true
            }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching provider profile:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "provider") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, businessName, phone, image } = body;

        // Transaction to update both User and Business
        const updatedUser = await prisma.$transaction(async (tx) => {
            // Update User
            const u = await tx.user.update({
                where: { id: session.user.id },
                data: { 
                    name,
                    ...(image && { image }) // Update image if provided
                }
            });

            // Update Business if exists
            if (businessName || phone) {
                await tx.business.update({
                    where: { providerId: session.user.id },
                    data: {
                        name: businessName,
                        phone: phone,
                    }
                });
            }

            // Re-fetch to return complete data
            return await tx.user.findUnique({
                where: { id: session.user.id },
                include: { business: true }
            });
        });

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (error) {
        console.error("Error updating provider profile:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
