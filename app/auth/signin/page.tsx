"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cpu, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SignIn() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await signIn("credentials", {
                usernameOrEmail: formData.usernameOrEmail,
                password: formData.password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("Invalid username/email or password")
                setIsLoading(false)
            } else {
                toast.success("Signed in successfully")
                router.push("/simulator")
                router.refresh()
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-background text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-border/60 backdrop-blur-xl shadow-2xl relative z-10"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                        className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20"
                    >
                        <Cpu className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">
                        Sign in to access your projects and start simulating
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="usernameOrEmail">Username or Email</Label>
                        <Input 
                            id="usernameOrEmail" 
                            name="usernameOrEmail" 
                            placeholder="johndoe or john@example.com" 
                            value={formData.usernameOrEmail}
                            onChange={handleChange}
                            className="bg-black/50 border-border/60 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            name="password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={formData.password}
                            onChange={handleChange}
                            className="bg-black/50 border-border/60 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 transition-all"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-base transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/25 relative overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="text"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center"
                                >
                                    Sign In <ArrowRight className="w-5 h-5 ml-2" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/60"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-background text-gray-500 rounded-full font-medium tracking-wider text-xs uppercase">Or</span>
                    </div>
                </div>

                <Button
                    type="button"
                    className="w-full h-12 bg-white text-black hover:bg-gray-100 font-medium text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl"
                    onClick={() => signIn("google", { callbackUrl: "/simulator" })}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </Button>

                <div className="mt-8 text-center text-sm text-gray-400 space-y-2">
                    <p>
                        Don't have an account?{" "}
                        <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Sign Up
                        </Link>
                    </p>
                    <p className="text-xs text-gray-500 pt-2">
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-gray-400">Terms</Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="underline hover:text-gray-400">Privacy Policy</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

