import "next-auth"
import "next-auth/jwt"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role 
      phone?: string | null
      businessId?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: Role 
    phone?: string | null
    businessId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role 
    businessId?: string | null
    phone?: string | null
  }
}
