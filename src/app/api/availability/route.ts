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

            if (staff.workingHours) {
                // Parse workingHours JSON
                let workingHours: unknown = staff.workingHours;
                if (typeof workingHours === "string") {
                     try {
                        workingHours = JSON.parse(workingHours);
                     } catch {
                        // Handle legacy string format "09:00 - 17:00"
                        const [start, end] = (workingHours as string).split(" - ");
                        workingStart = start;
                        workingEnd = end;
                        workingHours = null; // skip JSON logic
                     }
                }

                if (workingHours) {
                     // Get day of week consistently from YYYY-MM-DD string (UTC)
                     const dateObj = new Date(date);
                     const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                     // Use getUTCDay() because '2025-12-17' parses to UTC midnight
                     const dayAtIndex = dateObj.getUTCDay(); 
                     const dayOfWeek = days[dayAtIndex];
                     
                     console.log(`Checking availability for: ${date} (${dayOfWeek})`);
                     console.log("Working Hours JSON:", JSON.stringify(workingHours));

                     const daySchedule = workingHours[dayOfWeek];
                     console.log("Schedule for day:", daySchedule);

                     if (!daySchedule || daySchedule === "closed") {
                         console.log("Day is closed or no schedule");
                         return NextResponse.json({ slots: [] }, { status: 200 });
                     }
                     
                     if (daySchedule.open && daySchedule.close) {
                         workingStart = daySchedule.open;
                         workingEnd = daySchedule.close;
                         console.log(`Working hours set to: ${workingStart} - ${workingEnd}`);
                     }
                }
            }
        }
        
        console.log(`Generating slots for ${workingStart} to ${workingEnd} with duration ${service.duration}`);

        const appointments = await prisma.appointment.findMany({
            where: {
                businessId,
                staffId: staffId ?? undefined,
                date: new Date(date)
            },
            select: {
                startTime: true,
                endTime: true
            }
        });
        console.log("appointment: ",appointments)

        const normalizedAppointments = appointments.map(a => ({
            startTime: a.startTime.toISOString().slice(11, 16),
            endTime: a.endTime.toISOString().slice(11, 16)
        }));
        console.log("normalAppointment: ",normalizedAppointments)

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
