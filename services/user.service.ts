import api from "./axios"
import type { User, Role } from "./types"

// ── Current user ─────────────────────────────────────────────

export async function getMe(): Promise<User> {
  const { data } = await api.get("/users/me")
  return data.user ?? data
}

export async function updateMe(
  payload: Partial<Pick<User, "firstName" | "lastName" | "phone">>,
): Promise<User> {
  const { data } = await api.put("/users/me", payload)
  return data.user ?? data
}

// ── User management (ADMIN) ─────────────────────────────────

export interface UserFilters {
  role?: Role
  isActive?: boolean
  search?: string
}

export async function getUsers(filters?: UserFilters): Promise<User[]> {
  const { data } = await api.get("/users", { params: filters })
  return data.users ?? data
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await api.get(`/users/${id}`)
  return data.user ?? data
}

export interface CreateUserPayload {
  email: string
  firstName: string
  lastName: string
  role: Role
  phone?: string
  carrierId?: string
  terminalId?: string
  carrierDetails?: {
    companyName: string
    registrationNumber: string
    address?: string
    contactEmail?: string
    contactPhone?: string
  }
}

export interface CreateUserResponse {
  user: User
  tempPassword: string
}

export async function createUser(payload: CreateUserPayload): Promise<CreateUserResponse> {
  const { data } = await api.post("/users", payload)
  return { user: data.user, tempPassword: data.tempPassword }
}

export async function updateUser(
  id: string,
  payload: Partial<CreateUserPayload & { isActive: boolean }>,
): Promise<User> {
  const { data } = await api.put(`/users/${id}`, payload)
  return data.user
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`)
}

// ── Admin actions ────────────────────────────────────────────

export interface ResetPasswordResponse {
  tempPassword: string
}

export async function resetUserPassword(id: string): Promise<ResetPasswordResponse> {
  const { data } = await api.post(`/users/${id}/reset-password`)
  return { tempPassword: data.tempPassword }
}

export async function approveCarrier(id: string): Promise<void> {
  await api.put(`/users/${id}/approve-carrier`)
}
