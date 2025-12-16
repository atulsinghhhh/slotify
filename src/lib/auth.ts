import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : null
        const password = typeof credentials?.password === "string" ? credentials.password : null
        if (!email || !password) return null

        // 1️⃣ Try users table (staff/provider)
        const user = await prisma.user.findFirst({
          where: { email },
        })

        if (user?.password) {
          const valid = await bcrypt.compare(password, user.password)
          if (!valid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }

        // 2️⃣ Fallback to customers table
        const customer = await prisma.customer.findFirst({
          where: { email },
        })

        if (!customer?.password) return null

        const validCustomer = await bcrypt.compare(password, customer.password)
        if (!validCustomer) return null

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          role: "customer",
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name ?? user.email!,
                role: "customer",
              },
            })
          }

          return true
        } catch (error) {
          console.error("Google sign-in error:", error)
          return false
        }
      }

      return true
    },

    async jwt({ token, user, account }) {
      if (user && account) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role

          const business = await prisma.business.findFirst({
            where: { providerId: dbUser.id },
            select: { id: true },
          })

          token.businessId = business?.id ?? null
        } else {
          const customer = await prisma.customer.findFirst({
            where: { email: user.email! },
          })

          if (customer) {
            token.id = customer.id
            token.role = "customer"
            token.businessId = null
          }
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.businessId = token.businessId as string | null
      }
      return session
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
})
