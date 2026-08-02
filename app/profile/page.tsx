"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import SimulatorNav from "@/components/simulator-nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Trophy, User, LogOut, Settings, FolderOpen, 
  Clock, Play, Edit3, Save, DownloadCloud, Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserStats } from "@/hooks/use-user-stats"
import { useSettings } from "@/components/settings-provider"
import { UserAvatar, AVATAR_OPTIONS } from "@/components/user-avatar"
import Link from "next/link"

const ACHIEVEMENTS_LIST = [
  { id: "First Program", icon: "🌱", desc: "Write your first assembly program" },
  { id: "First Execution", icon: "🚀", desc: "Run your first program" },
  { id: "50 Programs", icon: "💾", desc: "Write 50 programs" },
  { id: "100 Executions", icon: "⚡", desc: "Execute 100 programs" },
  { id: "1,000 Executions", icon: "🔥", desc: "Execute 1,000 programs" },
  { id: "1 Hour Sim", icon: "⏱️", desc: "Spend 1 hour in the simulator" },
  { id: "Bug Squasher", icon: "🐛", desc: "Fix an error" },
  { id: "Fast Clock", icon: "🏎️", desc: "Run at max frequency" },
  { id: "Stack Master", icon: "🥞", desc: "Use PUSH/POP heavily" },
  { id: "Memory Wizard", icon: "🧠", desc: "Direct memory access expert" }
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { stats, updateStat, isLoaded } = useUserStats()
  const settings = useSettings()

  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "workspace" | "account">("profile")
  const [avatarId, setAvatarId] = useState(1)
  
  // Local profile state
  const [bio, setBio] = useState("Building the future of microprocessor education.")
  const [isEditingBio, setIsEditingBio] = useState(false)

  // Load avatar from localStorage
  useEffect(() => {
    const savedAvatar = localStorage.getItem("mp8085-avatar")
    if (savedAvatar) setAvatarId(parseInt(savedAvatar))
    const savedBio = localStorage.getItem("mp8085-bio")
    if (savedBio) setBio(savedBio)
  }, [])

  const handleAvatarChange = (id: number) => {
    setAvatarId(id)
    localStorage.setItem("mp8085-avatar", id.toString())
  }

  const saveBio = () => {
    localStorage.setItem("mp8085-bio", bio)
    setIsEditingBio(false)
  }

  if (status === "loading" || !isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Allow guests to see local profile
  // if (!session) { ... } removed so we fall back to local stats

  const user = session?.user || {
    name: "Guest Student",
    username: "guest",
    email: "Not signed in"
  }

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Preferences", icon: Settings },
    { id: "workspace", label: "Workspace", icon: FolderOpen },
    { id: "account", label: "Account", icon: Activity },
  ] as const

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SimulatorNav />
      
      <main className="max-w-[1200px] w-full mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* ── Left Sidebar: Profile Card & Nav ─────────────────────── */}
        <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
          
          {/* Profile Card */}
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <div className="h-24 w-full bg-gradient-to-r from-muted to-muted-foreground/10"></div>
            <CardContent className="pt-0 relative px-6 pb-6">
              <div className="absolute -top-12 left-6 ring-4 ring-background rounded-full">
                <UserAvatar avatarId={avatarId} className="w-20 h-20" />
              </div>
              
              <div className="pt-10">
                <h1 className="text-xl font-bold">{user?.name || "User"}</h1>
                <p className="text-sm text-muted-foreground">@{user?.username || user?.email?.split('@')[0] || "student"}</p>
                
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px]">
                    Free Plan
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Minimal Stats */}
              <div className="grid grid-cols-1 gap-4 mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Save className="w-4 h-4" /> Programs Created
                  </div>
                  <span className="font-semibold">{stats.programsCreated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Play className="w-4 h-4" /> Programs Executed
                  </div>
                  <span className="font-semibold">{stats.programsExecuted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" /> Simulator Hours
                  </div>
                  <span className="font-semibold">{(stats.simulatorSeconds / 3600).toFixed(1)}h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Minimal Navigation */}
          <nav className="flex flex-col gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Right Content Area ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* PROFILE SECTION */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold border-b border-border pb-2">Profile Information</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Display Name</label>
                  <p className="text-sm font-medium p-2.5 bg-muted/30 rounded-md border border-border/50">{user?.name || "Not set"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <p className="text-sm font-medium p-2.5 bg-muted/30 rounded-md border border-border/50">{user?.email || "Not set"}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Bio (Max 100 chars)</label>
                    <button onClick={() => isEditingBio ? saveBio() : setIsEditingBio(true)} className="text-xs text-primary hover:underline">
                      {isEditingBio ? "Save" : "Edit"}
                    </button>
                  </div>
                  {isEditingBio ? (
                    <input 
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 100))}
                      onKeyDown={(e) => e.key === "Enter" && saveBio()}
                      autoFocus
                      className="w-full text-sm font-medium p-2.5 bg-background rounded-md border border-primary outline-none"
                    />
                  ) : (
                    <p className="text-sm font-medium p-2.5 bg-muted/30 rounded-md border border-border/50 min-h-[42px]">{bio}</p>
                  )}
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Select Avatar</label>
                  <div className="flex flex-wrap gap-4">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleAvatarChange(opt.id)}
                        className={`p-1 rounded-full transition-all ${avatarId === opt.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:scale-105 opacity-70 hover:opacity-100"}`}
                      >
                        <UserAvatar avatarId={opt.id} className="w-12 h-12" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES SECTION */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold border-b border-border pb-2">Preferences (Quick Access)</h2>
              
              <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Application color scheme</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground/80 font-medium capitalize">Unknown / System</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">Editor Font Size</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Size of code in the editor</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground/80 font-medium">{settings.fontSize}px</span>
                    <button className="text-muted-foreground hover:text-foreground"><Edit3 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium">Auto-Save</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Persist code automatically</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground/80 font-medium">{settings.autoSave ? "Enabled" : "Disabled"}</span>
                    <button className="text-muted-foreground hover:text-foreground" onClick={() => settings.setAutoSave(!settings.autoSave)}><Edit3 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground px-1">Note: Full settings are accessible from the simulator page gear icon.</p>
            </div>
          )}

          {/* WORKSPACE & ACHIEVEMENTS SECTION */}
          {activeTab === "workspace" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4">Workspace</h2>
                
                {stats.recentFiles.length > 0 ? (
                  <div className="grid gap-2">
                    {stats.recentFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <FileCodeIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground">Opened {new Date(f.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="/simulator">Open</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 border border-dashed border-border rounded-xl bg-muted/10">
                    <p className="text-sm text-muted-foreground">No recent files found. Go to the simulator to write some code!</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/simulator">Open Simulator</Link>
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold border-b border-border pb-2 mb-4">Achievements</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ACHIEVEMENTS_LIST.map((ach) => {
                    const unlocked = stats.achievements.includes(ach.id)
                    return (
                      <div key={ach.id} className={`p-3 rounded-lg border flex gap-3 transition-colors ${unlocked ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/10 opacity-60 grayscale'}`}>
                        <div className="text-2xl">{ach.icon}</div>
                        <div>
                          <p className="text-sm font-medium">{ach.id}</p>
                          <p className="text-[10px] text-muted-foreground">{ach.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT SECTION */}
          {activeTab === "account" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-semibold border-b border-border pb-2">Account Actions</h2>
              
              <div className="grid gap-3 max-w-md">
                <Button variant="outline" className="justify-start gap-3">
                  <Edit3 className="w-4 h-4 text-muted-foreground" /> Change Password
                </Button>
                <Button variant="outline" className="justify-start gap-3">
                  <DownloadCloud className="w-4 h-4 text-muted-foreground" /> Export Data
                </Button>
                <Button variant="outline" className="justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                  <Trophy className="w-4 h-4" /> Delete Account
                </Button>
                <div className="my-2" />
                <Button variant="default" onClick={() => signOut()} className="justify-start gap-3 w-full bg-muted text-foreground hover:bg-muted/80">
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

function FileCodeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 17 2-2-2-2" />
    </svg>
  )
}
