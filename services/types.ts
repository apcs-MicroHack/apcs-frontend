/**
 * Common types used across API services
 */

// Standard API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// Pagination parameters
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Date range filter
export interface DateRangeFilter {
  startDate?: string
  endDate?: string
}

// User roles
export type UserRole = 'admin' | 'operator' | 'carrier'

// Common status types
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

// Error response
export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  errors?: Record<string, string[]>
}

// Filter parameters
export interface FilterParams {
  search?: string
  status?: string
  [key: string]: any
}

// Sort parameters
export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}
