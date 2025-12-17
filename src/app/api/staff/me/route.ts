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
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!staffProfile) {
      return NextResponse.json({ message: "Staff profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: staffProfile.id,
      userId: staffProfile.userId,
      name: staffProfile.user.name,
      email: staffProfile.user.email,
      workingHours: staffProfile.workingHours,
      active: staffProfile.active,
      businessId: staffProfile.businessId,
      createdAt: staffProfile.createdAt
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching staff profile:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "staff") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, phone } = await request.json();

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name })
      }
    });

    // Also update staff working hours if provided
    const staffProfile = await prisma.staff.findUnique({
      where: { userId: session.user.id }
    });

    if (!staffProfile) {
      return NextResponse.json({ message: "Staff profile not found" }, { status: 404 });
    }

    const updatedStaff = await prisma.staff.update({
      where: { id: staffProfile.id },
      data: {
        ...(phone && { workingHours: phone })
      }
    });

    return NextResponse.json({
      id: updatedStaff.id,
      name: updatedUser.name,
      email: updatedUser.email,
      workingHours: updatedStaff.workingHours,
      active: updatedStaff.active
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating staff profile:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
