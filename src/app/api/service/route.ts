import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        const { name, duration, price } = await request.json();
        if(!name || !duration || !price){
            return NextResponse.json({message:"All fields are required"}, {status:400});
        }

        const business = await prisma.business.findFirst({
            where: { providerId: session.user.id },
            select: { id: true }
        })

        if(!business){
            return NextResponse.json({message:"Business not found"}, {status:404});
        }

        const service = await prisma.service.create({
            data: {
                name,
                duration,
                price,
                providerId: session.user.id,
                businessId: business.id//TODO: ADDED businessId HERE, MAY CAUSE ISSUES
            }
        });
        console.log("Service created:", service);
        return NextResponse.json({message: "Service created successfully", service}, {status:201});
    } catch (error) {
        console.error("Error in creating service:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status:500});
    }
}

export async function GET() {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        const services = await prisma.service.findMany({
            where: { providerId: session.user.id  } 
        });
        return NextResponse.json({services}, {status:200});
    } catch (error) {
        console.error("Error in fetching services:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status:500});
    }
}