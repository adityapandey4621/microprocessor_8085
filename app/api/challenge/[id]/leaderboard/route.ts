import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const leaderboard = await prisma.challengeProgress.findMany({
      where: {
        challengeId: id,
        score: 100, // Only count perfect scores
      },
      orderBy: [
        { executionCycles: 'asc' }, // Order by CPU cycles first
        { executionTimeMs: 'asc' }, // Then by wall-clock time
        { completedAt: 'asc' },     // Then by who did it first
      ],
      take: 50,
      include: {
        user: {
          select: {
            username: true,
            name: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
