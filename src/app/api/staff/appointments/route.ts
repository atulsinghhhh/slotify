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
      select: { id: true }
    });

    console.log("Staff profile lookup:", { 
      userId: session.user.id, 
      staffProfile 
    });

    if (!staffProfile) {
      return NextResponse.json({ message: "Staff profile not found" }, { status: 404 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { staffId: staffProfile.id },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        service: {
          select: { id: true, name: true, duration: true }
        },
        business: {
          select: { id: true, name: true }
        }
      },
      orderBy: { startTime: "asc" }
    });

    console.log("Fetched appointments for staff:", {
      staffId: staffProfile.id,
      count: appointments.length,
      appointmentIds: appointments.map(a => ({ id: a.id, staffId: a.staffId }))
    });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching staff appointments:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
