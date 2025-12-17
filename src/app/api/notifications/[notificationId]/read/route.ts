import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(_request: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "customer") {
      return NextResponse.json({ message: "Notifications are available for customers only" }, { status: 403 });
    }

    const { notificationId } = await params;
    if (!notificationId) {
      return NextResponse.json({ message: "Notification ID is required" }, { status: 400 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { customerId: true },
    });

    if (!notification || notification.customerId !== session.user.id) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
