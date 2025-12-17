import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";


export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, staffId, date, startTime } = await request.json();

    if (!serviceId || !date || !startTime) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        duration: true,
        businessId: true,
        providerId: true
      }
    });

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    const { duration, businessId, providerId } = service;

    if (staffId) {
      const staff = await prisma.staff.findFirst({
        where: {
          id: staffId,
          businessId,
          active: true,
          services: { some: { id: serviceId } }
        }
      });

      if (!staff) {
        return NextResponse.json(
          { message: "Staff not available for this service" },
          { status: 404 }
        );
      }
    }

    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const toTime = (m: number) =>
      `${Math.floor(m / 60).toString().padStart(2, "0")}:${(m % 60)
        .toString()
        .padStart(2, "0")}`;

    const startMinutes = toMinutes(startTime);
    const endTime = toTime(startMinutes + duration);

    // ✅ Correct overlap check
    const overlapping = await prisma.appointment.findFirst({
      where: {
        businessId,
        staffId: staffId ?? undefined,
        date: new Date(date),
        startTime: {
          lt: new Date(`${date}T${endTime}:00`)
        },
        endTime: {
          gt: new Date(`${date}T${startTime}:00`)
        }
      }
    });

    if (overlapping) {
      return NextResponse.json(
        { message: "Time slot already booked" },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        providerId,
        serviceId,
        customerId: session.user.id,
        ...(staffId ? { staffId } : {}),
        date: new Date(date),
        startTime: new Date(`${date}T${startTime}:00`),
        endTime: new Date(`${date}T${endTime}:00`),
        status: "BOOKED"
      }
    });

    return NextResponse.json(
      { message: "Appointment booked successfully", appointment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error booking appointment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function GET(){
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const appointments = await prisma.appointment.findMany({
            where: { providerId: session.user.id },
            include: {
                customer: {
                    select: { id: true, name: true, email: true }
                },
                service: {
                    select: { id: true, name: true }
                },
                staff: {
                    select: { id: true, user: { select: { name: true } } }
                }
            },
            orderBy: { date: "asc" }
        });
        
        // Map staff data to flatten the structure
        const formattedAppointments = appointments.map(apt => ({
            ...apt,
            staff: apt.staff ? { name: apt.staff.user.name } : null
        }));
        
        return NextResponse.json(formattedAppointments, {status: 200});
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
  }