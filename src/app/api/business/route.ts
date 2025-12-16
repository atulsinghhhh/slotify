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

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }
        
        const { name,address,phone,workingHours } = await request.json();
        if(!name || !address || !phone || !workingHours){
            return NextResponse.json({message:"All fields are required"}, {status:400});
        }

        const business = await prisma.business.create({
            data: {
                name,
                address,
                phone,
                workingHours,
                providerId: session.user.id
            }
        });

        console.log("Business created:", business);

        return NextResponse.json({message: "Business created successfully", business}, {status:201});
    } catch (error) {
        console.error("Error creating business:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status:500});
    }
}