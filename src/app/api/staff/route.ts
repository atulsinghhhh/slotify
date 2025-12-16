import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "provider"){
            return NextResponse.json({message:"Unauthorized"}, {status:401});
        }

        const { name,email,password } = await request.json();

        const existingStaff = await prisma.user.findUnique({
            where: { email }
        });
        const hashedPassword = await bcrypt.hash(password, 10);
        if(existingStaff){
            return NextResponse.json({message:"Staff with this email already exists"}, {status:400});
        }

        const staff = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "staff",
            }
        });

        console.log("Staff created:", staff);
        console.log("Provider creating staff:", session.user.id);

        const buiness = await prisma.business.findFirst({
            where: { providerId: session.user.id },
            select: { id: true }
        });
        if(!buiness){
            return NextResponse.json({message: "failed"},{status: 401});
        }

        const staffProfile = await prisma.staff.create({
            data: {
                userId: staff.id,
                providerId: session.user.id,
                businessId: buiness.id,
                workingHours: "09:00 - 17:00",
                active: true,
            }
        });
        console.log("Staff profile created:", staffProfile);

        return NextResponse.json({message:"Staff created successfully", staff}, {status:201});
    } catch (error) {
        console.error("Error creating staff:", error);
        return NextResponse.json({message:"Internal Server Error"}, {status:500});
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get("businessId");
        const serviceId = searchParams.get("serviceId");

        if (!businessId && !serviceId) {
        return NextResponse.json(
            { message: "businessId or serviceId is required" },
            { status: 400 }
        );
        }

        await auth(); 

        // Build filter
        const where: Record<string, unknown> = {};
        if (businessId) where.businessId = businessId;
        
        // If filtering by serviceId, we need to check the relation
        if (serviceId) {
            where.services = {
                some: { id: serviceId }
            };
        }
        
        const staff = await prisma.staff.findMany({
        where,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    // image: true
                }
            }
        }
        });
        
        // Transform to flat object for frontend
        const formattedStaff = staff.map((s: unknown) => {
            const staffObj = s as { id: string; user: { name: string; email: string }; workingHours: unknown };
            return {
            id: staffObj.id,
            name: staffObj.user.name,
            email: staffObj.user.email,
            // image: s.user.image,
            workingHours: staffObj.workingHours
        }});

        return NextResponse.json(formattedStaff, { status: 200 });

    } catch (error) {
        console.error("Get staff error:", error);
        return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
        );
    }
}