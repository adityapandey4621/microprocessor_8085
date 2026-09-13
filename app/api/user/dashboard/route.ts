import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, name: true, image: true, role: true, bio: true, country: true }
    })

    const stats = await prisma.userStats.findUnique({
      where: { userId }
    })

    // Get submissions for heatmap (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const submissions = await prisma.challengeProgress.findMany({
      where: { 
        userId,
        completedAt: { gte: sixMonthsAgo }
      },
      select: { completedAt: true, score: true }
    })

    // Calculate Global Rank (Count users with higher rating)
    const higherRatedUsers = await prisma.userStats.count({
      where: {
        rating: { gt: stats?.rating || 0 }
      }
    })
    const globalRank = higherRatedUsers + 1

    // Dummy country rank (we don't have country info in db yet)
    const countryRank = Math.max(1, Math.floor(globalRank * 0.8))

    const aiUsage = await prisma.aIUsage.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      user,
      stats,
      aiUsage,
      submissions,
      ranks: {
        global: globalRank,
        country: countryRank
      }
    })
  } catch (error) {
    console.error("Dashboard Error:", error)
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 })
  }
}
