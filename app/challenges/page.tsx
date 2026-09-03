'use client'

import { useState, useEffect } from 'react'
import SimulatorNav from '@/components/simulator-nav'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Play,
  CheckCircle2,
  XCircle,
  Cpu,
  Code2,
  BookOpen,
  Loader2,
  List,
  Calendar,
  CheckSquare,
  Terminal,
  CloudUpload,
  AlertTriangle
} from 'lucide-react'
import { useTheme } from "next-themes"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import CodeEditor from '@/components/code-editor'
import { useUserStats } from '@/hooks/use-user-stats'

interface ChallengeItem {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  concepts: string
  description: string
  instructions: string
  starterCode: string
  sampleSolution: string
}

export default function ChallengesPage() {
  const { resolvedTheme } = useTheme()
  const [challenges, setChallenges] = useState<ChallengeItem[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeItem | null>(null)
  const [potdId, setPotdId] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [isGrading, setIsGrading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  
  const { recordChallengeAttempt, recordChallengeSolved } = useUserStats()
  
  const [leftTab, setLeftTab] = useState<'description' | 'problems'>('description')
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase')

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch('/api/challenge/list')
        const data = await res.json()
        if (data.challenges && data.challenges.length > 0) {
          setChallenges(data.challenges)

          const today = new Date()
          const dateString = today.toISOString().split('T')[0]
          let hash = 0
          for (let i = 0; i < dateString.length; i++) {
            hash = dateString.charCodeAt(i) + ((hash << 5) - hash)
          }
          const todayIndex = Math.abs(hash) % data.challenges.length
          const potd = data.challenges[todayIndex]
          
          setPotdId(potd.id)
          handleSelectChallenge(potd)
        }
      } catch (err) {
        console.error("Failed to load challenges:", err)
      }
    }
    fetchChallenges()
  }, [])

  const handleSelectChallenge = (item: ChallengeItem) => {
    setSelectedChallenge(item)
    setCode(item.starterCode)
    setResult(null)
    setLeftTab('description')
    setConsoleTab('testcase')
  }

  const handleRunOrSubmit = async (type: 'run' | 'submit') => {
    if (!selectedChallenge) return
    
    if (type === 'submit') setIsGrading(true)
    else setIsRunning(true)
    
    setResult(null)
    setConsoleTab('result') // Auto switch to result tab

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
      // Store the action we just performed so UI knows if it was a run or submit
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

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden font-sans text-gray-200">
      <SimulatorNav />

      {/* ── Main Workspace ──────────────────────────────────────────── */}
      <div className="flex-1 p-2 pb-0">
        <ResizablePanelGroup direction="horizontal" className="h-full gap-2">
          
          {/* ── LEFT PANE: Description / Problem List ── */}
          <ResizablePanel defaultSize={45} minSize={25} className="flex flex-col bg-[#1e1e1e] rounded-t-lg border border-[#333333]">
            {/* Left Tabs */}
            <div className="h-11 bg-[#252526] flex items-center px-2 shrink-0 border-b border-[#333333] rounded-t-lg">
              <button 
                onClick={() => setLeftTab('description')}
                className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-md transition-colors ${leftTab === 'description' ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2d2d30]'}`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Description
              </button>
              <button 
                onClick={() => setLeftTab('problems')}
                className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-md transition-colors ${leftTab === 'problems' ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2d2d30]'}`}
              >
                <List className="w-3.5 h-3.5" /> Problem List
              </button>
            </div>

            {/* Left Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {leftTab === 'problems' && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold text-gray-300 mb-2">All Challenges</h2>
                  {challenges.length === 0 ? (
                    <div className="text-sm text-gray-500 flex flex-col items-center py-10">
                       <Loader2 className="w-5 h-5 animate-spin mb-3" />
                       Loading...
                    </div>
                  ) : (
                    challenges.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectChallenge(item)}
                        className={`text-left p-4 rounded-lg border transition-all ${
                          selectedChallenge?.id === item.id
                            ? 'bg-[#2d2d30] border-blue-500/50 shadow-sm'
                            : 'bg-[#252526] border-[#333] hover:border-[#444]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              item.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/10' : 
                              item.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10' : 
                              'text-red-400 bg-red-400/10'
                            }`}
                          >
                            {item.difficulty}
                          </span>
                          {item.id === potdId && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-blue-400 bg-blue-400/10 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> POTD
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-sm text-gray-200">{index + 1}. {item.title}</div>
                        <div className="text-xs text-gray-500 mt-1.5 truncate">{item.concepts || "General Concepts"}</div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {leftTab === 'description' && selectedChallenge && (
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
                        {selectedChallenge.id === potdId && (
                           <span className="text-xs px-2 py-1 rounded-full font-medium text-blue-400 bg-blue-400/10 flex items-center gap-1.5">
                             <Calendar className="w-3.5 h-3.5" /> Problem of the Day
                           </span>
                        )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedChallenge.description}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-[#333]">
                     <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                       <CheckSquare className="w-4 h-4 text-emerald-400" /> Instructions
                     </h3>
                     <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                       {selectedChallenge.instructions}
                     </p>
                  </div>
                </div>
              )}
              
              {leftTab === 'description' && !selectedChallenge && (
                 <div className="text-sm text-gray-500 flex flex-col items-center py-20">
                   <Loader2 className="w-6 h-6 animate-spin mb-4" />
                   Loading problem...
                 </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-2 bg-transparent" />

          {/* ── RIGHT PANE: Editor & Console ── */}
          <ResizablePanel defaultSize={55} minSize={30}>
            <ResizablePanelGroup direction="vertical" className="gap-2">
              
              {/* TOP RIGHT: Editor */}
              <ResizablePanel defaultSize={60} minSize={20} className="flex flex-col rounded-t-lg">
                <CodeEditor
                  code={code}
                  setCode={setCode}
                  activeLine={null}
                />
              </ResizablePanel>
              
              <ResizableHandle className="h-2 bg-transparent" />

              {/* BOTTOM RIGHT: Console */}
              <ResizablePanel defaultSize={40} minSize={10} className="flex flex-col bg-[#1e1e1e] rounded-t-lg border border-[#333333]">
                {/* Console Tabs */}
                <div className="h-11 bg-[#252526] flex items-center px-2 shrink-0 border-b border-[#333333] rounded-t-lg">
                  <button 
                    onClick={() => setConsoleTab('testcase')}
                    className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-md transition-colors ${consoleTab === 'testcase' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Testcases
                  </button>
                  <button 
                    onClick={() => setConsoleTab('result')}
                    className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-md transition-colors ${consoleTab === 'result' ? (result?.score === 100 ? 'text-emerald-400' : result ? 'text-red-400' : 'text-white') : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    <Terminal className="w-3.5 h-3.5" /> Test Result
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {consoleTab === 'testcase' && (
                    <div className="text-sm text-gray-400 px-2 py-4">
                      {selectedChallenge ? (
                         <div className="space-y-4">
                            <p>The code will be evaluated against hidden test cases in the 8085 emulator.</p>
                            <div className="p-4 bg-[#252526] rounded-lg border border-[#333]">
                               <span className="font-semibold text-gray-300">Emulator Rules:</span>
                               <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400 text-xs">
                                  <li>Memory begins at <code className="text-blue-400">0x2000</code>.</li>
                                  <li>Code execution halts at <code className="text-blue-400">HLT</code> instruction.</li>
                                  <li>Max execution limit: 50,000 cycles.</li>
                               </ul>
                            </div>
                         </div>
                      ) : (
                        "Select a challenge to view test case information."
                      )}
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
                           <div className="flex items-center justify-between pb-4 border-b border-[#333]">
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
                             <div className="p-4 mt-2 rounded-lg bg-[#252526] border border-emerald-900/50 flex flex-col items-center justify-center text-center gap-3">
                               <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                                 <Trophy className="w-5 h-5" /> All Tests Passed!
                               </div>
                               <div className="text-sm text-gray-300">
                                 Your solution executed in <strong className="text-white">{result.executionCycles} T-cycles</strong>.
                                 {result.optimalCycles && result.executionCycles <= result.optimalCycles ? (
                                    <span className="text-emerald-400 block mt-1">Excellent! Your solution is highly optimized.</span>
                                 ) : result.optimalCycles ? (
                                    <span className="text-amber-400 block mt-1">Can you optimize it closer to {result.optimalCycles} cycles?</span>
                                 ) : null}
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
                                       <div className="mt-2 p-3 bg-[#1e1e1e] rounded border border-[#333] font-mono text-xs text-gray-300">
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
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
        </ResizablePanelGroup>
      </div>

      {/* ── GLOBAL BOTTOM BAR (Run / Submit Actions) ── */}
      <div className="h-14 bg-[#1e1e1e] border-t border-[#333] flex items-center justify-between px-6 shrink-0 z-10">
         <div className="flex items-center gap-4">
           <button 
             onClick={() => setConsoleTab(consoleTab === 'testcase' ? 'result' : 'testcase')}
             className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
           >
             <Terminal className="w-4 h-4" /> Console
           </button>
         </div>
         <div className="flex items-center gap-3">
           <Button
             onClick={() => handleRunOrSubmit('run')}
             disabled={isRunning || isGrading || !selectedChallenge}
             variant="secondary"
             className="bg-[#2d2d30] text-gray-200 hover:bg-[#3d3d40] border-none h-9 px-5 text-sm transition-all"
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
