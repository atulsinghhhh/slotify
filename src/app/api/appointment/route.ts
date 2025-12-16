import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";


export async function POST(request: NextRequest){
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "customer"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const { serviceId,staffId,date, startTime } = await request.json();

        if( !serviceId || !date || !startTime ){
            return NextResponse.json({message: "Missing required fields"}, {status: 400});
        }

        const services = await prisma.service.findUnique({
            where: { id: serviceId },
            select: {
                id: true,
                duration: true,
                businessId: true,
                providerId: true
            }
        });
        if(!services){
            return NextResponse.json({message: "Service not found"}, {status: 404});
        }

        const { businessId,providerId,duration } = services;
        let staff = null;

        if(staffId){
            staff = await prisma.staff.findFirst({
                where: {
                    id: staffId,
                    businessId,
                    active: true,
                    services: {
                        some: { id: serviceId }
                    }
                }
            });

            if(!staff){
                return NextResponse.json({message: "Staff not found or does not provide the selected service"}, {status: 404});
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

        const overlapping = await prisma.appointment.findFirst({
            where: {
                businessId,
                staffId: staffId ?? undefined,
                date,
                NOT: {
                    OR: [
                        { endTime: { lte: startTime } },
                        { startTime: { gte: endTime } }
                    ]
                }
            }
        });

        if (overlapping) {
            return NextResponse.json( { message: "Time slot already booked" }, { status: 409 });
        }

        const appointment = await prisma.appointment.create({
            data: {
                businessId,
                providerId,
                serviceId,
                staffId,
                customerId: session.user.id,
                date,
                startTime,
                endTime,
                status: "BOOKED"
            }
        });
        return NextResponse.json( {message: "Appointment booked successfully", appointment}, { status: 201 } );
    } catch (error) {
        console.error("Error booking appointment:", error);
        return NextResponse.json( { message: "Internal Server Error" }, { status: 500 } );
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
            orderBy: { date: "asc" }
        });
        if(!appointments){
            return NextResponse.json({message: "No appointments found"}, {status: 404});
        }
        return NextResponse.json(appointments, {status: 200});
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}