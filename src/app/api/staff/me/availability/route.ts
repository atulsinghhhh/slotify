import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "staff") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const staffProfile = await prisma.staff.findUnique({
      where: { userId: session.user.id },
      select: { workingHours: true }
    });

    if (!staffProfile) {
      return NextResponse.json({ message: "Staff profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      workingHours: staffProfile.workingHours || {
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "17:00" },
        saturday: null,
        sunday: null
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching staff availability:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "staff") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { workingHours } = await request.json();

    if (!workingHours) {
      return NextResponse.json({ message: "workingHours is required" }, { status: 400 });
    }

    const staffProfile = await prisma.staff.findUnique({
      where: { userId: session.user.id }
    });

    if (!staffProfile) {
      return NextResponse.json({ message: "Staff profile not found" }, { status: 404 });
    }

    const updated = await prisma.staff.update({
      where: { id: staffProfile.id },
      data: { workingHours }
    });

    return NextResponse.json({
      workingHours: updated.workingHours
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating staff availability:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
