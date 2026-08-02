"use client"

import { useState, useEffect } from "react"
import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FloatingWindow } from "@/components/floating-window"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import SimulatorNav from "./simulator-nav"
import CodeEditor from "./code-editor"
import ControlBar from "./control-bar"
import ConsolePanel from "./console-panel"
import RegisterDisplay from "./register-display"
import FlagDisplay from "./flag-display"
import OutputDisplay from "./output-display"
import MemoryGrid from "./memory-grid"
import IOPorts from "./io-ports"
import InstructionHistory from "./instruction-history"
import ExecutionState from "./execution-state"
import StackDisplay from "./stack-display"
import StatisticsDisplay from "./statistics-display"
import WatchWindow from "./watch-window"
import InstructionDecoder from "./instruction-decoder"
import ProgramCounter from "./program-counter"
import InterruptDisplay from "./interrupt-display"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSimulator } from "@/hooks/use-simulator"
import { AIAssistantPanel } from "./ai-assistant-panel"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useSettings } from "@/components/settings-provider"
import { useUserStats } from "@/hooks/use-user-stats"

const sampleCode = `; 8085 Assembly Program
; Add two numbers

MVI A, 25H    ; Load 25H into A
MVI B, 3AH    ; Load 3AH into B
ADD B         ; Add B to A
STA 2050H     ; Store result at 2050H
HLT           ; Halt`

