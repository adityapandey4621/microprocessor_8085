'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SimulatorNav from '@/components/simulator-nav'
import { ChallengesSidebar } from '@/components/challenges-sidebar'
import { 
  Loader2, Search, Filter, BookOpen, Code, Calendar, 
  ArrowRight, Bookmark, BookmarkCheck, Flame, Star
} from 'lucide-react'

interface ChallengeItem {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  concepts: string
  description: string
  topic: string
  isBookmarked?: boolean
}

export default function ChallengesProblemSetPage() {
  const router = useRouter()
  const [challenges, setChallenges] = useState<ChallengeItem[]>([])
  const [dailyChallenge, setDailyChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')
  const [visibleCount, setVisibleCount] = useState(10)

  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const [res, dailyRes] = await Promise.all([
          fetch('/api/challenge/list', { cache: 'no-store' }),
          fetch('/api/challenge/daily', { cache: 'no-store' })
        ])
        if (res.ok) {
          const data = await res.json()
          setChallenges(data.challenges || [])
        }
        if (dailyRes.ok) {
          const dailyData = await dailyRes.json()
          setDailyChallenge(dailyData.daily?.challenge || null)
        }
      } catch (err) {
        console.error("Failed to load challenges:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchChallenges()
    
    // Set current date on client-side to prevent hydration mismatches
    setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
  }, [])

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(10)
  }, [search, selectedTopic, selectedDifficulty])

  const toggleBookmark = async (e: React.MouseEvent, challengeId: string, currentStatus: boolean) => {
    e.stopPropagation()
    // Optimistic UI update
    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, isBookmarked: !currentStatus } : c))
    
    try {
      const res = await fetch('/api/challenge/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, action: currentStatus ? 'remove' : 'add' })
      })
      if (res.status === 401) {
        // Token is invalid or user doesn't exist anymore
        await signOut({ redirect: false })
        signIn()
        throw new Error("Session invalid")
      }
      if (!res.ok) {
        throw new Error("Failed to bookmark")
      }
    } catch (err: any) {
      // Revert on failure
      setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, isBookmarked: currentStatus } : c))
      if (err.message !== "Session invalid") {
        alert("Failed to update bookmark. Please make sure you are logged in.")
      }
    }
  }

  // Derived filters
  const topics = ['All', ...Array.from(new Set(challenges.map(c => c.topic || 'General'))).sort()]
  const difficulties = ['All', 'Easy', 'Medium', 'Hard']

  // Filtered Data
  const filtered = challenges.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                        (c.concepts && c.concepts.toLowerCase().includes(search.toLowerCase()))
    const matchTopic = selectedTopic === 'All' || c.topic === selectedTopic
    const matchDiff = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty
    return matchSearch && matchTopic && matchDiff
  })

  const visibleChallenges = filtered.slice(0, visibleCount)

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
      <SimulatorNav />

      <div className="flex flex-1 overflow-hidden">
        <ChallengesSidebar />

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Code className="w-6 h-6" />
                  </div>
                  Problem Set
                </h1>
                <p className="text-gray-400 text-sm">Master 8085 Assembly with these curated coding challenges.</p>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#1e1e1e] px-4 py-2.5 rounded-lg border border-[#2a2a2a]">
                <Calendar className="w-4 h-4" />
                <span>Today<br/>{currentDate}</span>
              </div>
            </div>

            {/* Daily Challenge Banner */}
            {dailyChallenge && (
              <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-pink-500/30 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Star className="w-32 h-32 text-pink-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-pink-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">Daily Question</span>
                    <span className="text-pink-400 text-sm font-semibold flex items-center gap-1"><Flame className="w-4 h-4"/> +10 Bonus Hex Score</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{dailyChallenge.title}</h2>
                  <p className="text-gray-300 text-sm max-w-xl line-clamp-2">{dailyChallenge.description}</p>
                </div>
                <button
                  onClick={() => router.push(`/challenges/${dailyChallenge.id}`)}
                  className="relative z-10 shrink-0 bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_30px_rgba(219,39,119,0.5)]"
                >
                  Solve Daily Challenge <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="bg-[#121212] p-2.5 rounded-xl border border-[#1e1e1e] mb-6 flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search challenges..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#333] transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="hidden md:flex items-center text-gray-500 px-2">
                <Filter className="w-4 h-4" />
              </div>

              {/* Topic Dropdown */}
              <div className="w-full md:w-48">
                <select 
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#333] transition-all appearance-none cursor-pointer"
                >
                  <option value="All">All Domains</option>
                  {topics.filter(t => t !== 'All').map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Dropdown */}
              <div className="w-full md:w-40">
                <select 
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#333] transition-all appearance-none cursor-pointer"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e1e1e]">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-16">#</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Domain</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Difficulty</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading challenges...
                          </div>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                          No challenges found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      visibleChallenges.map((challenge, index) => (
                        <tr 
                          key={challenge.id} 
                          className="hover:bg-[#1a1a1a] transition-colors group"
                        >
                          <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                            {(index + 1).toString().padStart(2, '0')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-200 group-hover:text-white transition-colors text-sm">
                              {challenge.title}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[11px] text-gray-400 bg-[#1e1e1e] px-3 py-1.5 rounded-full whitespace-nowrap">
                              {challenge.topic}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[11px] px-3 py-1.5 rounded-full font-bold tracking-wide whitespace-nowrap ${
                                challenge.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/10' : 
                                challenge.difficulty === 'Medium' ? 'text-amber-400 bg-amber-400/10' : 
                                'text-red-400 bg-red-400/10'
                              }`}
                            >
                              {challenge.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={(e) => toggleBookmark(e, challenge.id, !!challenge.isBookmarked)}
                                className={`p-2 rounded-lg transition-colors ${challenge.isBookmarked ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a]'}`}
                                title={challenge.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                              >
                                {challenge.isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); router.push(`/challenges/${challenge.id}`); }}
                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all"
                              >
                                Solve <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {visibleCount < filtered.length && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="px-6 py-2.5 bg-[#121212] hover:bg-[#1a1a1a] border border-[#1e1e1e] text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Load More Questions
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
