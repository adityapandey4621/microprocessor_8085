import { prisma } from "@/lib/prisma"

export class ChallengeRepository {
  async getUserProgress(userId: string) {
    return prisma.challengeProgress.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
    })
  }

  async getByUserAndChallenge(userId: string, challengeId: string) {
    return prisma.challengeProgress.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
    })
  }

  async upsertProgress(data: {
    userId: string
    challengeId: string
    code?: string
    score?: number
    difficulty?: string
    executionTimeMs?: number
    executionCycles?: number
  }) {
    const { userId, challengeId, code, score = 100, difficulty = 'Easy', executionTimeMs = 0, executionCycles = 0 } = data

    return prisma.$transaction(async (tx) => {
      const existing = await tx.challengeProgress.findUnique({
        where: {
          userId_challengeId: { userId, challengeId },
        },
      })

      const isFirstCompletion = !existing

      const progress = await tx.challengeProgress.upsert({
        where: {
          userId_challengeId: { userId, challengeId },
        },
        update: {
          completedAt: new Date(),
          score: Math.max(existing?.score || 0, score),
          code: code || existing?.code,
          executionTimeMs: executionTimeMs || existing?.executionTimeMs || 0,
          executionCycles: executionCycles || existing?.executionCycles || 0,
        },
        create: {
          userId,
          challengeId,
          completedAt: new Date(),
          score,
          code: code || null,
          executionTimeMs,
          executionCycles,
        },
      })

      if (isFirstCompletion && score === 100) { // Only assign points for 100% score
        let basePoints = 2
        if (difficulty === 'Medium') basePoints = 3
        else if (difficulty === 'Hard') basePoints = 5

        // Check if this is the daily challenge
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dailyChallenge = await tx.dailyChallenge.findUnique({ where: { date: today } })
        const isDaily = dailyChallenge?.challengeId === challengeId

        // Calculate Hex Score based on streak, solved count, and AI usage
        const userStats = await tx.userStats.findUnique({ where: { userId } })
        const aiUsage = await tx.aIUsage.findUnique({ where: { userId } })
        
        const currentStreak = userStats?.streakDays || 0;
        const totalSolved = userStats?.challengesSolved || 0;
        const aiCount = aiUsage?.count || 0;
        
        const streakBonus = Math.min(5, Math.floor(currentStreak / 2));
        const solvedBonus = Math.min(10, Math.floor(totalSolved / 10));
        const aiPenalty = Math.min(basePoints - 1, Math.floor(aiCount * 0.5));

        let hexScore = Math.max(1, basePoints + streakBonus + solvedBonus - aiPenalty);
        if (isDaily) {
           hexScore += 10 // Brownie points!
        }

        // Update streak logic
        const now = new Date()
        let newStreak = currentStreak
        if (userStats?.lastActive) {
          const lastActiveDate = new Date(userStats.lastActive)
          const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime())
          const diffDays = Math.floor(diffTime / (1000 * 3600 * 24))
          
          if (diffDays === 1) {
            newStreak += 1
          } else if (diffDays > 1) {
            newStreak = 1
          } else if (diffDays === 0 && currentStreak === 0) {
             newStreak = 1
          }
        } else {
          newStreak = 1 // First time solving
        }

        // Badges logic
        const existingBadges = userStats?.badges || []
        const newBadges = [...existingBadges]
        
        if (newStreak >= 3 && !newBadges.includes("3_day_streak")) newBadges.push("3_day_streak")
        if (newStreak >= 7 && !newBadges.includes("7_day_streak")) newBadges.push("7_day_streak")
        if (totalSolved + 1 >= 5 && !newBadges.includes("5_challenges")) newBadges.push("5_challenges")
        if (totalSolved + 1 >= 25 && !newBadges.includes("25_challenges")) newBadges.push("25_challenges")
        if (isDaily && !newBadges.includes("first_daily")) newBadges.push("first_daily")

        // Increment user statistics inside the same transaction
        await tx.userStats.upsert({
          where: { userId },
          update: {
            challengesSolved: { increment: 1 },
            xp: { increment: score },
            rating: { increment: hexScore },
            streakDays: newStreak,
            lastActive: now,
            badges: newBadges,
          },
          create: {
            userId,
            challengesSolved: 1,
            xp: score,
            rating: hexScore,
            streakDays: newStreak,
            lastActive: now,
            badges: newBadges,
          },
        })

        // Emit EventLog for ChallengeCompleted
        await tx.eventLog.create({
          data: {
            userId,
            eventType: "ChallengeCompleted",
            payloadJson: JSON.stringify({
              challengeId,
              score,
              completedAt: progress.completedAt.toISOString(),
            }),
          },
        })
      }

      return { progress, isFirstCompletion }
    })
  }
}

export const challengeRepository = new ChallengeRepository()
