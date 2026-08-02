import { Emulator8085 } from './emulator'
import { Assembler8085 } from './assembler'

// Initialize singletons in the worker thread
let emulator: Emulator8085 | null = null
let assembler: Assembler8085 | null = null

function getEmulator(): Emulator8085 {
  if (!emulator) {
    emulator = new Emulator8085()
  }
  return emulator
}

function getAssembler(): Assembler8085 {
  if (!assembler) {
    assembler = new Assembler8085()
  }
  return assembler
}

export type WorkerCommand =
  | { command: 'INIT' }
  | { command: 'ASSEMBLE'; code: string }
  | { command: 'LOAD_PROGRAM'; startAddr: number; machineCode: number[] }
  | { command: 'STEP' }
  | { command: 'RUN'; maxCycles?: number; breakpoints?: number[] }
  | { command: 'RESET' }
  | { command: 'SET_REGISTER'; register: string; value: number }
  | { command: 'SET_MEMORY'; address: number; value: number }

export type WorkerResponse =
  | { type: 'READY' }
  | { type: 'ASSEMBLED'; success: boolean; result?: any; error?: string }
  | { type: 'STATE_UPDATE'; state: any; halted?: boolean; reason?: string }
  | { type: 'RUN_COMPLETE'; state: any; cyclesExecuted: number; halted: boolean; reason?: string }
  | { type: 'ERROR'; message: string }

self.addEventListener('message', (event: MessageEvent<WorkerCommand>) => {
  const data = event.data

  try {
    switch (data.command) {
      case 'INIT': {
        getEmulator()
        getAssembler()
        self.postMessage({ type: 'READY' } satisfies WorkerResponse)
        break
      }

      case 'ASSEMBLE': {
        const asm = getAssembler()
        try {
          const result = asm.assemble(data.code)
          self.postMessage({
            type: 'ASSEMBLED',
            success: true,
            result,
          } satisfies WorkerResponse)
        } catch (err: any) {
          self.postMessage({
            type: 'ASSEMBLED',
            success: false,
            error: err?.message || 'Assembly error',
          } satisfies WorkerResponse)
        }
        break
      }

      case 'LOAD_PROGRAM': {
        const emu = getEmulator()
        emu.loadProgram(new Uint8Array(data.machineCode), data.startAddr)
        self.postMessage({
          type: 'STATE_UPDATE',
          state: emu.getState(),
        } satisfies WorkerResponse)
        break
      }

      case 'STEP': {
        const emu = getEmulator()
        emu.step()
        const state = emu.getState()
        self.postMessage({
          type: 'STATE_UPDATE',
          state,
          halted: state.halted,
        } satisfies WorkerResponse)
        break
      }

      case 'RUN': {
        const emu = getEmulator()
        const maxCycles = data.maxCycles || 100000 // Infinite-loop circuit breaker
        const breakpointSet = new Set(data.breakpoints || [])

        let cyclesExecuted = 0
        let halted = false
        let reason = 'MAX_CYCLES_REACHED'

        while (cyclesExecuted < maxCycles) {
          const stateBefore = emu.getState()
          if (stateBefore.halted) {
            halted = true
            reason = 'HALTED_BY_INSTRUCTION'
            break
          }

          if (cyclesExecuted > 0 && breakpointSet.has(stateBefore.registers.PC)) {
            reason = 'BREAKPOINT_HIT'
            break
          }

          emu.step()
          cyclesExecuted++

          const stateAfter = emu.getState()
          if (stateAfter.halted) {
            halted = true
            reason = 'HALTED_BY_INSTRUCTION'
            break
          }
        }

        self.postMessage({
          type: 'RUN_COMPLETE',
          state: emu.getState(),
          cyclesExecuted,
          halted,
          reason,
        } satisfies WorkerResponse)
        break
      }

      case 'RESET': {
        const emu = getEmulator()
        emu.reset()
        self.postMessage({
          type: 'STATE_UPDATE',
          state: emu.getState(),
          reason: 'RESET',
        } satisfies WorkerResponse)
        break
      }

      case 'SET_REGISTER': {
        const emu = getEmulator()
        const state = emu.getState()
        const regKey = data.register.toUpperCase()
        if (regKey in state.registers) {
          ;(state.registers as any)[regKey] = data.value & 0xFFFF
          emu.setState(state)
        }
        self.postMessage({
          type: 'STATE_UPDATE',
          state: emu.getState(),
        } satisfies WorkerResponse)
        break
      }

      case 'SET_MEMORY': {
        const emu = getEmulator()
        emu.setMemory(data.address, data.value)
        self.postMessage({
          type: 'STATE_UPDATE',
          state: emu.getState(),
        } satisfies WorkerResponse)
        break
      }
    }
  } catch (err: any) {
    self.postMessage({
      type: 'ERROR',
      message: err?.message || 'Worker runtime error',
    } satisfies WorkerResponse)
  }
})
