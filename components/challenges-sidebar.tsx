'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  Bookmark, 
  PlayCircle, 
  FileText, 
  FileCode,
  Flame
} from 'lucide-react'

export function ChallengesSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [streak, setStreak] = useState<number>(0)

  useEffect(() => {
    fetch('/api/user/streak')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.streakDays === 'number') {
          setStreak(data.streakDays)
        }
      })
      .catch(console.error)
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }

  const getButtonClass = (path: string) => {
    return `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive(path) 
        ? 'text-blue-400 bg-blue-500/10' 
        : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]'
    }`
  }

  const getStreakStyle = (streakCount: number) => {
    if (streakCount === 0) {
      return {
        container: "bg-[#1a1a1a] border border-[#2a2a2a]",
        icon: "text-gray-600",
        text: "text-gray-500",
        animation: ""
      }
    }
    if (streakCount < 3) {
      return {
        container: "bg-orange-500/10 border border-orange-500/20",
        icon: "text-orange-400",
        text: "text-orange-400",
        animation: "animate-pulse"
      }
    }
    if (streakCount < 7) {
      return {
        container: "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.3)]",
        icon: "text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]",
        text: "text-orange-500 font-extrabold",
        animation: "animate-pulse"
      }
    }
    // 7+ days (crazy glow)
    return {
      container: "bg-gradient-to-r from-orange-600/30 via-red-500/30 to-purple-600/30 border border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.6)]",
      icon: "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,1)] animate-bounce",
      text: "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-black",
      animation: ""
    }
  }

  const streakStyle = getStreakStyle(streak)

  return (
    <aside className="w-64 border-r border-[#1e1e1e] bg-[#0c0c0c] h-full py-6 px-4 shrink-0 relative overflow-hidden">
      
      <div className="h-[calc(100%-80px)] overflow-y-auto hide-scrollbar pr-2 -mr-2">
        <div className="mb-8">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Learn
          </h3>
          <div className="space-y-1">
            <button 
              onClick={() => router.push('/challenges/dashboard')}
              className={getButtonClass('/challenges/dashboard')}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </div>
            </button>
            <button 
              onClick={() => router.push('/challenges')}
              className={getButtonClass('/challenges')}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" /> Problem Set
              </div>
            </button>
            <button 
              onClick={() => router.push('/challenges/submissions')}
              className={getButtonClass('/challenges/submissions')}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4" /> My Submissions
              </div>
            </button>
            <button 
              onClick={() => router.push('/challenges/bookmarks')}
              className={getButtonClass('/challenges/bookmarks')}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4" /> Bookmarks
              </div>
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Resources
          </h3>
          <div className="space-y-1">
            <button 
              onClick={() => router.push('/challenges/tutorials')}
              className={getButtonClass('/challenges/tutorials')}
            >
              <div className="flex items-center gap-3">
                <PlayCircle className="w-4 h-4" /> Tutorials
              </div>
            </button>
            <button 
              onClick={() => router.push('/challenges/manual')}
              className={getButtonClass('/challenges/manual')}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" /> 8085 Manual
              </div>
            </button>
            <button 
              onClick={() => router.push('/challenges/cheatsheet')}
              className={getButtonClass('/challenges/cheatsheet')}
            >
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4" /> Cheat Sheet
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className={`absolute bottom-6 left-4 right-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-500 ${streakStyle.container}`}>
        <Flame className={`w-5 h-5 ${streakStyle.icon} ${streakStyle.animation}`} />
        <span className={`text-sm ${streakStyle.text}`}>
          {streak === 0 ? "Start a Streak!" : `${streak} Day Streak!`}
        </span>
      </div>
    </aside>
  )
}
