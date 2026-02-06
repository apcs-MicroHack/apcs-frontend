import api from "./axios"
import type { Carrier } from "./types"

// ── List carriers ────────────────────────────────────────────

export async function getCarriers(params?: {
  includeUnapproved?: boolean
  withoutUser?: boolean
}): Promise<Carrier[]> {
  const { data } = await api.get("/carriers", {
    params: {
      ...(params?.includeUnapproved && { includeUnapproved: "true" }),
      ...(params?.withoutUser && { withoutUser: "true" }),
    },
  })
  return data.carriers ?? data
}

// ── Single carrier ───────────────────────────────────────────

export async function getCarrierById(id: string): Promise<Carrier> {
  const { data } = await api.get(`/carriers/${id}`)
  return data.carrier ?? data
}

// ── Create carrier (standalone, no user account) ─────────────

export async function createCarrier(payload: {
  companyName: string
  registrationNumber: string
  address?: string
  contactEmail?: string
  contactPhone?: string
}): Promise<Carrier> {
  const { data } = await api.post("/carriers", payload)
  return data.carrier ?? data
}

// ── Update carrier ───────────────────────────────────────────

export async function updateCarrier(
  id: string,
  payload: Partial<{
    companyName: string
    registrationNumber: string
    address: string
    contactEmail: string
    contactPhone: string
  }>,
): Promise<Carrier> {
  const { data } = await api.put(`/carriers/${id}`, payload)
  return data.carrier ?? data
}

// ── Delete carrier ───────────────────────────────────────────

export async function deleteCarrier(id: string): Promise<void> {
  await api.delete(`/carriers/${id}`)
}

// ── Assign user to carrier ───────────────────────────────────

export async function assignUser(
  carrierId: string,
  payload:
    | { existingUserId: string }
    | { createUser: { email: string; firstName: string; lastName: string; phone?: string; password?: string } },
): Promise<Carrier> {
  const { data } = await api.post(`/carriers/${carrierId}/assign-user`, payload)
  return data.carrier ?? data
}

// ── Unassign user from carrier ───────────────────────────────

export async function unassignUser(carrierId: string): Promise<void> {
  await api.delete(`/carriers/${carrierId}/user`)
}
