import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ staffId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        const { staffId } = await ctx.params;
        const staffProfile = await prisma.staff.findUnique({
            where: { id: staffId },
            include: {
                user: true,
                services: true
            }
        });
        if (!staffProfile || staffProfile.providerId !== session.user.id) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }
        return NextResponse.json(staffProfile, {status:200});
    } catch (error) {
        console.error("Error fetching staff profile:", error);
        return NextResponse.json({message:"Internal Server Error"}, {status:500});
    }
}

export async function PUT(request: NextRequest, ctx: { params: Promise<{ staffId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        const { staffId } = await ctx.params;
        const body = await request.json();
        const { workingHours, services } = body as { workingHours?: string; services?: string[] };

        const existing = await prisma.staff.findUnique({ where: { id: staffId }, select: { providerId: true } });
        if (!existing || existing.providerId !== session.user.id) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        const data: any = {};
        if (typeof workingHours === "string") data.workingHours = workingHours;
        if (Array.isArray(services)) {
            data.services = {
                set: [],
                connect: services.map((sid) => ({ id: sid }))
            };
        }

        const updated = await prisma.staff.update({
            where: { id: staffId },
            data
        });
        return NextResponse.json(updated, {status:200});
    } catch (error) {
        console.error("Error updating staff:", error);
        return NextResponse.json({message:"Internal Server Error"}, {status:500});
    }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ staffId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }
        const { staffId } = await ctx.params;
        const existing = await prisma.staff.findUnique({ where: { id: staffId }, select: { providerId: true } });
        if (!existing || existing.providerId !== session.user.id) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }
        // Soft delete via active=false; if you want hard delete, replace with prisma.staff.delete
        const updated = await prisma.staff.update({ where: { id: staffId }, data: { active: false } });
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("Error deleting staff:", error);
        return NextResponse.json({message:"Internal Server Error"}, {status:500});
    }
}