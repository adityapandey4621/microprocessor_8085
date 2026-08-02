'use client'

import { useState } from 'react'
import SimulatorNav from '@/components/simulator-nav'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Play,
  CheckCircle2,
  XCircle,
  Cpu,
  Sparkles,
  Code2,
  BookOpen,
  ArrowRight,
  Loader2,
} from 'lucide-react'

interface ChallengeItem {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  desc: string
  instructions: string
  starterCode: string
  sampleSolution: string
}

const CHALLENGE_LIST: ChallengeItem[] = [
  {
    id: 'add-two-numbers',
    title: 'Add Two Numbers (B + C -> A)',
    difficulty: 'Easy',
    desc: 'Add the values in registers B and C, store the sum in register A, and handle carry.',
    instructions:
      'Write an 8085 assembly program that takes whatever value is currently in register B and register C, adds them together, and leaves the final sum in register A. Use the ADD instruction.',
    starterCode: `; Challenge: Add B and C into A
; Your code here:

HLT`,
    sampleSolution: `; Solution: Add Two Numbers
MOV A, B       ; Copy B into A
ADD C          ; Add C to A -> sum in A
HLT`,
  },
  {
    id: 'memory-store',
    title: 'Store 0x99 at Memory Address 2050H',
    difficulty: 'Easy',
    desc: 'Write the hexadecimal byte 99H to absolute memory location 2050H.',
    instructions:
      'Write an 8085 assembly program that stores the byte value 99H at memory address 2050H. You can use MVI M or STA instructions.',
    starterCode: `; Challenge: Store 99H at 2050H
; Your code here:

HLT`,
    sampleSolution: `; Solution: Store 99H at 2050H
MVI A, 99H     ; Load 99H into accumulator
STA 2050H      ; Store accumulator at address 2050H
HLT`,
  },
  {
    id: 'mask-lower-nibble',
    title: 'Mask Lower Nibble of A (A AND F0H)',
    difficulty: 'Medium',
    desc: 'Clear the lower 4 bits (nibble) of register A while preserving the upper 4 bits.',
    instructions:
      'Write an 8085 assembly program that performs a bitwise AND operation on register A with the mask F0H (11110000B), so that any lower nibble bits are zeroed out.',
    starterCode: `; Challenge: Mask Lower Nibble of A
; Your code here:

HLT`,
    sampleSolution: `; Solution: Mask Lower Nibble of A
ANI F0H        ; AND immediate F0H with A
HLT`,
  },
]

export default function ChallengesPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeItem>(CHALLENGE_LIST[0])
  const [code, setCode] = useState(CHALLENGE_LIST[0].starterCode)
  const [isGrading, setIsGrading] = useState(false)
  const [result, setResult] = useState<any | null>(null)

  const handleSelectChallenge = (item: ChallengeItem) => {
    setSelectedChallenge(item)
    setCode(item.starterCode)
    setResult(null)
  }

  const handleLoadSample = () => {
    setCode(selectedChallenge.sampleSolution)
  }

  const handleRunGrader = async () => {
    setIsGrading(true)
    setResult(null)

    try {
      const res = await fetch('/api/challenge/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          code,
        }),
      })

      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setResult({
        success: false,
        error: err?.message || 'Failed to connect to grader',
        score: 0,
      })
    } finally {
      setIsGrading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimulatorNav />

      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-gradient-to-b from-card/50 to-background py-10 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <Trophy className="w-3.5 h-3.5" />
              Automated Verification Engine
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              8085 Assembly Challenge Arena
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Test your assembly skills against real-time assertion vectors.
              The backend grader runs your code in an isolated 8085 CPU emulator and verifies registers, flags, and memory.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-xs font-medium">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-semibold text-foreground">Backend Grader Connected</div>
              <div className="text-[11px] text-muted-foreground">Endpoint: /api/challenge/submit</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Workspace ──────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto p-6 flex flex-col md:flex-row gap-6">
        {/* Left List */}
        <div className="w-full md:w-80 flex flex-col gap-2 shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1">
            Available Challenges
          </h2>
          {CHALLENGE_LIST.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectChallenge(item)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                selectedChallenge.id === item.id
                  ? 'bg-card border-primary shadow-sm'
                  : 'bg-card/40 border-border/60 hover:border-border hover:bg-card/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    item.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {item.difficulty}
                </span>
                {result && result.challengeId === item.id && result.score === 100 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div className="font-bold text-sm text-foreground mt-1">{item.title}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.desc}</div>
            </button>
          ))}
        </div>

        {/* Center: Instructions & Code Editor */}
        <div className="flex-1 flex flex-col rounded-2xl bg-card/40 border border-border overflow-hidden">
          {/* Challenge Bar */}
          <div className="p-5 border-b border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                {selectedChallenge.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">{selectedChallenge.instructions}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              className="text-xs shrink-0 bg-background/60"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Load Sample Solution
            </Button>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col bg-black/70 p-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              className="w-full flex-1 bg-transparent text-cyan-300 font-mono text-sm leading-relaxed focus:outline-none resize-none"
              placeholder="; Type your 8085 assembly solution here..."
            />
          </div>

          {/* Actions Footer */}
          <div className="p-4 border-t border-border bg-card/60 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Tip: Click <strong className="text-foreground">Load Sample Solution</strong> to test an instant 100/100 score.
            </div>
            <Button
              onClick={handleRunGrader}
              disabled={isGrading}
              className="px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-sm flex items-center gap-2"
            >
              {isGrading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Code...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Run Automated Grader
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Scorecard Panel (shows when result arrives) */}
        {result && (
          <div className="w-full md:w-80 rounded-2xl bg-card border border-border p-5 flex flex-col shadow-lg animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Grader Scorecard
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  result.score === 100
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {result.score || 0} / 100
              </span>
            </div>

            {result.error ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <XCircle className="w-4 h-4" /> {result.error}
                </div>
                {result.details && result.details.map((e: string, i: number) => (
                  <div key={i} className="mt-1 font-mono text-[11px]">• {e}</div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                  <span>Execution Cycles</span>
                  <span className="font-mono font-bold text-foreground">
                    {result.executionCycles || 0} Cycles
                  </span>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Assertion Results
                  </div>
                  <div className="space-y-2">
                    {result.testResults?.map((t: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          t.passed
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/5 border-red-500/20 text-red-300'
                        }`}
                      >
                        {t.passed ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold">{t.name}</div>
                          <div className="text-[11px] opacity-90 mt-0.5">{t.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
