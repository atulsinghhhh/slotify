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

    if (!staffProfile) {
      return NextResponse.json({ message: "Staff profile not found" }, { status: 404 });
    }

    const now = new Date();

    const [todayCount, nextAppointment, weekCount] = await Promise.all([
      prisma.appointment.count({
        where: {
          staffId: staffProfile.id,
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        }
      }),
      prisma.appointment.findFirst({
        where: {
          staffId: staffProfile.id,
          startTime: { gte: now }
        },
        include: {
          customer: { select: { name: true } },
          service: { select: { name: true } }
        },
        orderBy: { startTime: "asc" }
      }),
      prisma.appointment.count({
        where: {
          staffId: staffProfile.id,
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)
          }
        }
      })
    ]);

    return NextResponse.json({
      todayCount,
      nextAppointment,
      weekCount
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching staff dashboard:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
