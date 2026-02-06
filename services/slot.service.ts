import api from "./axios"
import type { TimeSlot, AvailabilityResponse } from "./types"

// ── Available slots (structured availability) ────────────────

export async function getAvailableSlots(
  terminalId: string,
  startDate: string,
  endDate?: string,
): Promise<AvailabilityResponse> {
  const { data } = await api.get("/slots/available", {
    params: { terminalId, startDate, endDate: endDate || startDate },
  })
  return data
}

// ── Resolve a slot by terminal + date + startTime ────────────
// Calls POST /api/slots/resolve which finds or creates the DB row

export async function resolveSlot(
  terminalId: string,
  date: string,
  startTime: string,
): Promise<TimeSlot> {
  const { data } = await api.post("/slots/resolve", {
    terminalId,
    date,
    startTime,
  })
  return data.slot ?? data
}

// ── Slot details ─────────────────────────────────────────────

export async function getSlotById(id: string): Promise<TimeSlot> {
  const { data } = await api.get(`/slots/${id}`)
  return data.slot
}
