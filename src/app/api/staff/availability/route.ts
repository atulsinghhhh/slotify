import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const staffId = searchParams.get("staffId");
        const date = searchParams.get("date");

        if (!staffId || !date) {
            return NextResponse.json(
                { message: "staffId and date are required" },
                { status: 400 }
            );
        }

        const staff = await prisma.staff.findUnique({
            where: { id: staffId },
            select: { workingHours: true }
        });

        if (!staff) {
            return NextResponse.json(
                { message: "Staff not found" },
                { status: 404 }
            );
        }

        // Parse working hours
        let workingHours: Record<string, string> = {};
        if (staff.workingHours) {
            if (typeof staff.workingHours === "string") {
                try {
                    workingHours = JSON.parse(staff.workingHours);
                } catch {
                    // If it's a legacy format like "09:00 - 17:00", convert it
                    workingHours = { default: staff.workingHours };
                }
            } else if (typeof staff.workingHours === "object") {
                workingHours = staff.workingHours as Record<string, string>;
            }
        }

        // Get appointments for the staff on this date
        const appointments = await prisma.appointment.findMany({
            where: {
                staffId,
                date,
                status: { not: "CANCELED" }
            },
            select: { startTime: true, service: { select: { duration: true } } }
        });

        // Calculate available slots (15-min intervals)
        const bookedSlots = appointments.map(apt => ({
            start: apt.startTime,
            duration: apt.service?.duration || 60
        }));

        return NextResponse.json({
            workingHours,
            bookedSlots,
            date
        });
    } catch (error) {
        console.error("Error fetching staff availability:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