export default function SimulatorDashboard() {
  const [code, setCode] = useState(sampleCode)
  const { data: session } = useSession()
  const { showInstructionTrace } = useSettings()
  const { recordExecution, recordProgramCreated, updateStat, addRecentFile } = useUserStats()

  useEffect(() => {
    const loadCodeFromStorage = () => {
      const params = new URLSearchParams(window.location.search)
      const sharedCode = localStorage.getItem("mp8085_shared_code")
      if (sharedCode || params.get("loadShared") === "true") {
        const codeToLoad = sharedCode || localStorage.getItem("mp8085-autosave-code") || sampleCode
        setCode(codeToLoad)
        localStorage.setItem("mp8085-autosave-code", codeToLoad)
        localStorage.removeItem("mp8085_shared_code")
        toast.success("Loaded program into 8085 Simulator!")
      } else {
        const savedCode = localStorage.getItem("mp8085-autosave-code")
        if (savedCode) setCode(savedCode)
      }
    }

    loadCodeFromStorage()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mp8085-autosave-code" && e.newValue) {
        setCode(e.newValue)
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const {
    emulatorState,
    consoleOutput,
    assembledCode,
    isRunning,
    isAssembled,
    currentLine,
    assembleCode,
    runProgram,
    stepProgram,
    stepBack,
    resetSimulator,
    clearCode,
    setPC,
    instructionHistory,
  } = useSimulator()

  const [aiOpen, setAiOpen] = useState(false)

  // Track Simulator Time
  useEffect(() => {
    const timer = setInterval(() => {
      updateStat("simulatorSeconds", (prev: number) => (prev || 0) + 10)
    }, 10000)
    return () => clearInterval(timer)
  }, [updateStat])

  // ─── Keyboard Shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        runProgram();
      } else if (e.key === 'F10') {
        e.preventDefault();
        stepProgram();
      } else if (e.key === 'F9') {
        e.preventDefault();
        stepBack();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        assembleCode(code);
      } else if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        resetSimulator();
        setCode("");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runProgram, stepProgram, stepBack, assembleCode, resetSimulator, code]);

  // ─── Transform emulator state for UI components ───────────────────────────

  const registers = {
    A:  emulatorState.registers?.A?.toString(16).toUpperCase().padStart(2, "0")  || "00",
    B:  emulatorState.registers?.B?.toString(16).toUpperCase().padStart(2, "0")  || "00",
    C:  emulatorState.registers?.C?.toString(16).toUpperCase().padStart(2, "0")  || "00",
    D:  emulatorState.registers?.D?.toString(16).toUpperCase().padStart(2, "0")  || "00",
    E:  emulatorState.registers?.E?.toString(16).toUpperCase().padStart(2, "0")  || "00",
    H:  emulatorState.registers?.H?.toString(16).toUpperCase().padStart(2, "0")  || "00",
    L:  emulatorState.registers?.L?.toString(16).toUpperCase().padStart(2, "0")  || "00",
    PC: emulatorState.registers?.PC?.toString(16).toUpperCase().padStart(4, "0") || "0000",
    SP: emulatorState.registers?.SP?.toString(16).toUpperCase().padStart(4, "0") || "0000",
  }

  const flags = {
    Z:  emulatorState.flags?.Z  || 0,
    S:  emulatorState.flags?.S  || 0,
    CY: emulatorState.flags?.CY || 0,
    P:  emulatorState.flags?.P  || 0,
    AC: emulatorState.flags?.AC || 0,
  }

  const interruptState = {
    interruptsEnabled:  emulatorState.interruptsEnabled  || false,
    interruptMask:      emulatorState.interruptMask      || 0,
    pendingInterrupts:  emulatorState.pendingInterrupts  || 0,
    serialInput:        emulatorState.serialInput        || 0,
    serialOutput:       emulatorState.serialOutput       || 0,
  }

  // I/O ports
  const ioPorts: Record<string, string> = {}
  if (emulatorState.ioPorts) {
    emulatorState.ioPorts.forEach((value: number, port: number) => {
      ioPorts[port.toString(16).toUpperCase().padStart(2, "0")] =
        value.toString(16).toUpperCase().padStart(2, "0")
    })
  }

  const ledValue     = parseInt(registers.A, 16) || 0
  const segmentValue = registers.A
  const currentPC    = parseInt(registers.PC, 16) || 0

  const currentInstruction = isAssembled && assembledCode?.instructions
    ? assembledCode.instructions.find((i: any) => i.address === currentPC)
    : null;

  const instructionsExecuted = emulatorState.instructionsExecuted || 0;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleAssemble = () => assembleCode(code)
  const handleRun      = () => { recordExecution(); runProgram() }
  const handleStep     = () => stepProgram()
  const handleReset    = () => { resetSimulator(); setCode("") }
  const handleClear    = () => { clearCode(); setCode("") }

  const handleSave = async () => {
    if (!session) { toast.error("Please sign in to save your code"); return }
    if (!code.trim()) { toast.error("Cannot save empty code"); return }
    try {
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "My 8085 Program", code }),
      })
      if (response.ok) {
        toast.success("Code saved successfully!")
        recordProgramCreated()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to save code")
      }
    } catch {
      toast.error("Failed to save code")
    }
  }

  const handleOpen = (content: string) => {
    setCode(content)
    addRecentFile("Local File")
    toast.success("File opened successfully!")
  }

  const handleShare = async () => {
    if (!session) { toast.error("Please sign in to share your code"); return }
    if (!code.trim()) { toast.error("Cannot share empty code"); return }
    try {
      const url = `${window.location.origin}/simulator?code=${encodeURIComponent(code)}`
      await navigator.clipboard.writeText(url)
      toast.success("Share link copied to clipboard!")
    } catch {
      toast.error("Failed to copy share link")
    }
  }

  const handleDownload = () => {
    if (!session) { toast.error("Please sign in to download your code"); return }
    if (!code.trim()) { toast.error("Cannot download empty code"); return }
    const element = document.createElement("a")
    const file    = new Blob([code], { type: "text/plain" })
    element.href  = URL.createObjectURL(file)
    element.download = "program.asm"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Code downloaded successfully!")
  }


  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col">
      <SimulatorNav />

      <main className="flex-1 min-h-0 max-w-[1800px] mx-auto w-full animate-fade-in flex flex-col px-2 pb-2">
        {/* Control Bar */}
        <ControlBar
          onAssemble={handleAssemble}
          onRun={handleRun}
          onStep={handleStep}
          onStepBack={stepBack}
          onReset={handleReset}
          onClear={clearCode}
          onSave={handleSave}
          onOpen={handleOpen}
          onShare={handleShare}
          onDownload={handleDownload}
          isRunning={isRunning}
        />

        {/* Main Layout */}
        <div className="flex-1 min-h-0 mt-2 border border-border rounded-lg overflow-hidden bg-background">
          <ResizablePanelGroup direction="horizontal" className="h-full w-full" autoSaveId="simulator-main-layout">
            {/* LEFT COLUMN: 30% */}
            <ResizablePanel defaultSize={30} minSize={20} id="panel-left" order={1}>
              <ResizablePanelGroup direction="vertical" autoSaveId="simulator-left-col">
                <ResizablePanel defaultSize={70} id="panel-editor" order={1}>
                  <div className="h-full p-2">
                    <CodeEditor code={code} setCode={setCode} activeLine={currentLine} />
                  </div>
                </ResizablePanel>
                <ResizableHandle className="bg-muted/50" />
                <ResizablePanel defaultSize={30} id="panel-console" order={2}>
                  <div className="h-full p-2 pt-0 flex flex-col">
                    <Tabs defaultValue="console" className="flex-1 flex flex-col min-h-0">
                      <TabsList className="w-full bg-muted/50 border border-border mb-2 shrink-0">
                        <TabsTrigger value="console" className="flex-1 text-xs">Console</TabsTrigger>
                        {showInstructionTrace && (
                          <TabsTrigger value="history" className="flex-1 text-xs">Instruction History</TabsTrigger>
                        )}
                      </TabsList>
                      <TabsContent value="console" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
                        <ConsolePanel logs={consoleOutput} />
                      </TabsContent>
                      {showInstructionTrace && (
                        <TabsContent value="history" className="flex-1 min-h-0 m-0 data-[state=active]:flex flex-col">
                          <InstructionHistory history={instructionHistory} />
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle className="bg-muted/50" />

            {/* MIDDLE COLUMN: 40% */}
            <ResizablePanel defaultSize={40} minSize={30} id="panel-middle" order={2}>
              <div className="h-full p-2 flex flex-col gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="shrink-0">
                  <ExecutionState 
                    memory={emulatorState.memory || new Uint8Array(65536)}
                    instructionsExecuted={instructionsExecuted}
                    pc={registers.PC}
                  />
                </div>
                <div className="shrink-0">
                  <RegisterDisplay registers={registers} onSetPC={setPC} />
                </div>
                <div className="shrink-0">
                  <FlagDisplay flags={flags} />
                </div>
                <div className="shrink-0">
                  <InstructionDecoder 
                    memory={emulatorState.memory || new Uint8Array(65536)} 
                    pc={currentPC}
                  />
                </div>
                <div className="shrink-0">
                  <InterruptDisplay 
                    interruptsEnabled={emulatorState.interruptsEnabled || false} 
                    interruptMask={emulatorState.interruptMask || 0}
                    pendingInterrupts={emulatorState.pendingInterrupts || 0}
                    serialInput={emulatorState.serialInput || 0}
                    serialOutput={emulatorState.serialOutput || 0}
                  />
                </div>
                <div className="shrink-0">
                  <WatchWindow registers={registers} memory={emulatorState.memory} />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle className="bg-muted/50" />

            {/* RIGHT COLUMN: 30% */}
            <ResizablePanel defaultSize={30} minSize={20} id="panel-right" order={3}>
              <div className="h-full p-2 flex flex-col gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="shrink-0">
                  <OutputDisplay ledValue={ledValue} segmentValue={segmentValue} />
                </div>
                <div className="shrink-0 flex-1">
                  <MemoryGrid memory={emulatorState.memory || new Uint8Array(65536)} currentPC={currentPC} lastMemoryAccess={emulatorState.lastMemoryAccess} />
                </div>
                <div className="shrink-0">
                  <StackDisplay memory={emulatorState.memory || new Uint8Array(65536)} sp={registers.SP} />
                </div>
                <div className="shrink-0">
                  <StatisticsDisplay stats={{
                    clockCycles: emulatorState.clockCycles || 0,
                    instructionsExecuted: instructionsExecuted,
                    memoryReads: emulatorState.memoryReads || 0,
                    memoryWrites: emulatorState.memoryWrites || 0,
                    stackOps: emulatorState.stackOps || 0,
                  }} />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        
        {/* AI ASSISTANT POPUP & TRIGGER */}
        <Button 
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 p-0 z-40"
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
        
        <FloatingWindow
          isOpen={aiOpen}
          onClose={() => setAiOpen(false)}
          title="AI Assistant"
          defaultWidth={400}
          defaultHeight={600}
          minWidth={350}
          minHeight={400}
        >
          <div className="flex-1 overflow-hidden h-full">
            <AIAssistantPanel 
              code={code} 
              onApplyCode={setCode} 
              registers={registers} 
              flags={flags}
              consoleOutput={consoleOutput}
              assembledCode={assembledCode}
              isRunning={isRunning}
              isAssembled={isAssembled}
              memory={emulatorState.memory}
              ioPorts={ioPorts}
              ledValue={ledValue}
              segmentValue={segmentValue}
            />
          </div>
        </FloatingWindow>

      </main>
    </div>
  )
}

