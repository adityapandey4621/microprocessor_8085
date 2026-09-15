"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cpu, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SignUp() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Failed to register")
                setIsLoading(false)
                return
            }

            toast.success("Account created successfully! Signing in...")
            
            // Sign in automatically using username or email
            const signInResult = await signIn("credentials", {
                usernameOrEmail: formData.username || formData.email,
                password: formData.password,
                redirect: false,
            })

            if (signInResult?.error) {
                toast.error("Account created! Please sign in with your credentials.")
                router.push("/auth/signin")
            } else {
                toast.success("Welcome to 8085 Studio!")
                router.push("/simulator")
                router.refresh()
            }
        } catch (error: any) {
            toast.error(error?.message || "An error occurred during registration")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-background text-white flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-border/60 backdrop-blur-xl shadow-2xl relative z-10"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20"
                    >
                        <Cpu className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-400">
                        Join the next-gen 8085 simulator platform
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                            id="name" 
                            name="name" 
                            placeholder="John Doe" 
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-black/50 border-border/60 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                            id="username" 
                            name="username" 
                            placeholder="johndoe8085" 
                            value={formData.username}
                            onChange={handleChange}
                            className="bg-black/50 border-border/60 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            placeholder="john@example.com" 
                            value={formData.email}
                            onChange={handleChange}
                            className="bg-black/50 border-border/60 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
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
                            className="bg-black/50 border-border/60 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                            required
                            minLength={6}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium text-base transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/25"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Sign Up <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

