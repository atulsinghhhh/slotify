import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET( _req: NextRequest,{params}: {params: Promise<{ businessId: string }>}){
    try {
        const { businessId } = await params;
        if(!businessId){
            return NextResponse.json({message: "Missing businessId in route"}, {status: 400});
        }
        console.log("businessId: ", businessId);

        const business = await prisma.business.findUnique({
            where: { id: businessId }
        });

        const service = await prisma.service.findMany({
            where: { businessId: businessId }
        });
        
        console.log("business: ",business);
        console.log("hello world");
        console.log("service: ", service);
        return NextResponse.json(service, {status: 200})
    } catch (error) {
        console.log("Error fetching business: ",error)
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}