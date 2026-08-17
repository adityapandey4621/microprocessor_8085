"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Cpu, Settings, LogOut, User, LogIn, Menu, X, Radio, Zap, Trophy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import SettingsDialog from "@/components/settings-dialog"

const NAV_ITEMS = [
  { name: "Simulator", href: "/simulator" },
  { name: "Classroom", href: "/classroom", badge: "Live", icon: Radio, badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { name: "Gallery", href: "/gallery", badge: "Redis", icon: Zap, badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { name: "Challenges", href: "/challenges", badge: "Grader", icon: Trophy, badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { name: "Documentation", href: "/documentation" },
  { name: "Examples", href: "/examples" },
]

export default function SimulatorNav() {
  const { data: session } = useSession()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between gap-4 max-w-[1800px] mx-auto">

          {/* ── Logo ─────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center shrink-0">
            <img src="/latch-logo.svg" alt="LATCH Logo" className="h-6" />
          </Link>

          {/* ── Center nav links (desktop) ──────────────────────── */}
          <div className="hidden lg:flex items-center gap-1.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all flex items-center gap-1.5 group"
              >
                {item.name}
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${item.badgeColor} flex items-center gap-1`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* ── Right actions ────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Settings button (desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* User auth menu */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-xs">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {session.user.name || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-foreground truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer text-xs">
                      <User className="w-3.5 h-3.5 mr-2" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSettingsOpen(true)}
                    className="cursor-pointer text-xs"
                  >
                    <Settings className="w-3.5 h-3.5 mr-2" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-xs text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => signIn()}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 text-muted-foreground"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* ── Mobile menu ─────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1 animate-slide-down">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-between"
              >
                <span>{item.name}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={() => { setSettingsOpen(true); setMobileMenuOpen(false) }}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-left"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
        )}
      </nav>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
