import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ appointmentId: string }> }) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "provider") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { appointmentId } = await params;
        if (!appointmentId) {
            return NextResponse.json({ message: "Appointment ID is required" }, { status: 400 });
        }

        const { status } = await request.json();
        if (!status) {
            return NextResponse.json({ message: "Status is required" }, { status: 400 });
        }

        // Verify the appointment belongs to the provider's business
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            select: { providerId: true }
        });

        if (!appointment || appointment.providerId !== session.user.id) {
            return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status }
        });

        return NextResponse.json(updatedAppointment, { status: 200 });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
