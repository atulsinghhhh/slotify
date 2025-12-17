import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "customer") {
      return NextResponse.json({ message: "Notifications are available for customers only" }, { status: 403 });
    }

    const result = await prisma.notification.updateMany({
      where: { customerId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, updated: result.count }, { status: 200 });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
