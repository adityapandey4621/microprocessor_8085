'use client'

import { useState, useEffect } from 'react'
import SimulatorNav from '@/components/simulator-nav'
import { ChallengesSidebar } from '@/components/challenges-sidebar'
import { Loader2, User, MapPin, Award, Star, TrendingUp, Medal, Flame } from 'lucide-react'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/dashboard')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="h-screen overflow-hidden bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
        <SimulatorNav />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    )
  }

  const hexScore = data?.stats?.rating || 0

  let stars = 1
  if (hexScore > 250) stars = 5
  else if (hexScore > 150) stars = 4
  else if (hexScore > 80) stars = 3
  else if (hexScore > 30) stars = 2

  const starArray = Array(stars).fill(0)

  // Generate dynamic heatmap data
  const weeks = 24
  const days = 7
  const heatmapGrid = []
  
  // Create a map of date string to submission count
  const submissionsMap: Record<string, number> = {}
  if (data?.submissions) {
    data.submissions.forEach((sub: any) => {
      const dateStr = new Date(sub.completedAt).toISOString().split('T')[0]
      submissionsMap[dateStr] = (submissionsMap[dateStr] || 0) + 1
    })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (weeks * days - 1)) // start 24 weeks ago

  for (let i = 0; i < weeks; i++) {
    const week = []
    for (let j = 0; j < days; j++) {
      const cellDate = new Date(startDate)
      cellDate.setDate(startDate.getDate() + (i * days + j))
      const dateStr = cellDate.toISOString().split('T')[0]
      
      const count = submissionsMap[dateStr] || 0
      week.push(count)
    }
    heatmapGrid.push(week)
  }

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-[#1a1a1a] border border-[#2a2a2a]'
    if (count === 1) return 'bg-emerald-900 border border-emerald-500/30'
    if (count === 2) return 'bg-emerald-600 border border-emerald-400/50'
    return 'bg-emerald-400 border border-emerald-300'
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
      <SimulatorNav />

      <div className="flex flex-1 overflow-hidden">
        <ChallengesSidebar />

        <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN: Profile & Heatmap */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] p-6 shadow-sm">
                  <div className="flex items-center gap-6 pb-6 border-b border-[#1e1e1e]">
                    <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border-2 border-[#333] flex items-center justify-center text-3xl font-bold">
                      {data?.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-white">{data?.user?.name || 'Developer'}</h1>
                        {data?.stats?.streakDays > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400">
                            <Flame className="w-3.5 h-3.5 fill-orange-400" />
                            <span className="text-xs font-bold">{data.stats.streakDays}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5 bg-[#1a1a1a] px-2.5 py-1 rounded-md border border-[#2a2a2a]">
                          <User className="w-4 h-4" /> {data?.user?.username || 'user' + data?.user?.id?.substring(0, 5)}
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#1a1a1a] px-2.5 py-1 rounded-md border border-[#2a2a2a]">
                          <MapPin className="w-4 h-4" /> {data?.user?.country || 'Global'}
                        </span>
                      </div>
                      {data?.user?.bio && (
                        <p className="mt-3 text-sm text-gray-300 italic">"{data.user.bio}"</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-white tracking-wide">Submissions Heat Map</h3>
                      <div className="text-xs text-gray-400">
                        <span className="text-emerald-400 font-semibold">{data?.stats?.challengesSolved || 0}</span> Total Solved
                      </div>
                    </div>
                    
                    <div className="flex gap-1 overflow-x-auto pb-4 hide-scrollbar">
                      {heatmapGrid.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1">
                          {week.map((count, dIdx) => (
                            <div 
                              key={dIdx} 
                              className={`w-3 h-3 rounded-[2px] transition-colors ${getHeatmapColor(count)}`}
                              title={`${count} submissions`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-500">
                      <span>Less</span>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-[2px] bg-[#1a1a1a] border border-[#2a2a2a]" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-900 border border-emerald-500/30" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-600 border border-emerald-400/50" />
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-300" />
                      </div>
                      <span>More</span>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] p-6 hover:border-[#2a2a2a] transition-colors">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Challenges Solved</h3>
                    <div className="text-4xl font-bold text-white">{data?.stats?.challengesSolved || 0}</div>
                  </div>
                  <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] p-6 hover:border-[#2a2a2a] transition-colors">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total CPU Cycles</h3>
                    <div className="text-4xl font-bold text-blue-400">{data?.stats?.totalCpuCycles || 0}</div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Hex Score & Badges */}
              <div className="space-y-6">
                
                {/* Hex Score Card */}
                <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] p-6 text-center hover:border-[#2a2a2a] transition-colors">
                  <div className="inline-flex gap-1 mb-4">
                    {starArray.map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Hex Score</div>
                  <div className="text-6xl font-bold text-white mb-6">
                    {hexScore}
                  </div>
                  
                  <div className="flex divide-x divide-[#1e1e1e] border-t border-[#1e1e1e] pt-6">
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-blue-400">{data?.ranks?.global || '-'}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1 font-semibold">Global Rank</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-emerald-400">{data?.ranks?.country || '-'}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1 font-semibold">Country Rank</div>
                    </div>
                  </div>
                </div>

                {/* Badges Card */}
                <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] p-6">
                  <h3 className="text-sm font-semibold text-white border-b border-[#1e1e1e] pb-4 mb-4 flex items-center gap-2">
                    <Medal className="w-4 h-4 text-amber-500" /> Badges
                  </h3>
                  
                  <div className="space-y-4">
                    
                    {/* Badge 1: Assembly Rookie */}
                    <div className={`flex items-center gap-4 transition-all duration-300 ${data?.stats?.badges?.includes('5_challenges') ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Award className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-200">Assembly Rookie</div>
                        <div className="text-xs text-gray-500">Solve first 5 challenges</div>
                      </div>
                    </div>
                    
                    {/* Badge 2: Register Master */}
                    <div className={`flex items-center gap-4 transition-all duration-300 ${data?.stats?.badges?.includes('25_challenges') ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-200">Register Master</div>
                        <div className="text-xs text-gray-500">Solve 25+ challenges</div>
                      </div>
                    </div>

                    {/* Badge 3: 7-Day Streak */}
                    <div className={`flex items-center gap-4 transition-all duration-300 ${data?.stats?.badges?.includes('7_day_streak') ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                        <Flame className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-200">7-Day Streak</div>
                        <div className="text-xs text-gray-500">Solve challenges 7 days in a row</div>
                      </div>
                    </div>

                    {/* Badge 4: Daily Grinder */}
                    <div className={`flex items-center gap-4 transition-all duration-300 ${data?.stats?.badges?.includes('first_daily') ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                      <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/20">
                        <Star className="w-6 h-6 text-pink-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-200">Daily Grinder</div>
                        <div className="text-xs text-gray-500">Solve your first Daily Challenge</div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
