/**
 * Example: Using the axios service in a React component
 * 
 * This file demonstrates how to use the centralized axios service
 * with CSRF tokens and HTTP-only cookies in your components.
 */

'use client'

import { useState } from 'react'
import { 
  login, 
  logout, 
  getBookings, 
  createBooking,
  type LoginCredentials,
  type CreateBookingData 
} from '@/services'

export function ExampleUsageComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Example 1: Login (CSRF token is automatically set)
  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await login(credentials)
      
      // CSRF token is now automatically set and will be included in all future requests
      console.log('Login successful:', response.user)
      
      // Redirect based on user role
      if (response.user.role === 'admin') {
        window.location.href = '/admin'
      } else if (response.user.role === 'operator') {
        window.location.href = '/operator'
      } else {
        window.location.href = '/carrier'
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Example 2: Logout (CSRF token is automatically cleared)
  const handleLogout = async () => {
    try {
      await logout()
      // CSRF token is now cleared
      window.location.href = '/'
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Example 3: Fetch data (CSRF token is automatically included)
  const fetchBookings = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { bookings, total } = await getBookings({
        status: 'pending',
        page: 1,
        limit: 10
      })
      
      console.log('Fetched bookings:', bookings)
      console.log('Total:', total)
      
      // Do something with the data...
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings')
    } finally {
      setIsLoading(false)
    }
  }

  // Example 4: Create data (CSRF token is automatically included)
  const handleCreateBooking = async (data: CreateBookingData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const newBooking = await createBooking(data)
      console.log('Created booking:', newBooking)
      
      // Refresh the list or navigate...
    } catch (err: any) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  // Example 5: Using with React Query / SWR
  // If you're using React Query:
  /*
  import { useQuery, useMutation } from '@tanstack/react-query'
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', { status: 'pending' }],
    queryFn: () => getBookings({ status: 'pending' })
  })
  
  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })
  */

  return (
    <div>
      {/* Your component JSX */}
      {error && <div className="error">{error}</div>}
      {isLoading && <div>Loading...</div>}
    </div>
  )
}

// Example 6: Using in Server Components (Next.js App Router)
// Note: CSRF tokens work in client components. For server components, 
// use server actions or API routes on the server side.

// Example 7: Using with Form Actions
export function BookingFormExample() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    
    try {
      await createBooking({
        carrierName: formData.get('carrierName') as string,
        containerType: formData.get('containerType') as string,
        containerNumber: formData.get('containerNumber') as string,
        terminalId: formData.get('terminalId') as string,
        appointmentTime: formData.get('appointmentTime') as string,
        notes: formData.get('notes') as string,
      })
      
      alert('Booking created successfully!')
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Create Booking</button>
    </form>
  )
}

// Example 8: Error Handling Patterns
async function exampleErrorHandling() {
  try {
    const response = await getBookings()
    return response
  } catch (error: any) {
    // Handle specific error codes
    if (error.response?.status === 401) {
      // User is not authenticated - redirect to login
      window.location.href = '/'
    } else if (error.response?.status === 403) {
      // User doesn't have permission
      console.error('Access denied')
    } else if (error.response?.status === 404) {
      // Resource not found
      console.error('Resource not found')
    } else if (!error.response) {
      // Network error
      console.error('Network error - check your connection')
    } else {
      // Other errors
      console.error('An error occurred:', error.message)
    }
    
    throw error
  }
}
