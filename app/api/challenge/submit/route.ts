import { NextResponse } from "next/server"
import { Assembler8085 } from "@/lib/assembler"
import { Emulator8085 } from "@/lib/emulator"
import { z } from "zod"

const submitSchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().min(1).max(10000),
})

interface TestCase {
  name: string
  setup: (emu: Emulator8085) => void
  assert: (emu: Emulator8085) => { passed: boolean; message: string }
}

const CHALLENGES: Record<string, { title: string; testCases: TestCase[] }> = {
  "add-two-numbers": {
    title: "Add Two Numbers (B + C -> A)",
    testCases: [
      {
        name: "Test 1: 0x25 + 0x3A = 0x5F",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0x25
          state.registers.C = 0x3a
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0x5f
          return {
            passed,
            message: passed
              ? "Correct: A is 0x5F"
              : `Expected A = 0x5F, got 0x${state.registers.A.toString(16).toUpperCase()}`,
          }
        },
      },
      {
        name: "Test 2: 0xFF + 0x01 = 0x00 with Carry",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0xff
          state.registers.C = 0x01
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0x00 && state.flags.CY === 1
          return {
            passed,
            message: passed
              ? "Correct: A is 0x00 and CY is 1"
              : `Expected A = 0x00 (CY=1), got A = 0x${state.registers.A.toString(16).toUpperCase()} (CY=${state.flags.CY})`,
          }
        },
      },
    ],
  },
  "memory-store": {
    title: "Store 0x99 at Memory Address 0x2050",
    testCases: [
      {
        name: "Test 1: Store value at 0x2050",
        setup: (emu) => {
          emu.setMemory(0x2050, 0x00)
        },
        assert: (emu) => {
          const val = emu.getMemory(0x2050)
          const passed = val === 0x99
          return {
            passed,
            message: passed
              ? "Correct: Value at 0x2050 is 0x99"
              : `Expected 0x99 at address 0x2050, got 0x${val.toString(16).toUpperCase()}`,
          }
        },
      },
    ],
  },
  "mask-lower-nibble": {
    title: "Mask Lower Nibble of A (A AND 0xF0)",
    testCases: [
      {
        name: "Test 1: 0xAB -> 0xA0",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.A = 0xab
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0xa0
          return {
            passed,
            message: passed
              ? "Correct: A is 0xA0"
              : `Expected A = 0xA0, got 0x${state.registers.A.toString(16).toUpperCase()}`,
          }
        },
      },
    ],
  },
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = submitSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { challengeId, code } = result.data
    const challenge = CHALLENGES[challengeId]

    if (!challenge) {
      return NextResponse.json(
        { error: `Challenge '${challengeId}' not found` },
        { status: 404 }
      )
    }

    // 1. Assemble code
    const assembler = new Assembler8085()
    const asmResult = assembler.assemble(code)

    if (asmResult.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          challengeId,
          score: 0,
          error: "Assembly failed",
          details: asmResult.errors,
        },
        { status: 400 }
      )
    }

    // 2. Run Test Cases
    const testResults = []
    let testsPassed = 0
    let totalCycles = 0

    for (const testCase of challenge.testCases) {
      const emu = new Emulator8085()
      emu.loadProgram(asmResult.machineCode, asmResult.instructions[0]?.address || 0x2000)

      // Setup initial state
      testCase.setup(emu)

      // Run until halted or max cycles
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
    }

    const score = Math.round((testsPassed / challenge.testCases.length) * 100)

    return NextResponse.json({
      success: true,
      challengeId,
      title: challenge.title,
      score,
      testsPassed,
      totalTests: challenge.testCases.length,
      executionCycles: totalCycles,
      testResults,
    })
  } catch (err: any) {
    console.error("Challenge grading error:", err)
    return NextResponse.json(
      { error: err?.message || "Grader runtime error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const list = Object.entries(CHALLENGES).map(([id, item]) => ({
    id,
    title: item.title,
    testCasesCount: item.testCases.length,
  }))

  return NextResponse.json({ challenges: list })
}
