import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params : Promise<{ businessId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const { businessId } = await params;
        if(!businessId){
            return NextResponse.json({message: "Business ID is required"}, {status: 400});
        }
        const { address, phone, workingHours } = await request.json();
        if( !address && !phone && !workingHours ){
            return NextResponse.json({message: "At least one field (address, phone, workingHours) is required to update"}, {status: 400});
        }
        const updatedBusiness = await prisma.business.update({
            where: { id: businessId, providerId: session.user.id },
            data: { address, phone, workingHours }
        });
        return NextResponse.json(updatedBusiness, {status: 200});

    } catch (error) {
        console.error("Error updating business:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}