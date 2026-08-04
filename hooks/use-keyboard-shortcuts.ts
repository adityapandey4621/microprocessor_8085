import { useEffect } from 'react'

type KeyCombo = {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
}

type ShortcutConfig = {
  combo: KeyCombo
  onAction: (e: KeyboardEvent) => void
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      // UNLESS they are specifically pressing F-keys or Escape
      const target = event.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      
      const isSpecialKey = event.key.startsWith('F') || event.key === 'Escape'

      if (isInput && !isSpecialKey && !event.ctrlKey && !event.metaKey) {
        return
      }

      for (const shortcut of shortcuts) {
        const { combo, onAction, preventDefault = true } = shortcut

        const keyMatch = event.key.toLowerCase() === combo.key.toLowerCase()
        const ctrlMatch = !!combo.ctrlKey === !!(event.ctrlKey || event.metaKey)
        const shiftMatch = !!combo.shiftKey === !!event.shiftKey
        const altMatch = !!combo.altKey === !!event.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (preventDefault) {
            event.preventDefault()
          }
          onAction(event)
          return // Stop after first match
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, isActive])
}
