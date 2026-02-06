# Quick Start: Refactor Your First Component

This is a step-by-step guide to refactor `components/admin/recent-bookings.tsx` - the **easiest** component to update, a perfect starting point.

---

## Current State (Mock Data)

[components/admin/recent-bookings.tsx](components/admin/recent-bookings.tsx) currently has:

```typescript
const bookings = [
  {
    id: "1",
    bookingNumber: "BK-2026-0892",
    carrierName: "MedTransport SA",
    terminal: "Terminal A",
    trucks: "MZ-25-8547",
    status: "approved",
    date: "2026-01-15",
  },
  // ... 5 more hardcoded bookings
]
```

## Step-by-Step Refactor

### Step 1: Add Imports
Open [components/admin/recent-bookings.tsx](components/admin/recent-bookings.tsx) and add these imports at the top:

```typescript
'use client'  // Already there

import { useState, useEffect } from 'react'  // Add this line
import { axiosInstance } from '@/services'   // Add this line
```

### Step 2: Remove Hardcoded Booking Array
Delete the `const bookings = [ ... ]` array completely (lines 18-63 approximately).

### Step 3: Add State Variables
Inside the component function, replace the deleted array with state:

```typescript
export function RecentBookings() {
  const [bookings, setBookings] = useState<typeof mockBookings>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ... rest of component
}
```

### Step 4: Add useEffect Hook
Add this `useEffect` right after the state declarations:

```typescript
useEffect(() => {
  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/bookings?limit=6&sort=createdAt&order=desc')
      setBookings(response.data.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  fetchBookings()
}, [])
```

### Step 5: Add Loading State
In the return statement, add the loading check right after the Card opening tag:

```typescript
export function RecentBookings() {
  // ... state and useEffect from above

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive/50 rounded text-sm text-destructive">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No bookings found
          </div>
        ) : (
          <Table>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.bookingNumber}</TableCell>
                  <TableCell>{booking.carrierName}</TableCell>
                  <TableCell>{booking.terminal}</TableCell>
                  <TableCell>{booking.trucks}</TableCell>
                  <TableCell>
                    <Badge variant={booking.status === 'approved' ? 'default' : 'outline'}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{booking.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Complete Refactored Component

Here's what the complete refactored component looks like:

```typescript
'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { axiosInstance } from '@/services'

interface Booking {
  id: string
  bookingNumber: string
  carrierName: string
  terminal: string
  trucks: string
  status: 'approved' | 'pending' | 'rejected'
  date: string
}

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get('/bookings', {
          params: {
            limit: 6,
            sort: 'createdAt',
            order: 'desc'
          }
        })
        setBookings(response.data.data)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch bookings'
        setError(message)
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive/50 rounded text-sm text-destructive">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No bookings found
          </div>
        ) : (
          <Table>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.bookingNumber}</TableCell>
                  <TableCell>{booking.carrierName}</TableCell>
                  <TableCell>{booking.terminal}</TableCell>
                  <TableCell>{booking.trucks}</TableCell>
                  <TableCell>
                    <Badge
                      variant={booking.status === 'approved' ? 'default' : 'outline'}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(booking.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## How to Test This Works

### Test 1: Verify Component Loads
1. Go to Admin Dashboard
2. Scroll to Recent Bookings section  
3. You should see **loading skeleton** (gray bars animating)

### Test 2: Verify API Call
1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Reload admin page
4. Look for request to `/bookings` 
5. Should see response with booking data

**Expected Network Request:**
```
GET http://localhost:8000/api/bookings?limit=6&sort=createdAt&order=desc
Headers:
  x-csrf-token: [token value]
  cookie: [session cookie]

Response:
{
  "status": "success",
  "data": [
    {
      "id": "123",
      "bookingNumber": "BK-2026-0892",
      "carrierName": "MedTransport SA",
      ...
    }
  ]
}
```

### Test 3: Verify Loading State (by slowing down network)
1. DevTools → Network tab
2. Click throttling dropdown (usually says "No throttling")
3. Select "Fast 3G"
4. Reload page
5. Should see loading skeleton for 1-2 seconds
6. Then data appears

### Test 4: Test Error Handling
1. Stop your backend server (Ctrl+C if running locally)
2. Reload admin page
3. Should see error message instead of loading state

---

## Common Issues & Fixes

### Issue 1: "axiosInstance is not exported"
**Fix:** Make sure you have this file: [services/axios.ts](services/axios.ts)
```typescript
// services/axios.ts should have:
export const axiosInstance = axios.create({...})
```

If file doesn't exist, create it using the axios configuration from API_DOCUMENTATION.md.

### Issue 2: "Cannot find variable 'axiosInstance'"
**Fix:** Import it correctly:
```typescript
// Wrong:
import { axiosInstance } from '@/services'

// Correct (if no index.ts):
import { axiosInstance } from '@/services/axios'
```

### Issue 3: Table looks broken after refactor
**Fix:** Make sure all Table imports are present:
```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
```

### Issue 4: Data doesn't appear, loading never stops
**Fix:** Check if backend is running and returning data:
1. Open DevTools → Network tab
2. Look for `/bookings` request
3. Click it and check "Response" tab
4. If response is empty or red error, backend isn't running

### Issue 5: "Property 'status' does not exist"
**Fix:** Backend might return different field names. Update interface:
```typescript
const response = await axiosInstance.get('/bookings?limit=6')
console.log(response.data.data[0]) // See what properties exist
// Then update interface to match
```

---

## Next Components to Update (Same Pattern)

Once this works, use the same pattern for:

1. **KPI Cards** - Instead of array, fetch from `/reports/admin` 
2. **Bookings Chart** - Fetch chart data from `/reports/admin`
3. **Operator KPI Cards** - Fetch from `/reports/operator`
4. **Hourly Activity Chart** - Fetch from `/reports/operator`

Each follows the same 5 steps:
1. Add imports
2. Remove hardcoded data
3. Add state
4. Add useEffect with API call
5. Add loading/error/empty states in JSX

---

## Commit Message

Once working, commit with:

```bash
git add components/admin/recent-bookings.tsx
git commit -m "Remove mock data: RecentBookings → GET /bookings

- Fetch real bookings from /bookings endpoint
- Add loading skeleton while fetching
- Add error handling for API failures
- Add empty state when no bookings exist
- Remove hardcoded bookings array
"
```

---

## Verification Checklist

Before moving to next component:

- [ ] Component loads without errors
- [ ] Loading skeleton shows for 1-2 seconds
- [ ] Data appears after load
- [ ] API call visible in Network tab
- [ ] CSRF token included in request headers
- [ ] Component matches design (no styling broken)
- [ ] Mobile responsive
- [ ] Error state works (tested with backend offline)
- [ ] No console errors (F12 → Console tab clean)

Once all ✅, you're ready to refactor the next component!

---

## 🚀 Ready?

```bash
# 1. Open components/admin/recent-bookings.tsx
# 2. Follow the 5 steps above
# 3. Save file
# 4. Test in browser at http://localhost:3000/admin
# 5. If it works, copy this pattern to other components!
```
