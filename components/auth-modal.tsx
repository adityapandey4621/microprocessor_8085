"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cpu, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "login" | "signup"
  setMode: (mode: "login" | "signup") => void
}

export default function AuthModal({ open, onOpenChange, mode, setMode }: AuthModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")

  const handleOAuth = async (provider: string) => {
    setError("")
    setLoading(true)
    await signIn(provider, { callbackUrl: "/simulator" })
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "signup") {
        // Register flow
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username, name }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to register")
        }

        // Auto-login after register
        const signInRes = await signIn("credentials", {
          usernameOrEmail: email,
          password,
          redirect: false,
        })

        if (signInRes?.error) {
          throw new Error(signInRes.error)
        }
        
        router.push("/simulator")
        onOpenChange(false)
      } else {
        // Login flow
        const signInRes = await signIn("credentials", {
          usernameOrEmail: email,
          password,
          redirect: false,
        })

        if (signInRes?.error) {
          throw new Error(signInRes.error)
        }

        router.push("/simulator")
        onOpenChange(false)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/60 p-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

        <div className="relative p-6">
          <DialogHeader className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-6 h-6 text-foreground" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" ? "Sign in to continue to MP8085" : "Get started with MP8085 for free"}
            </p>
          </DialogHeader>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-muted/50 border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-muted/50 border-border/60"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">{mode === "login" ? "Email or Username" : "Email"}</Label>
              <Input
                id="email"
                type={mode === "login" ? "text" : "email"}
                placeholder={mode === "login" ? "m@example.com or username" : "m@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/50 border-border/60"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted/50 border-border/60"
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="relative flex items-center py-2 mb-6">
            <div className="grow border-t border-border/60"></div>
            <span className="shrink-0 px-2 text-xs text-muted-foreground font-medium">OR</span>
            <div className="grow border-t border-border/60"></div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-muted/50 border-border/60 hover:bg-muted hover:border-white/20 gap-3"
              onClick={() => handleOAuth("google")}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => {
                setError("")
                setMode(mode === "login" ? "signup" : "login")
              }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

