// ...existing code moved to md/MOCK_DATA_REMOVAL.md
# Mock Data Removal & API Integration Guide

This guide shows where all mock data is located and how to replace it with real API calls.

## 📍 Mock Data Locations

### 1. Chart Components (Mock Data in Component Files)

#### File: `components/operator/hourly-activity-chart.tsx`
**Lines 22-37**
```typescript
const hourlyData = [
  { hour: "06", approved: 10, pending: 2, rejected: 0 },
  // ... 11 more entries
]
```
**Replacement:** Fetch from `GET /reports/operator` and extract `chartData.hourlyActivity`

---

#### File: `components/admin/bookings-chart.tsx`
**Lines 22-32**
```typescript
const weeklyData = [
  { day: "Mon", approved: 42, pending: 18, rejected: 5 },
  // ... 6 more entries
]
```
**Replacement:** Fetch from `GET /reports/admin` and extract `chartData.weeklyBookings`

---

#### File: `components/carrier/carrier-booking-chart.tsx`
**Lines 22-28**
```typescript
const weeklyData = [
  { day: "Mon", bookings: 5 },
  // ... 6 more entries
]
```
**Replacement:** Fetch from `GET /reports/carrier` and extract `chartData.monthlyTrend`

---

### 2. Recent Bookings Table (Mock Data)

#### File: `components/admin/recent-bookings.tsx`
**Lines 18-63**
```typescript
const bookings = [
  {
    id: "BK-2026-0892",
    carrier: "MedTransport SA",
    terminal: "Terminal A",
    // ... more fields
  },
  // ... 5 more bookings
]
```
**Replacement:** Fetch from `GET /bookings?limit=6&sort=createdAt&order=desc`

---

### 3. Chat Assistant Mock Data

#### File: `app/chat/page.tsx`
**Lines 57-204**
```typescript
const demoChatSessions: ChatSession[] = [
  {
    id: "chat-1",
    title: "Booking status inquiry",
    // ... session data and sample messages
  },
  // ... 2 more demo sessions
]
```
**Replacement:** 
- Fetch from `GET /notifications?limit=10`
- Use real booking data from `GET /bookings`
- Use real fleet data from `GET /fleet`
- Create interactive chat backend if needed

---

### 4. KPI Cards (Mock Values)

#### File: `components/admin/kpi-cards.tsx`
**Lines 13-46**
```typescript
const kpis = [
  {
    label: "Total Bookings",
    value: "1,284",
    change: "+12.5%",
    // ...
  },
  // ... 2 more KPI items
]
```
**Replacement:** Fetch from `GET /reports/admin` and extract `kpis` data

---

#### File: `components/operator/operator-kpi-cards.tsx`
**Lines 12-46**
```typescript
const kpis = [
  {
    label: "Pending Validations",
    value: "18",
    // ...
  },
  // ... 3 more KPI items
]
```
**Replacement:** Fetch from `GET /reports/operator` and extract `kpis` data

---

#### File: `components/carrier/carrier-kpi-cards.tsx`
**Lines 12-45**
```typescript
const kpis = [
  {
    label: "Active Bookings",
    value: "12",
    // ...
  },
  // ... 3 more KPI items
]
```
**Replacement:** Fetch from `GET /reports/carrier` and extract `kpis` data

---

### 5. Report Page Mock Data

#### File: `app/operator/reports/page.tsx`
**Lines 31-76**
```typescript
const topCarriers = [
  { name: "MedTransport SA", bookings: 45 },
  // ... more carriers
]
```
**Replacement:** Fetch from `GET /bookings/stats?start_date=...&end_date=...` and extract `byCarrier` data

---

#### File: `app/carrier/reports/page.tsx`
**Lines 32-43**
```typescript
const monthlyData = [
  { month: "Sep", bookings: 28 },
  // ... 5 more months
]
const statusData = [
  { name: "Completed", value: 38, color: "..." },
  // ... more statuses
]
```
**Replacement:** Fetch from `GET /reports/carrier` and extract chart data

