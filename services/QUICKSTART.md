// ...existing code moved to md/QUICKSTART.md
# Global Axios Service - Quick Start Guide

## ✅ What's Been Created

I've set up a complete global axios service with CSRF token management and HTTP-only cookie support:

### Files Created:

```
services/
├── axios.ts                 # Main axios instance with interceptors
├── auth.service.ts          # Authentication services  
├── booking.service.ts       # Example booking services
├── index.ts                 # Central exports
├── README.md               # Full documentation
└── example-usage.tsx        # Usage examples

.env.example                 # Environment variables template
.env.local                   # Local configuration
```

## 🚀 Quick Start

### 1. Install Dependencies (Already Done!)
```bash
npm install axios --legacy-peer-deps
```

### 2. Configure Environment
Your `.env.local` is already set with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Use in Your Components

#### Login Example:
```typescript
import { login } from '@/services'

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await login({ email, password })
    // CSRF token is automatically set!
    console.log('User:', response.user)
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

#### API Call Example:
```typescript
import { getBookings, createBooking } from '@/services'

// Fetch data - CSRF token automatically included
const { bookings } = await getBookings({ status: 'pending' })

// Create data - CSRF token automatically included  
const newBooking = await createBooking({ ... })
```

#### Manual Axios Call:
```typescript
import { axiosInstance } from '@/services'

const response = await axiosInstance.get('/custom-endpoint')
```

## 🔐 How It Works

### Automatic CSRF Token Flow:

1. **Login** → Backend returns CSRF token
2. **Token Storage** → Automatically stored in memory
3. **All Requests** → Token added to `X-CSRF-Token` header
4. **Token Refresh** → Updated if backend sends new token
5. **Logout** → Token automatically cleared

### HTTP-Only Cookies:

- All requests include `withCredentials: true`
- Session cookies are automatically sent with every request
- Works seamlessly with backend authentication

### Error Handling:

- **401 Unauthorized** → Auto redirect to login + clear token
- **403 Forbidden** → Detect CSRF failures + prompt re-login
- **Network Errors** → Logged for debugging

## 📝 Creating New Services

```typescript
// services/your-feature.service.ts
import axiosInstance from './axios'

export interface YourEntity {
  id: string
  // ...fields
}

export const getYourEntities = async () => {
  const response = await axiosInstance.get('/your-endpoint')
  return response.data
}

export const createYourEntity = async (data: any) => {
  const response = await axiosInstance.post('/your-endpoint', data)
  return response.data
}
```

Then add to `services/index.ts`:
```typescript
export * from './your-feature.service'
```

## 🎯 Key Features

✅ **Centralized Configuration** - One place to configure all API calls
✅ **CSRF Protection** - Automatic token management
✅ **Cookie Support** - Works with HTTP-only cookies
✅ **Type Safety** - Full TypeScript support
✅ **Error Handling** - Automatic 401/403 handling
✅ **Easy to Use** - Simple import and call pattern
✅ **Extensible** - Easy to add new services

## 📚 Important Files to Check

1. **services/axios.ts** - Main configuration and interceptors
2. **services/README.md** - Complete documentation
3. **services/example-usage.tsx** - Usage patterns and examples
4. **services/auth.service.ts** - Authentication methods
5. **services/booking.service.ts** - Example service implementation

## 🔧 Backend Requirements

Your backend should:

1. **Return CSRF token on login:**
```json
{
  "success": true,
  "csrfToken": "your-token-here",
  "user": { "id": "123", "email": "user@example.com", "role": "operator" }
}
```

2. **Validate CSRF token from header:**
- Look for `X-CSRF-Token` header in requests
- Validate against session

3. **Support credentials:**
- Set CORS to allow credentials
- Set `Access-Control-Allow-Credentials: true`

4. **Optional: Send updated token in responses:**
- Include `X-CSRF-Token` header to refresh token

## 🎨 Integration with Your App

### Update Login Form:
```typescript
// components/login-form.tsx
import { login } from '@/services'

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    const response = await login({ email, password })
    
    // Route based on role
    if (response.user.role === 'admin') {
      window.location.href = '/admin'
    } else if (response.user.role === 'operator') {
      window.location.href = '/operator'
    } else {
      window.location.href = '/carrier'
    }
  } catch (error: any) {
    setError(error.message)
  }
}
```

### Add Logout to Headers:
```typescript
// components/admin/admin-header.tsx
import { logout } from '@/services'

const handleLogout = async () => {
  await logout()
  window.location.href = '/'
}
```

## 🧪 Testing

```typescript
// Test login
import { login } from '@/services'

const testLogin = async () => {
  const result = await login({
    email: 'admin@apcs.dz',
    password: 'password123'
  })
  console.log('Login result:', result)
}
```

## ❓ Troubleshooting

### CORS Errors?
- Ensure backend allows credentials
- Check `Access-Control-Allow-Origin` includes your frontend URL
- Verify `Access-Control-Allow-Credentials: true`

### Token Not Sent?
- Check if `setCsrfToken()` was called after login
- Verify token is in response: `response.data.csrfToken`

### 401 Redirects?
- Normal behavior - user needs to login
- Ensure backend session is working

## 🎉 You're All Set!

Your global axios service is ready to use. Start by:

1. ✅ Installing axios (Done!)
2. ✅ Configuring environment (Done!)
3. 📝 Update login form to use `login()` from services
4. 📝 Replace direct fetch/axios calls with service methods
5. 📝 Add logout functionality using `logout()` service

Check `services/README.md` and `services/example-usage.tsx` for more details!
