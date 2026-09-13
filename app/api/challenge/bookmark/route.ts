import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { challengeId, action } = body

    if (!challengeId || !action) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 })
    }

    if (action === 'add') {
      await prisma.challengeBookmark.upsert({
        where: {
          userId_challengeId: {
            userId: session.user.id,
            challengeId: challengeId
          }
        },
        create: {
          userId: session.user.id,
          challengeId: challengeId
        },
        update: {}
      })
    } else if (action === 'remove') {
      await prisma.challengeBookmark.deleteMany({
        where: {
          userId: session.user.id,
          challengeId: challengeId
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Bookmark Error:", error)
    // Prisma P2003: Foreign key constraint failed
    if (error.code === 'P2003' && error.message.includes('userId')) {
      return NextResponse.json({ success: false, error: "Invalid session user" }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