---

## 🔄 Implementation Patterns

### Pattern 1: Simple Chart Component Refactor

**Before (Hardcoded Data):**
```typescript
const hourlyData = [
  { hour: "06", approved: 10, pending: 2, rejected: 0 },
  // ...
]

export function HourlyActivityChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={hourlyData}>
          {/* ... */}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
```

**After (API Call):**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { axiosInstance } from '@/services'

export function HourlyActivityChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/reports/operator')
        setData(response.data.data.chartData.hourlyActivity)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) return <LoadingCard />
  if (error) return <ErrorCard message={error} />

  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          {/* ... */}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
```

---

### Pattern 2: KPI Cards Refactor

**Before:**
```typescript
const kpis = [
  {
    label: "Total Bookings",
    value: "1,284",
    change: "+12.5%",
    trend: "up" as const,
    period: "vs last month",
    // ...
  },
  // ...
]

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border-border bg-card">
          {/* ... */}
        </Card>
      ))}
    </div>
  )
}
```

**After:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { axiosInstance } from '@/services'

interface KPI {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  period: string
  icon: any
  iconBg: string
  iconColor: string
}

export function KpiCards() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const response = await axiosInstance.get('/reports/admin')
        const { kpis: rawKpis } = response.data.data
        
        // Transform API data to component format
        const formattedKpis = [
          {
            label: "Total Bookings",
            value: rawKpis.totalBookings?.toString() || '0',
            change: `+${rawKpis.percentChanges?.totalBookings || 0}%`,
            trend: (rawKpis.percentChanges?.totalBookings || 0) > 0 ? 'up' : 'down',
            period: "vs last month",
            icon: ClipboardList,
            iconBg: "bg-[hsl(210,65%,45%)]/10",
            iconColor: "text-[hsl(210,65%,45%)]",
          },
          // ... more KPIs
        ]
        
        setKpis(formattedKpis)
      } catch (err) {
        console.error('Failed to fetch KPIs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchKpis()
  }, [])

  if (loading) return <LoadingCards />

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border-border bg-card">
          {/* ... */}
        </Card>
      ))}
    </div>
  )
}
```

---

### Pattern 3: Tables with Real Data

**Before:**
```typescript
const bookings = [
  {
    id: "BK-2026-0892",
    carrier: "MedTransport SA",
    terminal: "Terminal A",
    // ...
  },
  // ... mock bookings
]

export function RecentBookings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                {/* ... */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

**After:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { axiosInstance } from '@/services'

interface Booking {
  id: string
  bookingNumber: string
  carrierName: string
  terminal: string
  status: 'pending' | 'approved' | 'rejected'
  // ... other fields
}

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get('/bookings?limit=6&sort=createdAt&order=desc')
        setBookings(response.data.data)
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (loading) return <LoadingTable />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                {/* ... */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
```

---

## 🎯 Migration Checklist

### Phase 1: Authentication (Foundation)
- [ ] Test `/auth/login` endpoint
- [ ] Verify CSRF token is returned
- [ ] Test token in subsequent requests
- [ ] Test logout endpoint
- [ ] Verify 401/403 error handling

### Phase 2: Core Data Endpoints
- [ ] Test `/bookings` GET endpoint
- [ ] Test `/bookings/{id}` GET endpoint
- [ ] Test `/bookings` POST endpoint
- [ ] Test `/bookings/{id}/status` PATCH endpoint
- [ ] Test `/bookings/stats` endpoint

### Phase 3: Dashboard Data
- [ ] Test `/reports/admin` endpoint
- [ ] Test `/reports/operator` endpoint
- [ ] Test `/reports/carrier` endpoint
- [ ] Update KPI cards to use API data
- [ ] Update chart components to use API data

### Phase 4: Supporting Endpoints
- [ ] Test `/terminals` endpoint
- [ ] Test `/terminals/{id}/availability` endpoint
- [ ] Test `/carriers` endpoint
- [ ] Test `/fleet` endpoint
- [ ] Test `/users` endpoint (admin)

