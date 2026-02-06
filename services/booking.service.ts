import axiosInstance from './axios'

export interface Booking {
  id: string
  bookingNumber: string
  carrierName: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  appointmentTime: string
  containerType: string
  containerNumber: string
  terminalId: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookingData {
  carrierName: string
  containerType: string
  containerNumber: string
  terminalId: string
  appointmentTime: string
  notes?: string
}

/**
 * Get all bookings with optional filters
 */
export const getBookings = async (params?: {
  status?: string
  terminalId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}): Promise<{ bookings: Booking[]; total: number }> => {
  const response = await axiosInstance.get('/bookings', { params })
  return response.data
}

/**
 * Get a single booking by ID
 */
export const getBookingById = async (id: string): Promise<Booking> => {
  const response = await axiosInstance.get(`/bookings/${id}`)
  return response.data
}

/**
 * Create a new booking
 */
export const createBooking = async (data: CreateBookingData): Promise<Booking> => {
  const response = await axiosInstance.post('/bookings', data)
  return response.data
}

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  id: string,
  status: 'approved' | 'rejected' | 'completed',
  notes?: string
): Promise<Booking> => {
  const response = await axiosInstance.patch(`/bookings/${id}/status`, {
    status,
    notes,
  })
  return response.data
}

/**
 * Delete a booking
 */
export const deleteBooking = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/bookings/${id}`)
}

/**
 * Get booking statistics
 */
export const getBookingStats = async (params?: {
  startDate?: string
  endDate?: string
  terminalId?: string
}): Promise<{
  total: number
  pending: number
  approved: number
  rejected: number
  completed: number
}> => {
  const response = await axiosInstance.get('/bookings/stats', { params })
  return response.data
}
