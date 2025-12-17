import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET( {Params}: {Params: Promise<{customerId: string}>} ) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "customer"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const { customerId } = await Params;
        if(customerId !== session.user.id){
            return NextResponse.json({message: "Forbidden"}, {status: 403});
        }

        const profile = await prisma.customer.findUnique({
            where: { id: customerId }
        });
        return NextResponse.json(profile, {status: 200});
    } catch (error) {
        console.log("Error fetching customer profile: ", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

export async function PUT(request: NextRequest, {Params}: {Params: Promise<{customerId: string}>}) {
    try {
        const session = await auth();
        if(!session?.user || session.user.role !== "customer"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const { customerId } = await Params;
        if(customerId !== session.user.id){
            return NextResponse.json({message: "Forbidden"}, {status: 403});
        }

        const { name,phone } = await request.json();
        const updatedProfile = await prisma.customer.update({
            where: { id: customerId },
            data: { name, phone }
        });
        console.log("Updated Profile: ", updatedProfile);
        return NextResponse.json({message: "Profile updated successfully"}, {status: 200})
    } catch (error) {
        console.log("Error updating customer profile: ", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}