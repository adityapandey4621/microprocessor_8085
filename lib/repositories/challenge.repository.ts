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
  }) {
    const { userId, challengeId, code, score = 100 } = data

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
        },
        create: {
          userId,
          challengeId,
          completedAt: new Date(),
          score,
          code: code || null,
        },
      })

      if (isFirstCompletion) {
        // Increment user statistics inside the same transaction
        await tx.userStats.upsert({
          where: { userId },
          update: {
            challengesSolved: { increment: 1 },
            xp: { increment: score },
            lastActive: new Date(),
          },
          create: {
            userId,
            challengesSolved: 1,
            xp: score,
            lastActive: new Date(),
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
