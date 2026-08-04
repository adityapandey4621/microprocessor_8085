"use client"

import { ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface InspectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}

export function InspectorDialog({ open, onOpenChange, title, description, children }: InspectorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0a0a0f] text-white border-white/10 [&>button]:text-gray-400 hover:[&>button]:text-white">
        <DialogHeader>
          <DialogTitle className="text-gray-200">{title}</DialogTitle>
          {description && <DialogDescription className="text-gray-400">{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
