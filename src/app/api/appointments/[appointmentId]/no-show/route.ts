import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "staff") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;

    const staffProfile = await prisma.staff.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!staffProfile) {
      return NextResponse.json({ message: "Staff profile not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment || appointment.staffId !== staffProfile.id) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "NO_SHOW" }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error marking appointment as no-show:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
