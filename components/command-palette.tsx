"use client"

import * as React from "react"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  ArrowRight,
  Terminal,
  Search,
  Activity,
  History,
  HardDrive
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

export function CommandPalette({
  open,
  setOpen,
  onJumpToPC,
  onJumpToMemory,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onJumpToPC?: () => void
  onJumpToMemory?: () => void
}) {
  
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => {
            onJumpToPC?.()
            setOpen(false)
          }}>
            <Terminal className="mr-2 h-4 w-4" />
            <span>Jump to Program Counter</span>
            <CommandShortcut>Ctrl+J</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => {
            onJumpToMemory?.()
            setOpen(false)
          }}>
            <HardDrive className="mr-2 h-4 w-4" />
            <span>Go to Memory Address...</span>
            <CommandShortcut>Ctrl+G</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Simulator">
          <CommandItem>
            <Activity className="mr-2 h-4 w-4" />
            <span>Run / Continue</span>
            <CommandShortcut>F5</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <ArrowRight className="mr-2 h-4 w-4" />
            <span>Step Over</span>
            <CommandShortcut>F10</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <ArrowRight className="mr-2 h-4 w-4" />
            <span>Step Into</span>
            <CommandShortcut>F11</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
