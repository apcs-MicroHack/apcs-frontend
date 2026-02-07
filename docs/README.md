// ...existing code moved to md/README.md
# Services Layer

This directory contains all API service modules for the APCS application. All services use a centralized axios instance with CSRF token handling and HTTP-only cookie support.

## 📁 Structure

```
services/
├── axios.ts              # Centralized axios instance with interceptors
├── auth.service.ts       # Authentication services
├── booking.service.ts    # Booking management services
└── index.ts             # Central export file
```

## 🔧 Configuration

### Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Axios Instance Features

- ✅ **CSRF Token Management**: Automatically adds CSRF token to all requests
- ✅ **HTTP-Only Cookies**: Includes credentials for secure cookie handling
- ✅ **Automatic Token Refresh**: Updates CSRF token from response headers
- ✅ **Error Handling**: Handles 401/403 errors and redirects to login
- ✅ **Request Interceptors**: Adds CSRF token and cache-busting for GET requests
- ✅ **Response Interceptors**: Processes responses and handles common errors

## 📖 Usage

### Authentication Example

```typescript
import { login, logout, setCsrfToken } from '@/services'

// Login
try {
  const response = await login({
    email: 'user@example.com',
    password: 'password123'
  })
  
  // CSRF token is automatically set
  console.log('User:', response.user)
  console.log('Role:', response.user.role)
} catch (error) {
  console.error('Login failed:', error.message)
}

// Logout
await logout() // Automatically clears CSRF token
```

### Using API Services

```typescript
import { getBookings, createBooking, updateBookingStatus } from '@/services'

// Get bookings with filters
const { bookings, total } = await getBookings({
  status: 'pending',
  terminalId: 'terminal-1',
  page: 1,
  limit: 10
})

// Create a new booking
const newBooking = await createBooking({
  carrierName: 'ABC Logistics',
  containerType: '20ft',
  containerNumber: 'ABCU1234567',
  terminalId: 'terminal-1',
  appointmentTime: '2026-02-10T10:00:00Z',
  notes: 'Urgent delivery'
})

// Update booking status
await updateBookingStatus(bookingId, 'approved', 'Approved by operator')
```

### Direct Axios Usage

For custom endpoints not covered by services:

```typescript
import { axiosInstance } from '@/services'

// GET request
const response = await axiosInstance.get('/custom-endpoint')

// POST request
const response = await axiosInstance.post('/custom-endpoint', {
  data: 'value'
})

// PUT request
const response = await axiosInstance.put('/custom-endpoint/123', {
  data: 'updated value'
})

// DELETE request
await axiosInstance.delete('/custom-endpoint/123')
```

### CSRF Token Management

```typescript
import { setCsrfToken, getCsrfToken, clearCsrfToken } from '@/services'

// Manually set CSRF token (usually done automatically on login)
setCsrfToken('your-csrf-token-here')

// Get current CSRF token
const token = getCsrfToken()

// Clear CSRF token (usually done automatically on logout)
clearCsrfToken()
```

## 🎨 Creating New Services

When creating a new service file, follow this pattern:

```typescript
import axiosInstance from './axios'

export interface YourEntity {
  id: string
  name: string
  // ... other fields
}

export const getYourEntities = async (): Promise<YourEntity[]> => {
  const response = await axiosInstance.get('/your-endpoint')
  return response.data
}

export const createYourEntity = async (data: Partial<YourEntity>): Promise<YourEntity> => {
  const response = await axiosInstance.post('/your-endpoint', data)
  return response.data
}

// Add more methods as needed
```

Then export it in `index.ts`:

```typescript
export * from './your-new-service.service'
```

## 🔒 Security Features

### CSRF Protection
- CSRF token is automatically included in all requests via `X-CSRF-Token` header
- Token is refreshed from response headers when provided by backend
- Token is cleared on logout or 401/403 errors

### HTTP-Only Cookies
- `withCredentials: true` ensures cookies are sent with every request
- Works with secure session cookies set by the backend
- Prevents XSS attacks by keeping tokens in HTTP-only cookies

### Error Handling
- **401 Unauthorized**: Automatically redirects to login page and clears CSRF token
- **403 Forbidden**: Detects CSRF validation failures and prompts re-login
- **Network Errors**: Logged to console for debugging

## 🚀 Best Practices

1. **Always use services instead of direct axios calls** when possible
2. **Handle errors gracefully** with try-catch blocks
3. **Type your responses** using TypeScript interfaces
4. **Keep services focused** - one service per domain entity
5. **Export everything** through `index.ts` for clean imports
6. **Don't store CSRF tokens manually** - let the interceptors handle it

## 🛠️ Troubleshooting

### "Network error: Unable to reach the server"
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS configuration on backend

### "CSRF token validation failed"
- Ensure backend is sending CSRF token in login response
- Check if token is being cleared unexpectedly
- Verify backend CSRF middleware configuration

### 401 Errors
- Token might have expired
- Re-login required
- Check backend session configuration

## 📝 Example Backend Response Format

Your backend should return responses in this format:

```json
// Login Response
{
  "success": true,
  "csrfToken": "abc123...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "operator",
    "name": "John Doe"
  }
}

// Standard Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```
