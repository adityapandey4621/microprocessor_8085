import { toast } from "sonner"

export const ClipboardService = {
  copyText: async (text: string, successMessage: string = "Copied to clipboard") => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(successMessage)
      return true
    } catch (err) {
      toast.error("Failed to copy to clipboard")
      return false
    }
  },

  copyHex: async (value: number | string, padLength: number = 2, prefix: string = "") => {
    const num = typeof value === "string" ? parseInt(value, 16) : value
    if (isNaN(num)) return
    
    const hex = num.toString(16).toUpperCase().padStart(padLength, '0')
    const text = `${prefix}${hex}H`
    await ClipboardService.copyText(text, `Copied ${text}`)
  },

  copyDecimal: async (value: number | string, prefix: string = "") => {
    const num = typeof value === "string" ? parseInt(value, 16) : value
    if (isNaN(num)) return
    
    const text = `${prefix}${num}`
    await ClipboardService.copyText(text, `Copied ${text}`)
  },

  copyBinary: async (value: number | string, padLength: number = 8, prefix: string = "") => {
    const num = typeof value === "string" ? parseInt(value, 16) : value
    if (isNaN(num)) return
    
    const bin = num.toString(2).padStart(padLength, '0')
    const text = `${prefix}${bin}B`
    await ClipboardService.copyText(text, `Copied ${text}`)
  }
}
