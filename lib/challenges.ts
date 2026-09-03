import { Emulator8085 } from "@/lib/emulator"

export interface TestCase {
  name: string
  setup: (emu: Emulator8085) => void
  assert: (emu: Emulator8085) => { passed: boolean; message: string }
}

export interface ChallengeDefinition {
  title: string
  description?: string
  optimalCycles: number
  testCases: TestCase[]
}

export const CHALLENGES: Record<string, ChallengeDefinition> = {
  "Add Two Numbers": {
    title: "Add Two Numbers",
    description: "Write an 8085 assembly program that adds register B and register C, storing the sum in A.",
    optimalCycles: 14,
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
            message: passed ? "Correct: A is 0x5F" : `Expected A = 0x5F, got 0x${state.registers.A.toString(16).toUpperCase()}`,
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
            message: passed ? "Correct: A is 0x00 and CY is 1" : `Expected A = 0x00 (CY=1), got A = 0x${state.registers.A.toString(16).toUpperCase()} (CY=${state.flags.CY})`,
          }
        },
      },
    ],
  },
  "Subtract Two Numbers": {
    title: "Subtract Two Numbers",
    description: "Write an 8085 assembly program to subtract the contents of register C from register B. Store the result in accumulator A.",
    optimalCycles: 14,
    testCases: [
      {
        name: "Test 1: 0x08 - 0x03 = 0x05",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0x08
          state.registers.C = 0x03
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0x05
          return {
            passed,
            message: passed ? "Correct: A is 0x05" : `Expected A = 0x05, got 0x${state.registers.A.toString(16).toUpperCase()}`,
          }
        },
      },
      {
        name: "Test 2: 0x05 - 0x08 (Negative, borrow flag)",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0x05
          state.registers.C = 0x08
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0xfd && state.flags.CY === 1
          return {
            passed,
            message: passed ? "Correct: A is 0xFD with Carry (Borrow)" : `Expected A = 0xFD (CY=1), got A = 0x${state.registers.A.toString(16).toUpperCase()} (CY=${state.flags.CY})`,
          }
        },
      }
    ],
  },
  "Multiply by 2": {
    title: "Multiply by 2",
    description: "Write an 8085 assembly program to multiply the contents of register B by 2. Store the result in accumulator A.",
    optimalCycles: 14,
    testCases: [
      {
        name: "Test 1: 0x04 * 2 = 0x08",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0x04
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0x08
          return {
            passed,
            message: passed ? "Correct: A is 0x08" : `Expected A = 0x08, got 0x${state.registers.A.toString(16).toUpperCase()}`,
          }
        },
      },
      {
        name: "Test 2: 0x80 * 2 = 0x00 (Carry 1)",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0x80
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0x00 && state.flags.CY === 1
          return {
            passed,
            message: passed ? "Correct: A is 0x00 with Carry" : `Expected A = 0x00 (CY=1), got A = 0x${state.registers.A.toString(16).toUpperCase()} (CY=${state.flags.CY})`,
          }
        },
      }
    ],
  },
  "Swap Two Registers": {
    title: "Swap Two Registers",
    description: "Write an 8085 assembly program to swap the contents of register B and register C.",
    optimalCycles: 18,
    testCases: [
      {
        name: "Test 1: Swap 0x12 and 0x34",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0x12
          state.registers.C = 0x34
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.B === 0x34 && state.registers.C === 0x12
          return {
            passed,
            message: passed ? "Correct: B is 0x34, C is 0x12" : `Expected B=0x34, C=0x12. Got B=0x${state.registers.B.toString(16).toUpperCase()}, C=0x${state.registers.C.toString(16).toUpperCase()}`,
          }
        },
      }
    ]
  },
  "Find Maximum of Two Numbers": {
    title: "Find Maximum of Two Numbers",
    description: "Compare the values in register B and register C. Store the larger of the two values in the accumulator A.",
    optimalCycles: 28,
    testCases: [
      {
        name: "Test 1: B > C (0x50 > 0x20)",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0x50
          state.registers.C = 0x20
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0x50
          return { passed, message: passed ? "Correct: A is 0x50" : `Expected A=0x50, got 0x${state.registers.A.toString(16).toUpperCase()}` }
        },
      },
      {
        name: "Test 2: C > B (0x10 < 0x90)",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0x10
          state.registers.C = 0x90
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0x90
          return { passed, message: passed ? "Correct: A is 0x90" : `Expected A=0x90, got 0x${state.registers.A.toString(16).toUpperCase()}` }
        }
      }
    ]
  },
  "Mask Lower Nibble": {
    title: "Mask Lower Nibble",
    description: "Write a program to clear (set to 0) the lower 4 bits (nibble) of register B, and store the result in accumulator A.",
    optimalCycles: 18,
    testCases: [
      {
        name: "Test 1: 0xAB -> 0xA0",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0xab
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0xa0
          return { passed, message: passed ? "Correct: A is 0xA0" : `Expected A=0xA0, got 0x${state.registers.A.toString(16).toUpperCase()}` }
        }
      }
    ]
  },
  "Find 1s Complement": {
    title: "Find 1s Complement",
    description: "Write an 8085 program to find the 1's complement of the data in register B. Store the result in accumulator A.",
    optimalCycles: 14,
    testCases: [
      {
        name: "Test 1: Complement 0x55 (01010101)",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0x55
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.A === 0xaa
          return { passed, message: passed ? "Correct: A is 0xAA" : `Expected A=0xAA, got 0x${state.registers.A.toString(16).toUpperCase()}` }
        }
      }
    ]
  },
  "Add 16-bit Numbers": {
    title: "Add 16-bit Numbers",
    description: "Write an 8085 program to add the 16-bit number in the BC register pair to the 16-bit number in the HL register pair. Store the result in the HL pair.",
    optimalCycles: 16,
    testCases: [
      {
        name: "Test 1: 0x1000 + 0x0500 = 0x1500",
        setup: (emu) => {
          const state = emu.getState()
          state.registers.B = 0x10
          state.registers.C = 0x00
          state.registers.H = 0x05
          state.registers.L = 0x00
          emu.setState(state)
        },
        assert: (emu) => {
          const state = emu.getState()
          const passed = state.registers.H === 0x15 && state.registers.L === 0x00
          return { passed, message: passed ? "Correct: HL is 0x1500" : `Expected HL=0x1500, got H=0x${state.registers.H.toString(16).toUpperCase()} L=0x${state.registers.L.toString(16).toUpperCase()}` }
        }
      }
    ]
  }
}
