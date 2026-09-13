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

    const stats = await prisma.userStats.findUnique({
      where: { userId },
      select: { streakDays: true }
    })

    return NextResponse.json({ streakDays: stats?.streakDays || 0 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load streak" }, { status: 500 })
  }
}
