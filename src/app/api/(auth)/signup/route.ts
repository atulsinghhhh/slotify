import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const { name,email,password } = await request.json();
        if(!name || !email || !password){
            return NextResponse.json({message: "Missing required fields"}, {status: 400});
        }
        const exisitingUser = await prisma.user.findUnique({where: {email}});
        if(exisitingUser){
            return NextResponse.json({message: "User already exists"}, {status: 400});
        }
    
        const hashPassword = await bcrypt.hash(password,10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                role: "provider",
                // providered
            }
        });

        return NextResponse.json({message: "User created successfully", user}, {status: 201});
    } catch (error) {
        console.error("Error in signup route:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}
