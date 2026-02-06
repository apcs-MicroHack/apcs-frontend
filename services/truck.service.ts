import api from "./axios"
import type { Truck, TruckType } from "./types"

// ── List trucks ──────────────────────────────────────────────

export interface TruckFilters {
  isActive?: boolean
  search?: string
  carrierId?: string
}

export async function getTrucks(filters?: TruckFilters): Promise<Truck[]> {
  const params: Record<string, string> = {}
  if (filters?.isActive !== undefined) params.isActive = String(filters.isActive)
  if (filters?.search) params.search = filters.search
  if (filters?.carrierId) params.carrierId = filters.carrierId

  const { data } = await api.get("/trucks", { params })
  return data.trucks
}

// ── Single truck ─────────────────────────────────────────────

export async function getTruckById(id: string): Promise<Truck> {
  const { data } = await api.get(`/trucks/${id}`)
  return data.truck
}

// ── Create truck (CARRIER) ───────────────────────────────────

export interface CreateTruckPayload {
  plateNumber: string
  truckType: TruckType
  driverName?: string
  driverPhone?: string
  driverLicense?: string
}

export async function createTruck(payload: CreateTruckPayload): Promise<Truck> {
  const { data } = await api.post("/trucks", payload)
  return data.truck
}

// ── Update truck ─────────────────────────────────────────────

export async function updateTruck(
  id: string,
  payload: Partial<CreateTruckPayload & { isActive: boolean }>,
): Promise<Truck> {
  const { data } = await api.put(`/trucks/${id}`, payload)
  return data.truck
}

// ── Delete truck (soft) ──────────────────────────────────────

export async function deleteTruck(id: string): Promise<void> {
  await api.delete(`/trucks/${id}`)
}
