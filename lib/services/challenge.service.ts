import { Assembler8085 } from "@/lib/assembler"
import { Emulator8085 } from "@/lib/emulator"
import { CHALLENGES } from "@/lib/challenges"
import { challengeRepository } from "@/lib/repositories/challenge.repository"
import { executionRepository } from "@/lib/repositories/execution.repository"
import { submitChallengeSchema, SubmitChallengeInput } from "@/lib/validations"
import { serializeChallengeProgress, ChallengeProgressDTO } from "@/lib/serializers"
import { NotFoundError, ValidationError } from "@/lib/errors"
import { logger } from "@/lib/logger"

export interface ChallengeSubmissionResult {
  success: boolean
  challengeId: string
  title: string
  score: number
  testsPassed: number
  totalTests: number
  executionCycles: number
  testResults: {
    name: string
    passed: boolean
    message: string
    cycles: number
  }[]
  isNewCompletion?: boolean
  error?: string
  details?: any
}

export class ChallengeService {
  async listChallenges() {
    return Object.entries(CHALLENGES).map(([id, item]) => ({
      id,
      title: item.title,
      description: item.description || "",
      testCasesCount: item.testCases.length,
    }))
  }

  async submitChallenge(
    userId: string | null,
    input: SubmitChallengeInput
  ): Promise<ChallengeSubmissionResult> {
    const parsed = submitChallengeSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || "Invalid challenge submission data")
    }
    const { challengeId, code } = parsed.data

    const challenge = CHALLENGES[challengeId]
    if (!challenge) {
      throw new NotFoundError(`Challenge '${challengeId}' not found`)
    }

    // 1. Assemble code
    const assembler = new Assembler8085()
    const asmResult = assembler.assemble(code)

    if (asmResult.errors.length > 0) {
      return {
        success: false,
        challengeId,
        title: challenge.title,
        score: 0,
        testsPassed: 0,
        totalTests: challenge.testCases.length,
        executionCycles: 0,
        testResults: [],
        error: "Assembly failed",
        details: asmResult.errors,
      }
    }

    // 2. Run Test Cases
    const testResults = []
    let testsPassed = 0
    let totalCycles = 0
    let finalStateRegisters: Record<string, number> = {}
    let finalStateFlags: Record<string, number> = {}

    for (const testCase of challenge.testCases) {
      const emu = new Emulator8085()
      emu.loadProgram(asmResult.machineCode, asmResult.instructions[0]?.address || 0x2000)

      testCase.setup(emu)

      let cycles = 0
      const maxCycles = 50000
      while (!emu.getState().halted && cycles < maxCycles) {
        emu.step()
        cycles++
      }

      totalCycles += cycles
      const assertion = testCase.assert(emu)
      if (assertion.passed) testsPassed++

      testResults.push({
        name: testCase.name,
        passed: assertion.passed,
        message: assertion.message,
        cycles,
      })

      const st = emu.getState()
      finalStateRegisters = { ...st.registers } as unknown as Record<string, number>
      finalStateFlags = { ...st.flags } as unknown as Record<string, number>
    }

    const score = Math.round((testsPassed / challenge.testCases.length) * 100)
    const success = testsPassed === challenge.testCases.length
    let isNewCompletion = false

    // 3. Record in Database if user is authenticated
    if (userId) {
      try {
        await executionRepository.recordExecution({
          userId,
          code,
          registers: finalStateRegisters,
          flags: finalStateFlags,
          cycles: totalCycles,
          executionTimeMs: input.executionTimeMs || 0,
          status: success ? "SUCCESS" : "ERROR",
        })

        if (success) {
          const res = await challengeRepository.upsertProgress({
            userId,
            challengeId,
            code,
            score,
          })
          isNewCompletion = res.isFirstCompletion

          logger.info(`Challenge completed: ${challengeId} by user ${userId}`, {
            userId,
            challengeId,
            score,
            isNewCompletion,
          })
        }
      } catch (err) {
        logger.error("Failed to record challenge progress in DB:", err, { userId, challengeId })
      }
    }

    return {
      success: true,
      challengeId,
      title: challenge.title,
      score,
      testsPassed,
      totalTests: challenge.testCases.length,
      executionCycles: totalCycles,
      testResults,
      isNewCompletion,
    }
  }

  async getUserProgress(userId: string): Promise<ChallengeProgressDTO[]> {
    const list = await challengeRepository.getUserProgress(userId)
    return list.map(serializeChallengeProgress)
  }
}

export const challengeService = new ChallengeService()
