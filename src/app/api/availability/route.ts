import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSlotTimes } from "@/lib/slot";


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const businessId = searchParams.get("businessId");
        const serviceId = searchParams.get("serviceId");
        const staffId = searchParams.get("staffId");
        const date = searchParams.get("date");

        if (!businessId || !serviceId || !date) {
            return NextResponse.json( { message: "Missing required parameters" }, { status: 400 });
        }

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            select: { duration: true }
        });

        if (!service) {
            return NextResponse.json( { message: "Service not found" }, { status: 404 });
        }

        let workingStart = "09:00";
        let workingEnd = "17:00";

        if (staffId) {
            const staff = await prisma.staff.findUnique({
                where: { id: staffId },
                select: { workingHours: true }
            });

            if (!staff) {
                return NextResponse.json({ message: "Staff not found" }, { status: 404 });
            }

            if (staff.workingHours && typeof staff.workingHours === "string") {
                const [start, end] = staff.workingHours.split(" - ");
                workingStart = start;
                workingEnd = end;
            }
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                businessId,
                staffId: staffId ?? undefined,
                date
            },
            select: {
                startTime: true,
                endTime: true
            }
        });

        const normalizedAppointments = appointments.map(a => ({
            startTime: a.startTime.toISOString().slice(11, 16),
            endTime: a.endTime.toISOString().slice(11, 16)
        }));

        const slots = generateSlotTimes(
            workingStart,
            workingEnd,
            service.duration,
            normalizedAppointments
        );

        return NextResponse.json({ slots }, { status: 200 });

    } catch (error) {
        console.error("Availability error:", error);
        return NextResponse.json( { message: "Internal Server Error" },{ status: 500 });
    }
}
