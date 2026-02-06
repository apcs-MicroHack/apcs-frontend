import api from "./axios"
import type { Booking, BookingDetail, BookingStatus, CargoType } from "./types"

// ── List bookings ────────────────────────────────────────────

export interface BookingFilters {
  status?: BookingStatus
  statuses?: BookingStatus[]  // Multiple statuses filter
  terminalId?: string
  carrierId?: string
  startDate?: string   // ISO date
  endDate?: string     // ISO date
}

export async function getBookings(
  filters?: BookingFilters,
): Promise<Booking[]> {
  const params: Record<string, string> = {}
  
  if (filters?.status) params.status = filters.status
  if (filters?.statuses?.length) params.statuses = filters.statuses.join(",")
  if (filters?.terminalId) params.terminalId = filters.terminalId
  if (filters?.carrierId) params.carrierId = filters.carrierId
  if (filters?.startDate) params.startDate = filters.startDate
  if (filters?.endDate) params.endDate = filters.endDate
  
  const { data } = await api.get("/bookings", { params })
  return data.bookings
}

// ── Single booking ───────────────────────────────────────────

export async function getBookingById(id: string): Promise<BookingDetail> {
  const { data } = await api.get(`/bookings/${id}`)
  return data.booking
}

// ── Create booking (CARRIER only) ────────────────────────────

export interface CreateBookingPayload {
  terminalId: string
  date: string
  startTime: string
  truckId: string
  cargoType: CargoType
  containerNumber?: string
  isHazardous?: boolean
  specialRequirements?: string
}

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  const { data } = await api.post("/bookings", payload)
  return data.booking
}

// ── Status actions ───────────────────────────────────────────

export async function confirmBooking(
  id: string,
  notes?: string,
): Promise<Booking> {
  const { data } = await api.put(`/bookings/${id}/confirm`, { notes })
  return data.booking
}

export async function rejectBooking(
  id: string,
  reason: string,
): Promise<Booking> {
  const { data } = await api.put(`/bookings/${id}/reject`, { rejectionReason: reason })
  return data.booking
}

export async function cancelBooking(
  id: string,
  reason?: string,
): Promise<Booking> {
  const { data } = await api.put(`/bookings/${id}/cancel`, { cancellationReason: reason })
  return data.booking
}

export async function consumeBooking(id: string): Promise<Booking> {
  const { data } = await api.put(`/bookings/${id}/consume`)
  return data.booking
}
