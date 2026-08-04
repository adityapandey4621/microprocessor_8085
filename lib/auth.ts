import { NextAuthOptions, DefaultSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authService } from "@/lib/services/auth.service"
import { logger } from "@/lib/logger"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      username?: string | null
    } & DefaultSession["user"]
  }
}

const providers: NextAuthOptions["providers"] = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      usernameOrEmail: { label: "Username or Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.usernameOrEmail || !credentials?.password) {
        throw new Error("Missing credentials")
      }

      try {
        const user = await authService.verifyCredentials(
          credentials.usernameOrEmail,
          credentials.password
        )

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
          role: user.role,
        } as any
      } catch (error: any) {
        logger.error("Authentication failed during authorize:", error, {
          userIdentifier: credentials.usernameOrEmail,
        })
        throw error
      }
    },
  })
)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        // @ts-ignore
        token.role = user.role || "USER"
        // @ts-ignore
        token.username = user.username
      }
      if (trigger === "update" && session?.username) {
        token.username = session.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // @ts-ignore
        session.user.role = token.role as string
        // @ts-ignore
        session.user.username = token.username as string | null
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
