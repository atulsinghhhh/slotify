import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        const business = await prisma.business.findUnique({
            where: {
                providerId: session.user.id
            }
        });

        return NextResponse.json(business,{status:200});
    } catch (error) {
        console.error("Error fetching business:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status:500});
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }
        
        const { name, address, phone, workingHours } = await request.json();
        if(!name){
            return NextResponse.json({message:"Name is required"}, {status:400});
        }

        const business = await prisma.business.create({
            data: {
                name,
                address: address ?? "",
                phone: phone ?? "",
                workingHours: workingHours ?? {},
                providerId: session.user.id
            }
        });

        return NextResponse.json(business, {status:201});
    } catch (error) {
        console.error("Error creating business:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status:500});
    }
}