import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "customer"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const appointments = await prisma.appointment.findMany({
            where: { customerId: session.user.id }
        });
        if(!appointments){
            return NextResponse.json({message: "No appointments found"}, {status: 404});
        }
        return NextResponse.json(appointments, {status: 200});
    } catch (error) {
        console.log("Error fetching appointments: ", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}