### Phase 5: Frontend Integration
- [ ] Replace hardcoded hourly data in operator charts
- [ ] Replace hardcoded weekly data in admin/carrier charts
- [ ] Replace hardcoded KPI cards in all dashboards
- [ ] Replace hardcoded bookings tables
- [ ] Replace hardcoded chat session data
- [ ] Update report pages to use API

### Phase 6: Testing & Optimization
- [ ] Test all pages load correctly
- [ ] Verify error states display properly
- [ ] Add loading states to all data-fetching components
- [ ] Test pagination on list views
- [ ] Test filtering and sorting
- [ ] Check performance with real data

---

## 🛠️ Helper Components to Create

Create reusable loading & error components:

### LoadingCard Component
```typescript
// components/ui/loading-card.tsx
export function LoadingCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/4" />
        </div>
      </CardContent>
    </Card>
  )
}
```

### ErrorCard Component
```typescript
// components/ui/error-card.tsx
export function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="border-destructive/50 bg-destructive/10">
      <CardContent className="p-6">
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  )
}
```

---

## 🔄 Service Layer Updates

Update services/booking.service.ts to include more endpoint functions:

```typescript
// Add these to services/booking.service.ts

export const getBookingStats = async (params?: {
  startDate?: string
  endDate?: string
  terminalId?: string
}) => {
  const response = await axiosInstance.get('/bookings/stats', { params })
  return response.data.data
}

export const approveBooking = async (id: string, notes?: string) => {
  return updateBookingStatus(id, 'approved', notes)
}

export const rejectBooking = async (id: string, reason: string) => {
  const response = await axiosInstance.patch(`/bookings/${id}/status`, {
    status: 'rejected',
    rejectionReason: reason
  })
  return response.data.data
}
```

Create new services:

```typescript
// services/reports.service.ts
export const getAdminReports = async (params?: DateRangeFilter) => {
  const response = await axiosInstance.get('/reports/admin', { params })
  return response.data.data
}

export const getOperatorReports = async (params?: DateRangeFilter) => {
  const response = await axiosInstance.get('/reports/operator', { params })
  return response.data.data
}

export const getCarrierReports = async (params?: DateRangeFilter) => {
  const response = await axiosInstance.get('/reports/carrier', { params })
  return response.data.data
}
```

---

## 📋 Summary

| Component/File | Mock Data | Replacement Endpoint | Priority |
|---|---|---|---|
| HourlyActivityChart | `hourlyData` | `GET /reports/operator` | High |
| BookingsChart | `weeklyData` | `GET /reports/admin` | High |
| CarrierBookingChart | `weeklyData` | `GET /reports/carrier` | Medium |
| KpiCards (Admin) | `kpis` | `GET /reports/admin` | High |
| KpiCards (Operator) | `kpis` | `GET /reports/operator` | High |
| KpiCards (Carrier) | `kpis` | `GET /reports/carrier` | Medium |
| RecentBookings | `bookings` | `GET /bookings` | High |
| ChatSessions | `demoChatSessions` | User data context | Low |
| Reports (Operator) | `topCarriers` | `GET /bookings/stats` | Medium |
| Reports (Carrier) | `monthlyData`, `statusData` | `GET /reports/carrier` | Medium |

---

## 🚀 Getting Started

1. **Start with authentication** - Implement login first as other endpoints depend on it
2. **Test in Postman** - Verify all endpoints before connecting frontend
3. **Implement one dashboard at a time** - Admin → Operator → Carrier
4. **Use the services layer** - Don't make API calls directly in components
5. **Add error handling** - Show user-friendly error messages
6. **Test thoroughly** - With real data before deploying

---

## 📞 Support

- Check API_DOCUMENTATION.md for endpoint details
- See services/README.md for API service usage
- Review example-usage.tsx for implementation patterns
