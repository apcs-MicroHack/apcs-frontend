import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true, // Include HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// CSRF token storage
let csrfToken: string | null = null

/**
 * Set the CSRF token (call this after login)
 */
export const setCsrfToken = (token: string) => {
  csrfToken = token
}

/**
 * Get the current CSRF token
 */
export const getCsrfToken = () => csrfToken

/**
 * Clear the CSRF token (call this on logout)
 */
export const clearCsrfToken = () => {
  csrfToken = null
}

// Request interceptor - Add CSRF token to all requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add CSRF token to headers if available
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }

    // Add timestamp to prevent caching on GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle common errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // If response contains a new CSRF token, update it
    const newCsrfToken = response.headers['x-csrf-token']
    if (newCsrfToken) {
      setCsrfToken(newCsrfToken)
    }

    return response
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      clearCsrfToken()
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    // Handle 403 Forbidden - CSRF token might be invalid
    if (error.response?.status === 403) {
      const errorMessage = (error.response.data as any)?.message
      if (errorMessage?.toLowerCase().includes('csrf')) {
        clearCsrfToken()
        console.error('CSRF token validation failed. Please login again.')
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error: Unable to reach the server')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
