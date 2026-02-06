"use client"

import { toast } from "sonner"

interface UndoToastOptions {
  message: string
  description?: string
  duration?: number
  onUndo: () => void | Promise<void>
}

export function showUndoToast({
  message,
  description,
  duration = 5000,
  onUndo,
}: UndoToastOptions) {
  const toastId = toast(message, {
    description,
    duration,
    action: {
      label: "Undo",
      onClick: async () => {
        toast.dismiss(toastId)
        try {
          await onUndo()
          toast.success("Action undone")
        } catch (error) {
          toast.error("Failed to undo action")
        }
      },
    },
  })

  return toastId
}

// Helper for common operations
export const undoableActions = {
  delete: (itemName: string, onUndo: () => void | Promise<void>) => {
    showUndoToast({
      message: `${itemName} deleted`,
      description: "Click undo to restore",
      onUndo,
    })
  },

  archive: (itemName: string, onUndo: () => void | Promise<void>) => {
    showUndoToast({
      message: `${itemName} archived`,
      description: "Click undo to restore",
      onUndo,
    })
  },

  statusChange: (
    itemName: string,
    newStatus: string,
    onUndo: () => void | Promise<void>
  ) => {
    showUndoToast({
      message: `${itemName} marked as ${newStatus}`,
      onUndo,
    })
  },
}
