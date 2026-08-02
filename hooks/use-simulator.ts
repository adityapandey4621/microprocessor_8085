'use client'

// Custom hook for 8085 simulator logic
import { useState, useEffect, useCallback, useRef } from "react"
import { Emulator8085 } from '@/lib/emulator'
import { Assembler8085 } from '@/lib/assembler'
import { useSettings } from "@/components/settings-provider"

export function useSimulator() {
  const { autoReset } = useSettings()
  const emulatorRef = useRef<Emulator8085 | null>(null)
  const assemblerRef = useRef<Assembler8085 | null>(null)
  const instructionMapRef = useRef<Map<number, any>>(new Map())

  const [emulatorState, setEmulatorState] = useState<any>({})
  const [assembledCode, setAssembledCode] = useState<any>(null)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isAssembled, setIsAssembled] = useState<boolean>(false)
  const [currentLine, setCurrentLine] = useState<number | null>(null)
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set())
  const [history, setHistory] = useState<any[]>([])
  const [instructionHistory, setInstructionHistory] = useState<any[]>([])
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '[INFO] 8085 Simulator initialized',
    '[INFO] Ready to load program'
  ])

  const [executionSpeed, _setExecutionSpeed] = useState<number>(0) // 0 = Real-time
  const executionSpeedRef = useRef<number>(0)
  const runTimerRef = useRef<number | null>(null)
  const isRunningRef = useRef<boolean>(false)
  const lastUiUpdateRef = useRef<number>(0)

  const setExecutionSpeed = useCallback((speed: number) => {
    _setExecutionSpeed(speed)
    executionSpeedRef.current = speed
  }, [])

  // Initialize emulator and assembler
  useEffect(() => {
    if (!emulatorRef.current) {
      emulatorRef.current = new Emulator8085()
      setEmulatorState(emulatorRef.current.getState())
    }

    if (!assemblerRef.current) {
      assemblerRef.current = new Assembler8085()
    }
  }, [])

  // Update the simulator state when the emulator state changes
  const updateSimulatorState = useCallback(() => {
    if (emulatorRef.current) {
      setEmulatorState(emulatorRef.current.getState())
    }
  }, [])

  // Assemble the code
  const assembleCode = useCallback((code: string) => {
    if (!assemblerRef.current) return

    try {
      const result = assemblerRef.current.assemble(code)

      setAssembledCode(result)
      setIsAssembled(result.errors.length === 0)

      // Populate instructionMapRef
      instructionMapRef.current.clear()
      if (result.errors.length === 0 && result.instructions) {
        result.instructions.forEach((inst: any) => {
          instructionMapRef.current.set(inst.address, inst)
        })
      }

      const newConsoleOutput = [
        ...consoleOutput,
        `[ASM] Assembling program...`,
        result.errors.length > 0
          ? `[ERROR] Assembly failed with ${result.errors.length} errors`
          : `[ASM] Program assembled successfully`,
        ...(result.errors.length > 0 ? result.errors.map((e: string) => `[ERROR] ${e}`) : []),
        ...(result.warnings ? result.warnings.map((w: any) => `[WARNING] Line ${w.line > 0 ? w.line : '?'}: ${w.message}`) : []),
        `[ASM] ${result.instructions.length} instructions generated`
      ]

      setConsoleOutput(newConsoleOutput)
      
      if (result.errors.length === 0 && result.instructions.length > 0) {
        setCurrentLine(result.instructions[0].lineNumber)
      } else {
        setCurrentLine(null)
      }

      if (result.errors.length === 0 && emulatorRef.current) {
        // Reset the emulator to clear previous state (registers, flags, memory)
        emulatorRef.current.reset()
        // Load the program into the emulator
        emulatorRef.current.loadProgram(result.machineCode)
        updateSimulatorState()
        setHistory([])
        setInstructionHistory([])
      }
    } catch (error) {
      const newConsoleOutput = [
        ...consoleOutput,
        `[ERROR] Failed to assemble code: ${error instanceof Error ? error.message : 'Unknown error'}`
      ]
      setConsoleOutput(newConsoleOutput)
    }
  }, [consoleOutput, updateSimulatorState])

  // Pause the program
  const pauseProgram = useCallback(() => {
    if (runTimerRef.current !== null) {
      if (executionSpeedRef.current === 0 || executionSpeedRef.current >= 1000) {
        cancelAnimationFrame(runTimerRef.current)
      } else {
        clearTimeout(runTimerRef.current)
      }
      runTimerRef.current = null
    }
    setIsRunning(false)
    isRunningRef.current = false
    setConsoleOutput(prev => [...prev, '[PAUSE] Execution paused'])
  }, [])

  // Run the program continuously asynchronously
  const runProgram = useCallback(() => {
    if (!isAssembled) {
      setConsoleOutput(prev => [...prev, '[ERROR] Program not assembled. Please assemble first.'])
      return
    }

    if (!emulatorRef.current) return

    let currentOutput = [...consoleOutput]
    
    if (autoReset || emulatorRef.current.getState().halted) {
      emulatorRef.current.reset()
      if (assembledCode && assembledCode.machineCode) {
        emulatorRef.current.loadProgram(assembledCode.machineCode)
      }
      updateSimulatorState()
      setHistory([])
      setInstructionHistory([])
      currentOutput.push('[INFO] CPU Reset. Running program...')
    }

    setIsRunning(true)
    isRunningRef.current = true
    currentOutput.push('[RUN] Executing program...')
    setConsoleOutput(currentOutput)

    // Execute batch loop
    const executeBatch = () => {
      if (!isRunningRef.current || !emulatorRef.current) return

      const speed = executionSpeedRef.current
      let instructionsToRun = 1
      let totalCycles = 0

      if (speed === 0) {
        // Real-time (approx 3MHz clock, 400k inst/s). At 60 FPS, that's ~6000 instructions per frame
        instructionsToRun = 6000
      } else if (speed >= 1000) {
        // e.g. 1kHz = 1000 inst/s -> ~16 instructions per frame
        instructionsToRun = Math.max(1, Math.floor(speed / 60))
      }

      try {
        let halted = false
        let bp = false
        let traceBatch: number[] = []
        
        for (let i = 0; i < instructionsToRun; i++) {
          const stateBefore = emulatorRef.current.getState()
          if (stateBefore.instructionsExecuted >= 1000000) {
            halted = true
            setConsoleOutput(prev => [...prev, '[ERROR] Execution halted: instruction limit exceeded (1,000,000 instructions). Infinite loop suspected.'])
            break
          }
          traceBatch.push(stateBefore.registers.PC)
          
          const cycles = emulatorRef.current.step()
          totalCycles += cycles
          
          if (emulatorRef.current.getState().halted) {
            halted = true
            break
          }
          if (emulatorRef.current.hasBreakpoint()) {
            bp = true
            break
          }
        }
        
        const now = performance.now()
        // Force update if halted or hit breakpoint, OR if 33ms (~30 FPS) have passed
        if (halted || bp || now - lastUiUpdateRef.current >= 33) {
          updateSimulatorState()
          lastUiUpdateRef.current = now
        }

        // Update instruction history and active line efficiently
        if (assembledCode && instructionMapRef.current.size > 0 && traceBatch.length > 0) {
          const recentTrace = traceBatch.slice(-50)
          const executedInstructions = recentTrace.map(pc => 
            instructionMapRef.current.get(pc)
          ).filter(Boolean)
          
          if (executedInstructions.length > 0) {
            setInstructionHistory(prev => {
              const newHist = [...prev, ...executedInstructions]
              return newHist.slice(-50) // Keep last 50
            })
          }
          
          const newPC = emulatorRef.current.getState().registers.PC
          const nextInst = instructionMapRef.current.get(newPC)
          if (nextInst && !emulatorRef.current.getState().halted) {
             setCurrentLine(nextInst.lineNumber)
          } else {
             setCurrentLine(null)
          }
        }

        if (halted || bp) {
          setIsRunning(false)
          isRunningRef.current = false
          setConsoleOutput(prev => [
            ...prev, 
            halted ? '[RUN] Program halted' : '[RUN] Execution stopped at breakpoint'
          ])
          return
        }
        
        // Schedule next batch
        if (speed === 0 || speed >= 1000) {
          runTimerRef.current = requestAnimationFrame(executeBatch)
        } else {
          const delay = 1000 / speed
          runTimerRef.current = window.setTimeout(executeBatch, delay)
        }

      } catch (error) {
        setIsRunning(false)
        isRunningRef.current = false
        setConsoleOutput(prev => [...prev, `[ERROR] Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`])
      }
    }

    // Start execution
    if (executionSpeedRef.current === 0 || executionSpeedRef.current >= 1000) {
      runTimerRef.current = requestAnimationFrame(executeBatch)
    } else {
      runTimerRef.current = window.setTimeout(executeBatch, 1000 / executionSpeedRef.current)
    }

  }, [isAssembled, assembledCode, consoleOutput, updateSimulatorState])

  // Step through one instruction
  const stepProgram = useCallback(() => {
    if (!isAssembled) {
      setConsoleOutput([...consoleOutput, '[ERROR] Program not assembled. Please assemble first.'])
      return
    }

    if (!emulatorRef.current) return

    try {
      const stateBefore = emulatorRef.current.getState()
      setHistory(prev => [...prev, stateBefore])
      
      const currentPC = stateBefore.registers.PC
      
      const cycles = emulatorRef.current.step()
      updateSimulatorState()

      // Track instruction history
      const newPC = emulatorRef.current.getState().registers.PC
      if (assembledCode && instructionMapRef.current.size > 0) {
        const instBefore = instructionMapRef.current.get(currentPC)
        const nextInst = instructionMapRef.current.get(newPC)
        
        if (nextInst) {
           setCurrentLine(nextInst.lineNumber)
        } else {
           // Program halted or hit breakpoint
           setCurrentLine(null)
        }

        if (instBefore) {
          setInstructionHistory(prev => {
            const newHist = [...prev, instBefore]
            return newHist.slice(-50) // Keep last 50
          })
        }
      }

      setConsoleOutput([...consoleOutput, `[STEP] Executed instruction in ${cycles} cycles`])
    } catch (error) {
      const newConsoleOutput = [
        ...consoleOutput,
        `[ERROR] Step execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      ]
      setConsoleOutput(newConsoleOutput)
    }
  }, [isAssembled, consoleOutput, updateSimulatorState])

  // Step backwards
  const stepBack = useCallback(() => {
    if (!isAssembled) return
    if (!emulatorRef.current) return
    
    setHistory(prev => {
      if (prev.length === 0) {
        setConsoleOutput([...consoleOutput, '[INFO] No more history to step back'])
        return prev
      }
      const newHistory = [...prev]
      const prevState = newHistory.pop()
      if (prevState) {
        emulatorRef.current!.setState(prevState)
        updateSimulatorState()
        setConsoleOutput([...consoleOutput, `[STEP BACK] Reverted one instruction`])
        setInstructionHistory(prev => prev.slice(0, -1))
      }
      return newHistory
    })
  }, [isAssembled, consoleOutput, updateSimulatorState])

  // Skip to a particular location (set PC)
  const setPC = useCallback((address: number) => {
    if (!emulatorRef.current) return
    const currentState = emulatorRef.current.getState()
    currentState.registers.PC = address & 0xFFFF
    emulatorRef.current.setState(currentState)
    updateSimulatorState()
    setConsoleOutput([...consoleOutput, `[PC] Jumped to ${address.toString(16).toUpperCase().padStart(4, "0")}`])
  }, [consoleOutput, updateSimulatorState])

  // Reset the simulator
  const resetSimulator = useCallback(() => {
    if (runTimerRef.current !== null) {
      if (executionSpeedRef.current === 0 || executionSpeedRef.current >= 1000) {
        cancelAnimationFrame(runTimerRef.current)
      } else {
        clearTimeout(runTimerRef.current)
      }
      runTimerRef.current = null
    }

    if (!emulatorRef.current) return

    emulatorRef.current.reset()
    updateSimulatorState()

    setIsRunning(false)
    isRunningRef.current = false
    setIsAssembled(false)
    setCurrentLine(null)
    setAssembledCode(null)
    setHistory([])
    setInstructionHistory([])
    setConsoleOutput(prev => [...prev, '[RESET] Simulator reset'])
  }, [updateSimulatorState])

  // Clear the code editor
  const clearCode = useCallback(() => {
    setConsoleOutput([...consoleOutput, '[CLEAR] Editor cleared'])
  }, [consoleOutput])

  // Set a breakpoint
  const setBreakpoint = useCallback((lineNumber: number) => {
    if (!emulatorRef.current) return

    const newBreakpoints = new Set(breakpoints)
    if (newBreakpoints.has(lineNumber)) {
      newBreakpoints.delete(lineNumber)
    } else {
      newBreakpoints.add(lineNumber)
    }

    // Update emulator breakpoints
    emulatorRef.current.removeBreakpoint(lineNumber)
    if (newBreakpoints.has(lineNumber)) {
      emulatorRef.current.setBreakpoint(lineNumber)
    }

    setBreakpoints(newBreakpoints)
  }, [breakpoints])

  // Add a message to console
  const addToConsole = useCallback((message: string) => {
    setConsoleOutput([...consoleOutput, message])
  }, [consoleOutput])

  return {
    emulatorState,
    assembledCode,
    isRunning,
    isAssembled,
    currentLine,
    breakpoints,
    consoleOutput,
    instructionHistory,
    assembleCode,
    runProgram,
    stepProgram,
    stepBack,
    resetSimulator,
    clearCode,
    setBreakpoint,
    setPC,
    addToConsole,
    executionSpeed,
    setExecutionSpeed,
    pauseProgram,
  }
}