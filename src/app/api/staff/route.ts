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
                workingHours: "9am - 5pm",
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

    if (!businessId) {
      return NextResponse.json(
        { message: "businessId is required" },
        { status: 400 }
      );
    }

    // Public read access (MVP)
    await auth(); // optional session check

    const staff = await prisma.staff.findMany({
      where: { businessId },
      select: {
        id: true,
        // name: true,
        workingHours: true
      }
    });

    return NextResponse.json(staff, { status: 200 });

  } catch (error) {
    console.error("Get staff error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}