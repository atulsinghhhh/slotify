import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ appointmentId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "customer"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const { appointmentId } = await params;
        if(!appointmentId){
            return NextResponse.json({message: "Appointment ID is required"}, {status: 400});
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId, customerId: session.user.id }
        });
        if(!appointment){
            return NextResponse.json({message: "Appointment not found"}, {status: 404});
        }
        const { date, startTime } = await request.json();
        if( !date || !startTime ){
            return NextResponse.json({message: "Missing required fields"}, {status: 400});
        }

        // Convert incoming date (YYYY-MM-DD) and time (HH:mm) into Date objects.
        const dateOnly = new Date(`${date}T00:00:00`);
        const startDateTime = new Date(`${date}T${startTime}:00`);

        if (Number.isNaN(dateOnly.getTime()) || Number.isNaN(startDateTime.getTime())) {
            return NextResponse.json({ message: "Invalid date or time format" }, { status: 400 });
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { date: dateOnly, startTime: startDateTime }
        });
        // ToDO: Add notification logic here & added checks availability
        return NextResponse.json(updatedAppointment, {status: 200});
    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}