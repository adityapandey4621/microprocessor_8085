'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import SimulatorNav from '@/components/simulator-nav'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Play,
  CheckCircle2,
  XCircle,
  BookOpen,
  Loader2,
  List,
  Terminal,
  CloudUpload,
  AlertTriangle,
  ArrowLeft,
  Trophy as TrophyIcon
} from 'lucide-react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import CodeEditor from '@/components/code-editor'
import { useUserStats } from '@/hooks/use-user-stats'
import { SyntaxGuide } from '@/components/syntax-guide'

interface ChallengeItem {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  concepts: string
  description: string
  instructions: string
  starterCode: string
  sampleSolution: string
  topic: string
}

export default function ChallengeWorkspace() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeItem | null>(null)
  const [code, setCode] = useState("")
  const [isGrading, setIsGrading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false)
  
  const { recordChallengeAttempt, recordChallengeSolved } = useUserStats()
  
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result' | 'leaderboard'>('testcase')

  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true)
    try {
      const res = await fetch(`/api/challenge/${id}/leaderboard`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err)
    } finally {
      setIsLeaderboardLoading(false)
    }
  }

  useEffect(() => {
    if (consoleTab === 'leaderboard' && leaderboard.length === 0) {
      fetchLeaderboard()
    }
  }, [consoleTab, leaderboard.length])

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch(`/api/challenge/${id}`)
        if (res.ok) {
          const data = await res.json()
          setSelectedChallenge(data.challenge)
          setCode(data.challenge.starterCode)
        }
      } catch (err) {
        console.error("Failed to load challenge:", err)
      }
    }
    fetchChallenge()
  }, [id])

  const handleRunOrSubmit = async (type: 'run' | 'submit') => {
    if (!selectedChallenge) return
    
    if (type === 'submit') setIsGrading(true)
    else setIsRunning(true)
    
    setResult(null)
    setConsoleTab('result')

    try {
      const res = await fetch('/api/challenge/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          code,
          action: type
        }),
      })

      const data = await res.json()
      setResult({ ...data, action: type })
      
      if (type === 'run') {
        recordChallengeAttempt()
      } else if (type === 'submit' && data.success) {
        recordChallengeSolved()
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: err?.message || 'Failed to connect to grader',
        score: 0,
      })
    } finally {
      setIsGrading(false)
      setIsRunning(false)
    }
  }

  if (!selectedChallenge) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-sans text-gray-200">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p className="text-gray-400">Loading workspace...</p>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
      <SimulatorNav />

      {/* ── Main Workspace ──────────────────────────────────────────── */}
      <div className="flex-1 p-2 pb-0 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full gap-2">
          
          {/* ── LEFT PANE: Description ── */}
          <ResizablePanel defaultSize={40} minSize={25} className="flex flex-col bg-[#121212] rounded-t-lg border border-[#1e1e1e]">
            {/* Left Tabs */}
            <div className="h-11 bg-[#0c0c0c] flex items-center px-4 shrink-0 border-b border-[#1e1e1e] rounded-t-lg justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => router.push('/challenges')}
                  className="flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-md transition-colors text-gray-500 hover:text-white hover:bg-[#1a1a1a]"
                >
                  <List className="w-4 h-4" /> Problems
                </button>
                <div className="h-4 w-px bg-[#2a2a2a] mx-1"></div>
                <div className="flex items-center gap-2 text-xs font-medium text-white px-2">
                  <BookOpen className="w-3.5 h-3.5" /> Description
                </div>
              </div>
              <SyntaxGuide />
            </div>

            {/* Left Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-white mb-3">
                    {selectedChallenge.title}
                  </h1>
                  <div className="flex items-center gap-3">
                     <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            selectedChallenge.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/10' : 
                            selectedChallenge.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10' : 
                            'text-red-400 bg-red-400/10'
                          }`}
                        >
                          {selectedChallenge.difficulty}
                      </span>
                      <span className="text-xs text-gray-400 bg-[#2d2d30] px-2.5 py-1 rounded-full">
                        {selectedChallenge.topic}
                      </span>
                  </div>
                </div>

                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedChallenge.description}
                </div>
                
                <div className="mt-8 pt-6 border-t border-[#1e1e1e]">
                   <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instructions
                   </h3>
                   <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                     {selectedChallenge.instructions}
                   </p>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-2 bg-transparent" />

          {/* ── RIGHT PANE: Editor & Console ── */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction="vertical" className="gap-2">
              
              {/* TOP RIGHT: Editor */}
              <ResizablePanel defaultSize={65} minSize={20} className="flex flex-col rounded-t-lg">
                <CodeEditor
                  code={code}
                  setCode={setCode}
                  activeLine={null}
                />
              </ResizablePanel>
              
              <ResizableHandle className="h-2 bg-transparent" />

              {/* BOTTOM RIGHT: Console */}
              <ResizablePanel defaultSize={35} minSize={10} className="flex flex-col bg-[#121212] rounded-t-lg border border-[#1e1e1e]">
                {/* Console Tabs */}
                <div className="h-11 bg-[#0c0c0c] flex items-center px-2 shrink-0 border-b border-[#1e1e1e] rounded-t-lg">
                  <button 
                    onClick={() => setConsoleTab('testcase')}
                    className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-md transition-colors ${consoleTab === 'testcase' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Testcases
                  </button>
                  <button 
                    onClick={() => setConsoleTab('result')}
                    className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-md transition-colors ${consoleTab === 'result' ? (result?.score === 100 ? 'text-emerald-400' : result ? 'text-red-400' : 'text-white') : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <Terminal className="w-3.5 h-3.5" /> Test Result
                  </button>
                  <button 
                    onClick={() => setConsoleTab('leaderboard')}
                    className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-md transition-colors ${consoleTab === 'leaderboard' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <TrophyIcon className="w-3.5 h-3.5" /> Leaderboard
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {consoleTab === 'testcase' && (
                    <div className="text-sm text-gray-400 px-2 py-4">
                       <div className="space-y-4">
                          <p>The code will be evaluated against hidden test cases in the 8085 emulator.</p>
                          <div className="p-4 bg-[#0c0c0c] rounded-lg border border-[#1e1e1e]">
                             <span className="font-semibold text-gray-300">Emulator Rules:</span>
                             <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400 text-xs">
                                <li>Memory begins at <code className="text-blue-400">0x2000</code>.</li>
                                <li>Code execution halts at <code className="text-blue-400">HLT</code> instruction.</li>
                                <li>Max execution limit: 50,000 cycles.</li>
                             </ul>
                          </div>
                       </div>
                    </div>
                  )}

                  {consoleTab === 'result' && (
                    <div className="px-2 py-2 h-full">
                      {!result ? (
                         <div className="text-sm text-gray-500 h-full flex items-center justify-center">
                           Run or submit your code to see evaluation results.
                         </div>
                      ) : (
                         <div className="animate-fade-in space-y-5 pb-8">
                           <div className="flex items-center justify-between pb-4 border-b border-[#1e1e1e]">
                              <h2 className={`text-xl font-bold ${result.score === 100 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {result.score === 100 ? 'Accepted' : 'Wrong Answer'}
                              </h2>
                              <div className="flex items-center gap-3">
                                 <span className="text-xs text-gray-400">Score: {result.score || 0}/100</span>
                                 <span className="text-xs text-gray-400">{result.executionCycles || 0} CPU cycles</span>
                              </div>
                           </div>
                           
                           {result.error && (
                             <div className="p-4 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm font-mono">
                                <div className="font-bold flex items-center gap-2 mb-2 text-base text-red-300">
                                  <XCircle className="w-5 h-5" /> Compilation / Execution Error
                                </div>
                                <div className="text-red-300 mb-2 font-semibold">{result.error}</div>
                                {result.details && result.details.map((e: string, i: number) => (
                                  <div key={i} className="mt-1 opacity-90 pl-4 border-l-2 border-red-500/30 ml-2 py-1">
                                    <span className="text-red-200">{e}</span>
                                  </div>
                                ))}
                             </div>
                           )}

                           {result.warnings && result.warnings.length > 0 && (
                             <div className="p-4 mt-2 rounded-lg bg-amber-950/30 border border-amber-900/50 text-amber-400 text-sm font-mono">
                                <div className="font-bold flex items-center gap-2 mb-2 text-base text-amber-300">
                                  <AlertTriangle className="w-5 h-5" /> Warnings
                                </div>
                                {result.warnings.map((w: any, i: number) => (
                                  <div key={i} className="mt-1 opacity-90 pl-4 border-l-2 border-amber-500/30 ml-2 py-1 flex flex-col gap-1">
                                    <span className="text-amber-200">Line {w.line}: {w.message}</span>
                                  </div>
                                ))}
                             </div>
                           )}

                           {result.action === 'run' && result.success && (
                             <div className="p-4 mt-2 rounded-lg bg-[#0c0c0c] border border-emerald-900/50 flex flex-col items-center justify-center text-center gap-3">
                               <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                                 <Trophy className="w-5 h-5" /> All Tests Passed!
                               </div>
                               <div className="text-sm text-gray-300">
                                 Your solution executed in <strong className="text-white">{result.executionCycles} T-cycles</strong>.
                               </div>
                               <span className="text-xs text-gray-400 mt-2">Click "Submit" in the bottom bar to save your progress.</span>
                             </div>
                           )}

                           {result.action === 'submit' && result.success && (
                             <div className="p-4 mt-2 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 text-sm text-center">
                               🎉 Code submitted successfully! Progress saved.
                             </div>
                           )}
                           
                           {result.testResults && result.testResults.length > 0 && (
                             <div className="space-y-3 mt-4">
                                <h3 className="text-sm font-semibold text-gray-300 mb-3">Test Cases</h3>
                                {result.testResults.map((t: any, idx: number) => (
                                  <div key={idx} className={`p-4 rounded-lg border text-sm flex flex-col gap-2 ${t.passed ? 'bg-emerald-950/10 border-emerald-900/30' : 'bg-red-950/10 border-red-900/30'}`}>
                                     <div className="flex items-center gap-2">
                                       {t.passed ? (
                                         <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                       ) : (
                                         <XCircle className="w-4 h-4 text-red-500" />
                                       )}
                                       <span className={`font-semibold ${t.passed ? 'text-emerald-400' : 'text-red-400'}`}>{t.name}</span>
                                     </div>
                                     
                                     {t.message && (
                                       <div className="mt-2 p-3 bg-[#0a0a0a] rounded border border-[#1e1e1e] font-mono text-xs text-gray-300">
                                          {t.message}
                                       </div>
                                     )}
                                  </div>
                                ))}
                             </div>
                           )}
                         </div>
                      )}
                    </div>
                  )}

                  {consoleTab === 'leaderboard' && (
                    <div className="px-2 py-4 h-full animate-fade-in">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1e1e1e]">
                        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <TrophyIcon className="w-4 h-4 text-yellow-500" /> Top Solvers
                        </h3>
                        <button 
                          onClick={fetchLeaderboard}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Refresh
                        </button>
                      </div>

                      {isLeaderboardLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" /> Loading leaderboard...
                        </div>
                      ) : leaderboard.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-8">
                          No one has solved this challenge yet. Be the first!
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {leaderboard.map((entry: any, idx: number) => (
                            <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0c0c0c] border border-[#1e1e1e]">
                              <div className="flex items-center gap-3">
                                <span className={`w-5 text-center font-bold text-sm ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-gray-600'}`}>
                                  #{idx + 1}
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-200">{entry.user?.username || entry.user?.name || 'Unknown'}</span>
                                  <span className="text-xs text-gray-500">{new Date(entry.completedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-500 uppercase">Cycles</span>
                                  <span className="text-sm font-mono text-blue-400">{entry.executionCycles || '-'}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-500 uppercase">Time</span>
                                  <span className="text-sm font-mono text-emerald-400">{entry.executionTimeMs > 0 ? `${entry.executionTimeMs}ms` : '<1ms'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
        </ResizablePanelGroup>
      </div>

      {/* ── GLOBAL BOTTOM BAR (Run / Submit Actions) ── */}
      <div className="h-14 bg-[#0c0c0c] border-t border-[#1e1e1e] flex items-center justify-between px-6 shrink-0 z-10">
         <div className="flex items-center gap-4">
           <button 
             onClick={() => setConsoleTab(consoleTab === 'testcase' ? 'result' : 'testcase')}
             className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-white transition-colors"
           >
             <Terminal className="w-4 h-4" /> Console
           </button>
         </div>
         <div className="flex items-center gap-3">
           <Button
             onClick={() => handleRunOrSubmit('run')}
             disabled={isRunning || isGrading || !selectedChallenge}
             variant="secondary"
             className="bg-[#1a1a1a] text-gray-200 hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#3a3a3a] h-9 px-5 text-sm transition-all shadow-sm"
           >
             {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
             Run Code
           </Button>
           
           {result?.action === 'run' && result?.success && (
             <Button
               onClick={() => handleRunOrSubmit('submit')}
               disabled={isGrading || isRunning || !selectedChallenge}
               className="bg-emerald-600 hover:bg-emerald-500 text-white border-none h-9 px-5 text-sm font-medium transition-all shadow-lg shadow-emerald-900/20"
             >
               {isGrading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CloudUpload className="w-4 h-4 mr-2" />}
               Submit
             </Button>
           )}
         </div>
      </div>
    </div>
  )
}
