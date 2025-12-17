import { NextResponse } from "next/server";
import { getAllReminders } from "@/lib/reminders";


export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);

        const reminders = await getAllReminders(limit);

        return NextResponse.json(
            {
                success: true,
                count: reminders.length,
                data: reminders,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
