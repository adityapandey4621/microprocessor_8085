"use client"

import { useState, useEffect } from "react"

export interface UserStats {
  programsCreated: number
  programsExecuted: number
  simulatorSeconds: number
  challengesAttempted: number
  challengesSolved: number
  achievements: string[]
  recentFiles: { name: string; date: string }[]
}

const DEFAULT_STATS: UserStats = {
  programsCreated: 0,
  programsExecuted: 0,
  simulatorSeconds: 0,
  challengesAttempted: 0,
  challengesSolved: 0,
  achievements: [],
  recentFiles: [],
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load stats from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mp8085-user-stats")
      if (stored) {
        setStats(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Failed to load user stats", e)
    }
    setIsLoaded(true)
  }, [])

  // Update a stat and save to local storage
  const updateStat = <K extends keyof UserStats>(key: K, value: UserStats[K] | ((prev: UserStats[K]) => UserStats[K])) => {
    setStats((prev) => {
      const newValue = typeof value === "function" ? (value as any)(prev[key]) : value
      const nextStats = { ...prev, [key]: newValue }
      
      // Auto-unlock achievements based on stats
      const achievements = new Set(nextStats.achievements)
      if (nextStats.programsExecuted >= 1) achievements.add("First Execution")
      if (nextStats.programsExecuted >= 100) achievements.add("100 Executions")
      if (nextStats.programsExecuted >= 1000) achievements.add("1,000 Executions")
      if (nextStats.programsCreated >= 1) achievements.add("First Program")
      if (nextStats.programsCreated >= 50) achievements.add("50 Programs")
      if (nextStats.simulatorSeconds >= 3600) achievements.add("1 Hour Sim")
      
      if (achievements.size > nextStats.achievements.length) {
        nextStats.achievements = Array.from(achievements)
      }

      localStorage.setItem("mp8085-user-stats", JSON.stringify(nextStats))
      return nextStats
    })
  }

  const recordExecution = () => updateStat("programsExecuted", (v: number) => v + 1)
  const recordProgramCreated = () => updateStat("programsCreated", (v: number) => v + 1)
  const recordChallengeAttempt = () => updateStat("challengesAttempted", (v: number) => v + 1)
  const recordChallengeSolved = () => updateStat("challengesSolved", (v: number) => v + 1)
  
  const addRecentFile = (name: string) => {
    updateStat("recentFiles", (prev: { name: string; date: string }[]) => {
      const filtered = prev.filter(f => f.name !== name)
      return [{ name, date: new Date().toISOString() }, ...filtered].slice(0, 5)
    })
  }

  return {
    stats,
    isLoaded,
    updateStat,
    recordExecution,
    recordProgramCreated,
    recordChallengeAttempt,
    recordChallengeSolved,
    addRecentFile
  }
}
