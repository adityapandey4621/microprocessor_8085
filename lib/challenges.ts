import { Emulator8085 } from "@/lib/emulator"

export interface TestCase {
  name: string
  setup: (emu: Emulator8085) => void
  assert: (emu: Emulator8085) => { passed: boolean; message: string }
}

export interface ChallengeDefinition {
  title: string
  description?: string
  testCases: TestCase[]
}

export const CHALLENGES: Record<string, ChallengeDefinition> = {
  "add-two-numbers": {
    title: "Add Two Numbers (B + C -> A)",
    description: "Write an 8085 assembly program that adds register B and register C, storing the sum in A.",
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
    description: "Write an instruction sequence to store constant 0x99 at memory location 0x2050.",
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
    description: "Write an instruction sequence that masks out the lower nibble of register A (logical AND with 0xF0).",
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
