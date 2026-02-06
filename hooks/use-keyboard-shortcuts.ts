"use client"

import * as React from "react"

type KeyCombo = {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
}

type ShortcutHandler = () => void

interface UseKeyboardShortcutsOptions {
  shortcuts: Record<string, ShortcutHandler>
  enabled?: boolean
}

function parseShortcut(shortcut: string): KeyCombo {
  const parts = shortcut.toLowerCase().split("+")
  const key = parts[parts.length - 1]

  return {
    key,
    ctrlKey: parts.includes("ctrl"),
    metaKey: parts.includes("meta") || parts.includes("cmd"),
    shiftKey: parts.includes("shift"),
    altKey: parts.includes("alt"),
  }
}

function matchesShortcut(event: KeyboardEvent, combo: KeyCombo): boolean {
  const keyMatches = event.key.toLowerCase() === combo.key.toLowerCase()
  const ctrlMatches = combo.ctrlKey ? event.ctrlKey || event.metaKey : true
  const shiftMatches = combo.shiftKey ? event.shiftKey : !event.shiftKey || !combo.shiftKey
  const altMatches = combo.altKey ? event.altKey : !event.altKey || !combo.altKey

  return keyMatches && ctrlMatches && shiftMatches && altMatches
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  React.useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Still allow Escape
        if (event.key !== "Escape") return
      }

      for (const [shortcut, handler] of Object.entries(shortcuts)) {
        const combo = parseShortcut(shortcut)
        if (matchesShortcut(event, combo)) {
          event.preventDefault()
          handler()
          return
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, enabled])
}

// Common shortcuts helper
export const commonShortcuts = {
  newBooking: "n",
  search: "ctrl+k",
  refresh: "r",
  escape: "escape",
  save: "ctrl+s",
  delete: "delete",
}
