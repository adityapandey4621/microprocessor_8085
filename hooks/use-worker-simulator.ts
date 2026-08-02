'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { WorkerCommand, WorkerResponse } from '@/lib/emulator-worker'

export function useWorkerSimulator() {
  const workerRef = useRef<Worker | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isAssembled, setIsAssembled] = useState(false)
  const [emulatorState, setEmulatorState] = useState<any>({})
  const [assembledCode, setAssembledCode] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastReason, setLastReason] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !workerRef.current) {
      const worker = new Worker(new URL('../lib/emulator-worker.ts', import.meta.url))
      workerRef.current = worker

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const data = event.data
        switch (data.type) {
          case 'READY':
            setIsReady(true)
            break
          case 'ASSEMBLED':
            if (data.success) {
              setAssembledCode(data.result)
              setIsAssembled(true)
              setErrorMessage(null)
              // Automatically load program into memory
              if (data.result?.machineCode) {
                worker.postMessage({
                  command: 'LOAD_PROGRAM',
                  startAddr: data.result.startAddress || 0x2000,
                  machineCode: data.result.machineCode,
                } satisfies WorkerCommand)
              }
            } else {
              setErrorMessage(data.error || 'Assembly failed')
              setIsAssembled(false)
            }
            break
          case 'STATE_UPDATE':
            setEmulatorState(data.state)
            if (data.reason) setLastReason(data.reason)
            break
          case 'RUN_COMPLETE':
            setEmulatorState(data.state)
            setIsRunning(false)
            if (data.reason) setLastReason(data.reason)
            break
          case 'ERROR':
            setErrorMessage(data.message)
            setIsRunning(false)
            break
        }
      }

      worker.postMessage({ command: 'INIT' } satisfies WorkerCommand)

      return () => {
        worker.terminate()
        workerRef.current = null
      }
    }
  }, [])

  const assemble = useCallback((code: string) => {
    setErrorMessage(null)
    workerRef.current?.postMessage({
      command: 'ASSEMBLE',
      code,
    } satisfies WorkerCommand)
  }, [])

  const step = useCallback(() => {
    workerRef.current?.postMessage({
      command: 'STEP',
    } satisfies WorkerCommand)
  }, [])

  const run = useCallback((maxCycles?: number, breakpoints?: number[]) => {
    setIsRunning(true)
    workerRef.current?.postMessage({
      command: 'RUN',
      maxCycles: maxCycles || 100000,
      breakpoints: breakpoints || [],
    } satisfies WorkerCommand)
  }, [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setIsAssembled(false)
    setAssembledCode(null)
    setErrorMessage(null)
    workerRef.current?.postMessage({
      command: 'RESET',
    } satisfies WorkerCommand)
  }, [])

  const setRegister = useCallback((register: string, value: number) => {
    workerRef.current?.postMessage({
      command: 'SET_REGISTER',
      register,
      value,
    } satisfies WorkerCommand)
  }, [])

  const setMemory = useCallback((address: number, value: number) => {
    workerRef.current?.postMessage({
      command: 'SET_MEMORY',
      address,
      value,
    } satisfies WorkerCommand)
  }, [])

  return {
    isReady,
    isRunning,
    isAssembled,
    emulatorState,
    assembledCode,
    errorMessage,
    lastReason,
    assemble,
    step,
    run,
    reset,
    setRegister,
    setMemory,
  }
}
