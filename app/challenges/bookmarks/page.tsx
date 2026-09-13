'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import SimulatorNav from '@/components/simulator-nav'
import { ChallengesSidebar } from '@/components/challenges-sidebar'
import { 
  Loader2, Bookmark, BookmarkCheck, ArrowRight, BookOpen, LogIn
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

export default function BookmarksPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [challenges, setChallenges] = useState<ChallengeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false)
      return
    }
    if (status === 'loading') return

    const fetchChallenges = async () => {
      try {
        const res = await fetch('/api/challenge/list', { cache: 'no-store' })
        if (res.status === 401) {
           await signOut({ redirect: false })
           signIn()
           return
        }
        if (res.ok) {
          const data = await res.json()
          setChallenges(data.challenges || [])
        }
      } catch (err) {
        console.error("Failed to load challenges:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchChallenges()
  }, [status])

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

  // Filter ONLY bookmarked
  const bookmarkedChallenges = challenges.filter(c => c.isBookmarked)

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
      <SimulatorNav />

      <div className="flex flex-1 overflow-hidden">
        <ChallengesSidebar />

        <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Bookmarks</h1>
                <p className="text-sm text-gray-400">Your saved challenges for quick access or later review.</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e1e1e] bg-[#0c0c0c]">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Domain</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Difficulty</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {status === 'unauthenticated' ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <LogIn className="w-10 h-10 text-gray-600 mb-2" />
                            <h3 className="text-gray-300 font-medium">Authentication Required</h3>
                            <p className="text-gray-500 text-sm max-w-sm">
                              Please log in to save and view your bookmarked challenges.
                            </p>
                            <button 
                              onClick={() => signIn()}
                              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Log In
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading bookmarks...
                          </div>
                        </td>
                      </tr>
                    ) : bookmarkedChallenges.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Bookmark className="w-10 h-10 text-gray-600 mb-2" />
                            <h3 className="text-gray-300 font-medium">No bookmarks yet</h3>
                            <p className="text-gray-500 text-sm max-w-sm">
                              You haven't bookmarked any challenges. Go to the Problem Set to find challenges to save!
                            </p>
                            <button 
                              onClick={() => router.push('/challenges')}
                              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Explore Problem Set
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      bookmarkedChallenges.map((challenge) => (
                        <tr 
                          key={challenge.id} 
                          className="hover:bg-[#1a1a1a] transition-colors group"
                        >
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
                                className="p-2 rounded-lg transition-colors text-blue-400 bg-blue-500/10"
                                title="Remove Bookmark"
                              >
                                <BookmarkCheck className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); router.push(`/challenges/${challenge.id}`); }}
                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-4 py-2 rounded-lg transition-all"
                              >
                                Solve
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

          </div>
        </main>
      </div>
    </div>
  )
}
