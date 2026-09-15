import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decryptPayload } from "@/lib/services/crypto.service"
import { logger } from "@/lib/logger"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  if (!token) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=MissingToken`)
  }

  try {
    // 1. Decrypt the token payload
    const payload = decryptPayload<{
      name: string
      username: string
      email: string
      hashedPassword: string
      expiresAt: number
    }>(token)

    // 2. Check if expired
    if (Date.now() > payload.expiresAt) {
      return NextResponse.redirect(`${appUrl}/auth/signin?error=TokenExpired`)
    }

    // 3. Check if email or username was taken while they were pending
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: payload.email },
          { username: payload.username }
        ]
      }
    })

    if (existingUser) {
      // If it exists but is already verified, that means they clicked it twice or signed up twice
      if (existingUser.email === payload.email && existingUser.emailVerified) {
        return NextResponse.redirect(`${appUrl}/auth/signin?verified=true`)
      }
      return NextResponse.redirect(`${appUrl}/auth/signin?error=VerificationFailed`)
    }

    // 4. Finally create the verified user in the database
    const newUser = await prisma.user.create({
      data: {
        name: payload.name,
        username: payload.username,
        email: payload.email,
        password: payload.hashedPassword,
        emailVerified: new Date(), // Mark as verified immediately
      }
    })

    logger.info(`Delayed user creation completed for verified email: ${newUser.email}`)

    // 5. Redirect to sign in with success
    return NextResponse.redirect(`${appUrl}/auth/signin?verified=true`)
  } catch (error) {
    logger.error("Verification error (stateless):", error)
    return NextResponse.redirect(`${appUrl}/auth/signin?error=InvalidToken`)
  }
}
