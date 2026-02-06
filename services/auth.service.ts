import axiosInstance, { setCsrfToken, clearCsrfToken } from './axios'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  csrfToken: string
  user: {
    id: string
    email: string
    role: 'admin' | 'operator' | 'carrier'
    name: string
  }
  message?: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'operator' | 'carrier'
  name: string
}

/**
 * Login user and set CSRF token
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials)
    
    // Set CSRF token for future requests
    if (response.data.csrfToken) {
      setCsrfToken(response.data.csrfToken)
    }
    
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed')
  }
}

/**
 * Logout user and clear CSRF token
 */
export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post('/auth/logout')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Always clear CSRF token on logout
    clearCsrfToken()
  }
}

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get<User>('/auth/me')
  return response.data
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  await axiosInstance.post('/auth/forgot-password', { email })
}

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await axiosInstance.post('/auth/reset-password', { token, newPassword })
}
