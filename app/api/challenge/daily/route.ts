import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const redisKey = `daily_challenge:${today.getTime()}`

    // 1. Try to get from Redis Cache first
    if (redis) {
      const cached = await redis.get(redisKey)
      if (cached) {
        return NextResponse.json({ daily: cached })
      }
    }

    // 2. Check if we already have a daily challenge for today in Postgres
    let daily = await prisma.dailyChallenge.findUnique({
      where: { date: today },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            topic: true,
            description: true,
          }
        }
      }
    })

    if (!daily) {
      // Pick a random challenge that hasn't been used recently (or at all)
      const usedDailies = await prisma.dailyChallenge.findMany({
        select: { challengeId: true }
      })
      const usedIds = usedDailies.map(d => d.challengeId)

      const availableChallenges = await prisma.challenge.findMany({
        where: {
          id: { notIn: usedIds }
        },
        select: { id: true }
      })

      let selectedChallengeId: string;

      if (availableChallenges.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableChallenges.length)
        selectedChallengeId = availableChallenges[randomIndex].id
      } else {
        // If all have been used, just pick a completely random one from all challenges
        const allChallenges = await prisma.challenge.findMany({ select: { id: true } })
        if (allChallenges.length === 0) {
            return NextResponse.json({ error: "No challenges available" }, { status: 404 })
        }
        const randomIndex = Math.floor(Math.random() * allChallenges.length)
        selectedChallengeId = allChallenges[randomIndex].id
      }

      daily = await prisma.dailyChallenge.create({
        data: {
          date: today,
          challengeId: selectedChallengeId
        },
        include: {
          challenge: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              topic: true,
              description: true,
            }
          }
        }
      })
    }

    // 3. Cache the result in Redis with expiration at midnight
    if (redis && daily) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const secondsToMidnight = Math.floor((tomorrow.getTime() - Date.now()) / 1000)
      if (secondsToMidnight > 0) {
        await redis.setex(redisKey, secondsToMidnight, JSON.stringify(daily))
      }
    }

    return NextResponse.json({ daily })
  } catch (error) {
    console.error("Daily Challenge Error:", error)
    return NextResponse.json({ error: "Failed to fetch daily challenge" }, { status: 500 })
  }
}
