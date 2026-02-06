import api from "./axios"
import type { Terminal, CapacityForDate, CapacityOverride, CreateCapacityOverridePayload } from "./types"

// ── Types ────────────────────────────────────────────────────

export interface CapacityConfigPayload {
  dayOfWeek: string
  slotDurationMin: number
  operatingStart: string
  operatingEnd: string
  maxTrucksPerSlot: number
}

export interface CapacityConfig extends CapacityConfigPayload {
  id: string
  terminalId: string
  isActive: boolean
}

// ── List terminals ───────────────────────────────────────────

export async function getTerminals(): Promise<Terminal[]> {
  const { data } = await api.get("/terminals")
  return data.terminals ?? data
}

// ── Single terminal ──────────────────────────────────────────

export async function getTerminalById(id: string): Promise<Terminal> {
  const { data } = await api.get(`/terminals/${id}`)
  return data.terminal ?? data
}

// ── CRUD (ADMIN) ─────────────────────────────────────────────

export async function createTerminal(
  payload: Pick<Terminal, "name" | "code" | "type"> & {
    description?: string
    capacityConfigs: CapacityConfigPayload[]
  },
): Promise<Terminal> {
  const { data } = await api.post("/terminals", payload)
  return data.terminal
}

export async function updateTerminal(
  id: string,
  payload: Partial<Pick<Terminal, "name" | "code" | "type" | "description" | "isActive">>,
): Promise<Terminal> {
  const { data } = await api.put(`/terminals/${id}`, payload)
  return data.terminal
}

export async function deleteTerminal(id: string): Promise<void> {
  await api.delete(`/terminals/${id}`)
}

// ── Capacity Config ──────────────────────────────────────────

export async function getCapacityConfig(terminalId: string): Promise<CapacityConfig[]> {
  const { data } = await api.get(`/terminals/${terminalId}/capacity`)
  return data.configs ?? data
}

export async function upsertCapacityConfig(
  terminalId: string,
  configs: CapacityConfigPayload[],
): Promise<CapacityConfig[]> {
  // Backend takes one day at a time, so loop
  const results: CapacityConfig[] = []
  for (const cfg of configs) {
    const { data } = await api.post(`/terminals/${terminalId}/capacity`, cfg)
    results.push(data.config ?? data)
  }
  return results
}

// ── Capacity for Date ────────────────────────────────────────

export async function getCapacityForDate(
  terminalId: string,
  date: string,
  timeSlot?: string,
): Promise<CapacityForDate> {
  const { data } = await api.get(`/terminals/${terminalId}/capacity-for-date`, {
    params: { date, timeSlot },
  })
  return data
}

// ── Capacity Overrides ───────────────────────────────────────

export async function getCapacityOverrides(
  terminalId: string,
  active?: boolean,
): Promise<CapacityOverride[]> {
  const { data } = await api.get(`/terminals/${terminalId}/overrides`, {
    params: active !== undefined ? { active: String(active) } : undefined,
  })
  return data.overrides ?? data
}

export async function createCapacityOverride(
  terminalId: string,
  payload: CreateCapacityOverridePayload,
): Promise<CapacityOverride> {
  const { data } = await api.post(`/terminals/${terminalId}/overrides`, payload)
  return data.override ?? data
}

export async function updateCapacityOverride(
  terminalId: string,
  overrideId: string,
  payload: Partial<CreateCapacityOverridePayload> & { isActive?: boolean },
): Promise<CapacityOverride> {
  const { data } = await api.put(`/terminals/${terminalId}/overrides/${overrideId}`, payload)
  return data.override ?? data
}

export async function deleteCapacityOverride(
  terminalId: string,
  overrideId: string,
): Promise<void> {
  await api.delete(`/terminals/${terminalId}/overrides/${overrideId}`)
}

// ── Operator Assignment ──────────────────────────────────────

export async function assignOperator(
  terminalId: string,
  operatorId: string,
): Promise<void> {
  await api.post(`/terminals/${terminalId}/operators`, { operatorId })
}

export async function removeOperator(
  terminalId: string,
  operatorId: string,
): Promise<void> {
  await api.delete(`/terminals/${terminalId}/operators/${operatorId}`)
}

// ── Closed Dates ─────────────────────────────────────────────

export async function getClosedDates(
  terminalId: string,
  upcoming?: boolean,
): Promise<any[]> {
  const { data } = await api.get(`/terminals/${terminalId}/closed-dates`, {
    params: upcoming ? { upcoming: "true" } : undefined,
  })
  return data.closedDates ?? data
}

export async function addClosedDate(
  terminalId: string,
  payload: { date: string; reason?: string },
): Promise<any> {
  const { data } = await api.post(`/terminals/${terminalId}/closed-dates`, payload)
  return data.closedDate ?? data
}

export async function removeClosedDate(
  terminalId: string,
  closedDateId: string,
): Promise<void> {
  await api.delete(`/terminals/${terminalId}/closed-dates/${closedDateId}`)
}
