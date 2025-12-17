import { NextResponse } from "next/server";
import { processReminders } from "@/lib/reminders";

export async function POST() {
    try {

        const results = await processReminders();
        return NextResponse.json(
            {
                success: true,
                message: "Reminder processing completed",
                data: results,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in reminder cron job:", error);
            return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            },
        { status: 500 }
        );
    }
}
