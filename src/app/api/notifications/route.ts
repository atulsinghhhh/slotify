import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // We store notifications against customers; block non-customer roles for now
    if (session.user.role !== "customer") {
      return NextResponse.json({ message: "Notifications are available for customers only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const skipParam = searchParams.get("skip");

    const limit = Math.min(parseInt(limitParam || "20", 10) || 20, 100);
    const skip = parseInt(skipParam || "0", 10) || 0;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { customerId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.notification.count({
        where: { customerId: session.user.id, isRead: false },
      }),
    ]);

    return NextResponse.json({ data: notifications, unreadCount, total: notifications.length }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
