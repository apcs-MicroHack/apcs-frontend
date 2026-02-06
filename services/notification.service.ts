import api from "./axios"
import type { Notification, OffsetPagination } from "./types"

// ── List notifications ───────────────────────────────────────

export async function getNotifications(params?: {
  isRead?: boolean
  limit?: number
  offset?: number
}): Promise<{ notifications: Notification[]; pagination: OffsetPagination }> {
  const query: Record<string, string> = {}
  if (params?.isRead !== undefined) query.isRead = String(params.isRead)
  if (params?.limit) query.limit = String(params.limit)
  if (params?.offset) query.offset = String(params.offset)

  const { data } = await api.get("/notifications", { params: query })
  return data
}

// ── Unread count ─────────────────────────────────────────────

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get("/notifications/unread-count")
  return data.count
}

// ── Mark as read ─────────────────────────────────────────────

export async function markAsRead(id: string): Promise<void> {
  await api.put(`/notifications/${id}/read`)
}

export async function markAllAsRead(): Promise<number> {
  const { data } = await api.put("/notifications/read-all")
  return data.count
}

// ── Delete ───────────────────────────────────────────────────

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`)
}

export async function clearReadNotifications(): Promise<void> {
  await api.delete("/notifications")
}
