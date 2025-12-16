import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ staffId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        const { staffId } = await params;
        console.log("Adding services to staff with ID:", staffId, "by provider:", session.user.id);
        const staff = await prisma.staff.findFirst({
            where: {
                id: staffId,
                providerId: session.user.id
            }
        });
        console.log("Fetched staff profile for adding services to staff:", staff);
        if(!staff){
            return NextResponse.json({message:"Staff not found"}, {status:404});
        }

        const { services } =  await request.json();
        if(!services){
            return NextResponse.json({message:"No services provided"}, {status:400});
        }
        console.log("Services to be added:", services);

        const updatedStaff = await prisma.staff.update({
            where: {
                id: staffId,
                providerId: session.user.id
            },
            data: {
                services: {
                    set: services.map((id: string) => ({ id })) // TODO: also added the name field here 
                }
            },
            include: { services: true }
        });
        return NextResponse.json({message:"Services added to staff successfully", updatedStaff}, {status:200});
    } catch (error) {
        console.error("Error adding services to staff:", error);
        return NextResponse.json({message:"Internal Server Error"}, {status:500});
    }
}
