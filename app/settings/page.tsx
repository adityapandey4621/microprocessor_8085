"use client"

import SimulatorNav from "@/components/simulator-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSettings } from "@/hooks/use-settings"
import { Monitor, Cpu, Volume2, Save, FileCode, Zap, Eye, Keyboard, User as UserIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
    const { settings, updateSettings, mounted } = useSettings()
    const { data: session } = useSession()
    const [profile, setProfile] = useState({ username: "", bio: "", country: "" })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (session?.user) {
            fetch("/api/user/profile")
                .then(res => res.json())
                .then(data => {
                    if (data.profile) {
                        setProfile({
                            username: data.profile.username || "",
                            bio: data.profile.bio || "",
                            country: data.profile.country || ""
                        })
                    }
                })
        }
    }, [session])

    const handleSaveProfile = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            })
            if (!res.ok) throw new Error("Failed to save profile")
            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error("Could not update profile")
        } finally {
            setIsLoading(false)
        }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background text-white flex flex-col">
            <SimulatorNav />
            <main className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Settings</h1>
                        <p className="text-gray-400">Customize your MP8085 environment</p>
                    </div>
                </div>

                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="bg-white/5 border-border/60 p-1">
                        <TabsTrigger value="general" className="data-[state=active]:bg-blue-600">General</TabsTrigger>
                        <TabsTrigger value="editor" className="data-[state=active]:bg-blue-600">Editor</TabsTrigger>
                        <TabsTrigger value="simulation" className="data-[state=active]:bg-blue-600">Simulation</TabsTrigger>
                        <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">Profile</TabsTrigger>
                    </TabsList>

                    {/* GENERAL SETTINGS */}
                    <TabsContent value="general" className="space-y-6">
                        <Card className="bg-background border-border/60">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-5 h-5 text-blue-400" />
                                    <CardTitle className="text-white">Appearance & UI</CardTitle>
                                </div>
                                <CardDescription>Configure how the simulator looks</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-gray-200">Total Dark Mode</Label>
                                        <p className="text-sm text-gray-400">Use deep black OLED-friendly background</p>
                                    </div>
                                    {/* Using logic to toggle theme would be more complex with next-themes, simplified here for "dark" preference */}
                                    <Switch
                                        checked={settings.theme === "dark"}
                                        onCheckedChange={(c) => updateSettings({ theme: c ? "dark" : "light" })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-gray-200">High Contrast</Label>
                                        <p className="text-sm text-gray-400">Increase visibility of interface elements</p>
                                    </div>
                                    <Switch
                                        checked={settings.highContrast}
                                        onCheckedChange={(c) => updateSettings({ highContrast: c })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-gray-200">Sound Effects</Label>
                                        <p className="text-sm text-gray-400">Play sounds on execution and errors</p>
                                    </div>
                                    <Switch
                                        checked={settings.soundEnabled}
                                        onCheckedChange={(c) => updateSettings({ soundEnabled: c })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* EDITOR SETTINGS */}
                    <TabsContent value="editor" className="space-y-6">
                        <Card className="bg-background border-border/60">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileCode className="w-5 h-5 text-purple-400" />
                                    <CardTitle className="text-white">Code Editor</CardTitle>
                                </div>
                                <CardDescription>Font size and editing preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="text-gray-200">Font Size: {settings.editorFontSize}px</Label>
                                    </div>
                                    <Slider
                                        value={[settings.editorFontSize]}
                                        min={12}
                                        max={24}
                                        step={1}
                                        onValueChange={(val) => updateSettings({ editorFontSize: val[0] })}
                                        className="py-4"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-gray-200">Auto Save</Label>
                                        <p className="text-sm text-gray-400">Automatically save your work to the cloud</p>
                                    </div>
                                    <Switch
                                        checked={settings.autoSave}
                                        onCheckedChange={(c) => updateSettings({ autoSave: c })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SIMULATION SETTINGS */}
                    <TabsContent value="simulation" className="space-y-6">
                        <Card className="bg-background border-border/60">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-emerald-400" />
                                    <CardTitle className="text-white">Simulator Behavior</CardTitle>
                                </div>
                                <CardDescription>Configure the 8085 emulation engine</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-200">Execution Speed</Label>
                                    <Select
                                        value={settings.simulatorSpeed}
                                        onValueChange={(val: any) => updateSettings({ simulatorSpeed: val })}
                                    >
                                        <SelectTrigger className="bg-white/5 border-border/60">
                                            <SelectValue placeholder="Select speed" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a24] border-border/60 text-white">
                                            <SelectItem value="slow">Slow (Debug Mode)</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="fast">Instant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-200">Start Address (Hex)</Label>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-gray-500 font-mono">0x</span>
                                        <Input
                                            value={settings.defaultAddress}
                                            onChange={(e) => updateSettings({ defaultAddress: e.target.value })}
                                            className="bg-white/5 border-border/60 font-mono"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-gray-200">Number Format</Label>
                                        <p className="text-sm text-gray-400">Display registers in Hex or Decimal</p>
                                    </div>
                                    <div className="flex items-center bg-white/5 rounded-lg p-1 border border-border/60">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`${settings.numberFormat === 'hex' ? 'bg-blue-600 text-white' : 'text-gray-400'} h-7 px-3 rounded-md transition-all`}
                                            onClick={() => updateSettings({ numberFormat: 'hex' })}
                                        >
                                            HEX
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`${settings.numberFormat === 'decimal' ? 'bg-blue-600 text-white' : 'text-gray-400'} h-7 px-3 rounded-md transition-all`}
                                            onClick={() => updateSettings({ numberFormat: 'decimal' })}
                                        >
                                            DEC
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-gray-200">Live Memory Updates</Label>
                                        <p className="text-sm text-gray-400">Show memory changes in real-time (Can affect performance)</p>
                                    </div>
                                    <Switch
                                        checked={settings.showGridUpdates}
                                        onCheckedChange={(c) => updateSettings({ showGridUpdates: c })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PROFILE SETTINGS */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card className="bg-background border-border/60">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-pink-400" />
                                    <CardTitle className="text-white">Public Profile</CardTitle>
                                </div>
                                <CardDescription>Update your public details and leaderboard presence</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-200">Username</Label>
                                    <Input 
                                        value={profile.username}
                                        onChange={(e) => setProfile(p => ({ ...p, username: e.target.value }))}
                                        placeholder="e.g. asm_wizard"
                                        className="bg-white/5 border-border/60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-200">Bio</Label>
                                    <Input 
                                        value={profile.bio}
                                        onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                                        placeholder="Tell us about yourself..."
                                        className="bg-white/5 border-border/60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-200">Country</Label>
                                    <Input 
                                        value={profile.country}
                                        onChange={(e) => setProfile(p => ({ ...p, country: e.target.value }))}
                                        placeholder="e.g. India"
                                        className="bg-white/5 border-border/60"
                                    />
                                </div>
                                <Button 
                                    onClick={handleSaveProfile} 
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                                >
                                    {isLoading ? "Saving..." : "Save Profile"}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

