import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  if (!token || !email) {
    return NextResponse.redirect(`${appUrl}/auth/signin?error=MissingToken`)
  }

  try {
    // 1. Find the token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    })

    if (!verificationToken) {
      return NextResponse.redirect(`${appUrl}/auth/signin?error=InvalidToken`)
    }

    // 2. Check if expired
    if (new Date() > verificationToken.expires) {
      // Clean it up
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: token,
          },
        },
      })
      return NextResponse.redirect(`${appUrl}/auth/signin?error=TokenExpired`)
    }

    // 3. Mark user as verified
    await prisma.user.update({
      where: { email: email },
      data: { emailVerified: new Date() },
    })

    // 4. Delete the token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    })

    // 5. Redirect to sign in with success
    return NextResponse.redirect(`${appUrl}/auth/signin?verified=true`)
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.redirect(`${appUrl}/auth/signin?error=VerificationFailed`)
  }
}
