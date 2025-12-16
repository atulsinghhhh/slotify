import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Correct App Router handler signature: (req, { params })
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ businessId: string }> }
) {
    try {
        // Prefer App Router params; fall back to parsing from URL
        const { businessId } = await params;

        console.log("hello world");
        console.log("businessId: ", businessId);

        if (!businessId) {
            return NextResponse.json({ message: "Missing businessId in route" }, { status: 400 });
        }
        const business = await prisma.business.findUnique({
            where: { id: businessId }
        });

        if(!business){
            return NextResponse.json({message: "Business not found"}, {status: 404});
        }
        console.log("business: ",business);

        return NextResponse.json(business, {status: 200})
    } catch (error) {
        console.log("Error fetching business: ", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}