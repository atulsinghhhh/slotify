import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Added GET method
export async function GET(request: NextRequest, { params }: { params: Promise<{ serviceId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }
        const { serviceId } = await params;
        const service = await prisma.service.findUnique({
            where: { id: serviceId, providerId: session.user.id }
        });
        if(!service) return NextResponse.json({message: "Service not found"}, {status: 404});

        return NextResponse.json(service, {status:200});
    } catch (error) {
        console.error("Error fetching service:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status:500});
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ serviceId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        // TODO: check if the service belongs to the provider

        const { serviceId } = await params;
        const { name, duration, price } = await request.json();
        if(!name || !duration || !price){
            return NextResponse.json({message:"All fields are required"}, {status:400});
        }
        const service = await prisma.service.updateMany({
            where: { id: serviceId, providerId: session.user.id },
            data: { name, duration, price }
        });

        console.log("Service updated:", service);
        return NextResponse.json({message: "Service updated successfully", service}, {status:200});
    } catch (error) {
        console.error("Error in updating service:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status:500});
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ serviceId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        const { serviceId } = await params;
        const service = await prisma.service.deleteMany({
            where: { id: serviceId, providerId: session.user.id }
        });

        console.log("deleted successfully");
        return NextResponse.json({message: "Service deleted successfully", service}, {status:200});

    } catch (error) {
        console.error("Error in deleting service:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status:500});
    }
}
