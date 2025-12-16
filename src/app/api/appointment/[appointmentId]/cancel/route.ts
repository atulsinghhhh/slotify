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

        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: "CANCELED" }
        });
        return NextResponse.json(updatedAppointment, {status: 200});
    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}