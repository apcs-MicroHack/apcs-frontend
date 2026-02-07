import api from "./axios"
import type { Booking, BookingDetail, BookingStatus, CargoType } from "./types"

// ── Pagination types ─────────────────────────────────────────

export interface BookingPagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedBookingsResponse {
  bookings: Booking[]
  pagination: BookingPagination
}

export interface BookingSummaryItem {
  status: BookingStatus
  terminalId: string
  terminal: { name: string; code: string }
  count: number
}

export interface BookingSummaryResponse {
  summary: BookingSummaryItem[]
}

// ── List bookings (paginated) ────────────────────────────────

export interface BookingFilters {
  status?: BookingStatus
  statuses?: BookingStatus[]  // Multiple statuses filter
  terminalId?: string
  carrierId?: string
  startDate?: string   // ISO date
  endDate?: string     // ISO date
  search?: string
  page?: number
  limit?: number
}

export async function getBookings(
  filters?: BookingFilters,
): Promise<PaginatedBookingsResponse> {
  const params: Record<string, string> = {}
  
  if (filters?.status) params.status = filters.status
  if (filters?.statuses?.length) params.statuses = filters.statuses.join(",")
  if (filters?.terminalId) params.terminalId = filters.terminalId
  if (filters?.carrierId) params.carrierId = filters.carrierId
  if (filters?.startDate) params.startDate = filters.startDate
  if (filters?.endDate) params.endDate = filters.endDate
  if (filters?.search) params.search = filters.search
  if (filters?.page) params.page = String(filters.page)
  if (filters?.limit) params.limit = String(filters.limit)
  
  const { data } = await api.get("/bookings", { params })

  // Handle both paginated and non-paginated backend responses gracefully
  const bookings: Booking[] = data.bookings ?? (Array.isArray(data) ? data : [])
  return {
    bookings,
    pagination: data.pagination ?? {
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 10,
      totalCount: bookings.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  }
}

// ── Booking summary ──────────────────────────────────────────

export interface BookingSummaryFilters {
  startDate?: string
  endDate?: string
  terminalId?: string
}

export async function getBookingSummary(
  filters?: BookingSummaryFilters,
): Promise<BookingSummaryResponse> {
  const params: Record<string, string> = {}
  if (filters?.startDate) params.startDate = filters.startDate
  if (filters?.endDate) params.endDate = filters.endDate
  if (filters?.terminalId) params.terminalId = filters.terminalId
  const { data } = await api.get("/bookings/summary", { params })
  return data
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
