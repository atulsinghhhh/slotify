import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(){
    try {
        const businesses = await prisma.business.findMany()
        console.log("businesses: ",businesses);

        return NextResponse.json(businesses, {status: 200})
    } catch (error) {
        console.log("Error fetching businesses: ",error)
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}

export async function POST(request: NextRequest){
    try {
        const { name, email, password } = await request.json()
        if(!name || !email || !password){
            return NextResponse.json({message: "Missing required fields"}, {status: 400})
        }

        const existingCustomer = await prisma.customer.findFirst({
            where: { email }
        })
        if(existingCustomer){
            return NextResponse.json({message: "Customer with this email already exists"}, {status: 409})
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newCustomer = await prisma.customer.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "customer",
                phone: ""
            }
        })
        return NextResponse.json(newCustomer, { status: 201 })
    } catch (error) {
        console.log("Error creating customer: ", error)
        return NextResponse.json({message: "Internal Server Error"}, {status: 500} )
    }
}

