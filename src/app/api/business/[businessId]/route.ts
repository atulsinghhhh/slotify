import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { businessId: string } }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const { businessId } = params;
        const business = await prisma.business.findUnique({ where: { id: businessId } });
        if (!business || business.providerId !== session.user.id) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }
        return NextResponse.json(business, { status: 200 });
    } catch (error) {
        console.error("Error fetching business:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}

export async function PUT(request: NextRequest, { params }: { params : { businessId: string } }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const { businessId } = params;
        if(!businessId){
            return NextResponse.json({message: "Business ID is required"}, {status: 400});
        }
        const { name, address, phone, workingHours } = await request.json();
        if( !name && !address && !phone && !workingHours ){
            return NextResponse.json({message: "At least one field (name, address, phone, workingHours) is required to update"}, {status: 400});
        }

        // Ensure ownership
        const existing = await prisma.business.findUnique({ where: { id: businessId } });
        if (!existing || existing.providerId !== session.user.id) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        const updatedBusiness = await prisma.business.update({
            where: { id: businessId },
            data: { name, address, phone, workingHours }
        });
        return NextResponse.json(updatedBusiness, {status: 200});

    } catch (error) {
        console.error("Error updating business:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: { businessId: string } }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const { businessId } = params;
        const existing = await prisma.business.findUnique({ where: { id: businessId } });
        if (!existing || existing.providerId !== session.user.id) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        await prisma.business.delete({ where: { id: businessId } });
        return NextResponse.json({ message: "Business deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting business:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}