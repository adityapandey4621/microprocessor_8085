import { prisma } from "@/lib/prisma"

export class ExecutionRepository {
  async recordExecution(data: {
    userId: string
    codeId?: string | null
    code: string
    registers?: Record<string, number>
    flags?: Record<string, number>
    cycles?: number
    executionTimeMs?: number
    status?: "SUCCESS" | "ERROR"
  }) {
    const {
      userId,
      codeId,
      code,
      registers,
      flags,
      cycles = 0,
      executionTimeMs = 0,
      status = "SUCCESS",
    } = data

    return prisma.$transaction(async (tx) => {
      const history = await tx.executionHistory.create({
        data: {
          userId,
          codeId: codeId || null,
          code,
          registersJson: registers ? JSON.stringify(registers) : null,
          flagsJson: flags ? JSON.stringify(flags) : null,
          cycles,
          executionTimeMs,
          status,
        },
      })

      // Update UserStats within transaction
      await tx.userStats.upsert({
        where: { userId },
        update: {
          totalExecutions: { increment: 1 },
          totalCpuCycles: { increment: cycles },
          xp: { increment: status === "SUCCESS" ? 2 : 0 },
          lastActive: new Date(),
        },
        create: {
          userId,
          totalExecutions: 1,
          totalCpuCycles: cycles,
          xp: status === "SUCCESS" ? 2 : 0,
          lastActive: new Date(),
        },
      })

      return history
    })
  }

  async getUserHistory(userId: string, limit = 20) {
    return prisma.executionHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  }
}

export const executionRepository = new ExecutionRepository()
