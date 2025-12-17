import { NextResponse } from "next/server";
import { getAppointmentReminders } from "@/lib/reminders";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;

    if (!appointmentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment ID is required",
        },
        { status: 400 }
      );
    }

    const reminders = await getAppointmentReminders(appointmentId);

    return NextResponse.json(
      {
        success: true,
        appointmentId,
        count: reminders.length,
        data: reminders,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching appointment reminders:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
