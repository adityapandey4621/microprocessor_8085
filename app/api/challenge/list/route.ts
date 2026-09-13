import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    const challenges = await prisma.challenge.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        concepts: true,
        description: true,
        instructions: true,
        starterCode: true,
        sampleSolution: true,
        topic: true
      },
      orderBy: { id: 'asc' }
    })

    let streak = 0
    let userBookmarks: string[] = []

    if (session?.user?.id) {
      const stats = await prisma.userStats.findUnique({
        where: { userId: session.user.id },
        select: { streakDays: true }
      })
      if (stats) {
        streak = stats.streakDays
      }

      const bookmarks = await prisma.challengeBookmark.findMany({
        where: { userId: session.user.id },
        select: { challengeId: true }
      })
      userBookmarks = bookmarks.map(b => b.challengeId)
    }

    const challengesWithBookmarks = challenges.map(c => ({
      ...c,
      isBookmarked: userBookmarks.includes(c.id)
    }))

    return NextResponse.json({ challenges: challengesWithBookmarks, streak })
  } catch (error) {
    console.error("Error fetching challenges:", error)
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}
