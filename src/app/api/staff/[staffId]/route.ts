import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ staffId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        const { staffId } = await params;
        const staffProfile = await prisma.staff.findUnique({
            where: {
                id: staffId,
                providerId: session.user.id
            },
            include: {
                user: true,
                services: true
            }
        });
        console.log("Fetched staff profile:", staffProfile);
        return NextResponse.json(staffProfile, {status:200});
    } catch (error) {
        console.error("Error fetching staff profile:", error);
        return NextResponse.json({message:"Internal Server Error"}, {status:500});
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ staffId: string }> }) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        const { staffId } = await params;
        const { workingHours } = await request.json();

        const staffProfile = await prisma.staff.updateMany({
            where: {
                id: staffId,
                providerId: session.user.id
            },
            data: {
                workingHours
            }
        });
        return NextResponse.json({message:"Staff updated successfully", staffProfile}, {status:200});
    } catch (error) {
        console.error("Error updating staff:", error);
        return NextResponse.json({message:"Internal Server Error"}, {status:500});
    }
}

// export async function DELETE(request: NextRequest, { params }: { params: Promise<{ staffId: string }> }) {
//     try {
//         // Delete staff logic to be implemented here & active should be set to false
//     } catch (error) {
        
//     }
// }