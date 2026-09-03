import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
        sampleSolution: true
      },
      orderBy: { id: 'asc' }
    })

    let streak = 0
    if (session?.user?.id) {
      const stats = await prisma.userStats.findUnique({
        where: { userId: session.user.id },
        select: { streakDays: true }
      })
      if (stats) {
        streak = stats.streakDays
      }
    }

    return NextResponse.json({ challenges, streak })
  } catch (error) {
    console.error("Error fetching challenges:", error)
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}
