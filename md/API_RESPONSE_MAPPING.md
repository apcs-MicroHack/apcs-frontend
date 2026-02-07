// ...existing code moved to md/API_RESPONSE_MAPPING.md
# API Response Mapping Guide

This guide shows how to handle different API response types and map them to component data structures.

---

## 1. Simple Bookings List Response

### API Response Format (from API_DOCUMENTATION.md)

```json
GET /bookings?limit=6&sort=createdAt&order=desc

Response:
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "bookingNumber": "BK-2026-0892",
      "carrierName": "MedTransport SA",
      "terminal": "Terminal A",
      "trucks": "MZ-25-8547",
      "status": "approved",
      "createdAt": "2026-01-15T10:00:00Z",
      "scheduledDate": "2026-01-20",
      "approvedDate": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 42,
    "pages": 7
  }
}
```

### Component Usage

```typescript
'use client'

import { useState, useEffect } from 'react'
import { axiosInstance } from '@/services'

interface Booking {
  id: string
  bookingNumber: string
  carrierName: string
  terminal: string
  trucks: string
  status: 'approved' | 'pending' | 'rejected'
  scheduledDate: string
}

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get('/bookings', {
          params: { limit: 6, sort: 'createdAt', order: 'desc' }
        })
        
        // Response.data.data directly matches our interface
        setBookings(response.data.data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // ... rest of component
}
```

---

## 2. Reports Response with Multiple Chart Datasets

### API Response Format (from API_DOCUMENTATION.md)

```json
GET /reports/admin

Response:
{
  "status": "success",
  "data": {
    "kpis": {
      "totalBookings": 1284,
      "pendingBookings": 127,
      "approvedBookings": 1089,
      "rejectedBookings": 68,
      "percentChanges": {
        "totalBookings": 12.5,
        "pendingBookings": -3.2,
        "approvedBookings": 15.8,
        "rejectedBookings": 0
      }
    },
    "chartData": {
      "weeklyBookings": [
        { "day": "Mon", "approved": 42, "pending": 18, "rejected": 5 },
        { "day": "Tue", "approved": 45, "pending": 21, "rejected": 3 },
        // ... more days
      ],
      "monthlyTrend": [
        { "month": "Jan", "bookings": 380 },
        { "month": "Feb", "bookings": 412 },
        // ... more months
      ],
      "topCarriers": [
        { "id": "c1", "name": "MedTransport SA", "bookings": 145 },
        // ... more carriers
      ]
    }
  }
}
```

### Component Usage - KPI Cards

```typescript
'use client'

import { useEffect, useState } from 'react'
import { axiosInstance } from '@/services'
import { Card, CardContent } from '@/components/ui/card'

interface KPI {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  period: string
}

export function AdminKpiCards() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const response = await axiosInstance.get('/reports/admin')
        const { kpis: rawKpis } = response.data.data

        // Transform API data to component format
        const formattedKpis: KPI[] = [
          {
            label: 'Total Bookings',
            value: rawKpis.totalBookings.toLocaleString(),
            change: `+${rawKpis.percentChanges.totalBookings}%`,
            trend: rawKpis.percentChanges.totalBookings > 0 ? 'up' : 'down',
            period: 'vs last month'
          },
          {
            label: 'Pending Reviews',
            value: rawKpis.pendingBookings.toLocaleString(),
            change: `${rawKpis.percentChanges.pendingBookings}%`,
            trend: rawKpis.percentChanges.pendingBookings > 0 ? 'up' : 'down',
            period: 'vs last month'
          },
          {
            label: 'Approved Bookings',
            value: rawKpis.approvedBookings.toLocaleString(),
            change: `+${rawKpis.percentChanges.approvedBookings}%`,
            trend: rawKpis.percentChanges.approvedBookings > 0 ? 'up' : 'down',
            period: 'vs last month'
          },
          {
            label: 'Rejected Bookings',
            value: rawKpis.rejectedBookings.toLocaleString(),
            change: `${rawKpis.percentChanges.rejectedBookings}%`,
            trend: 'down',
            period: 'vs last month'
          }
        ]

        setKpis(formattedKpis)
      } catch (err) {
        console.error('Error fetching KPIs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchKpis()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">{kpi.label}</h3>
            <p className="text-2xl font-bold mt-2">{kpi.value}</p>
            <p className={`text-xs mt-2 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.change} {kpi.period}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Component Usage - Chart Component

```typescript
'use client'

import { useEffect, useState } from 'react'
import { axiosInstance } from '@/services'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
  day: string
  approved: number
  pending: number
  rejected: number
}

export function BookingsChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/reports/admin')
        
        // Extract just the weekly bookings chart data from the response
        const weeklyData = response.data.data.chartData.weeklyBookings
        
        // No transformation needed - API format matches component format!
        setData(weeklyData)
      } catch (err) {
        console.error('Error fetching chart data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading chart...</div>

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="approved" fill="#10b981" />
        <Bar dataKey="pending" fill="#f59e0b" />
        <Bar dataKey="rejected" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

---

## 3. Booking Stats Response

### API Response Format

```json
GET /bookings/stats?startDate=2026-01-01&endDate=2026-01-31&terminalId=t1

Response:
{
  "status": "success",
  "data": {
    "total": 285,
    "byStatus": {
      "approved": 245,
      "pending": 28,
      "rejected": 12
    },
    "byCarrier": [
      { "carrierId": "c1", "carrierName": "MedTransport SA", "count": 45 },
      { "carrierId": "c2", "carrierName": "LogisticaX", "count": 38 },
      // ... more carriers
    ],
    "byTerminal": [
      { "terminalId": "t1", "terminalName": "Terminal A", "count": 92 },
      { "terminalId": "t2", "terminalName": "Terminal B", "count": 75 },
      // ... more terminals
    ],
    "dateRange": {
      "startDate": "2026-01-01",
      "endDate": "2026-01-31"
    }
  }
}
```

### Component Usage - Multi-Dataset Report

```typescript
'use client'

import { useEffect, useState } from 'react'
import { axiosInstance } from '@/services'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

export function BookingStatsReport() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get date range (last 30 days as example)
        const endDate = new Date().toISOString().split('T')[0]
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const response = await axiosInstance.get('/bookings/stats', {
          params: { startDate, endDate }
        })

        const data = response.data.data

        // Format for pie chart
        const statusData = [
          { name: 'Approved', value: data.byStatus.approved, fill: '#10b981' },
          { name: 'Pending', value: data.byStatus.pending, fill: '#f59e0b' },
          { name: 'Rejected', value: data.byStatus.rejected, fill: '#ef4444' }
        ]

        // Format for table
        const topCarriers = data.byCarrier.slice(0, 5) // Top 5
        const topTerminals = data.byTerminal.slice(0, 5) // Top 5

        setStats({
          total: data.total,
          statusData,
          topCarriers,
          topTerminals
        })
        setDateRange({ start: startDate, end: endDate })
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div>Loading stats...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        Booking Statistics ({stats.total} total)
      </h2>

      {/* Status Pie Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Status Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.statusData}
              dataKey="value"
              label
              cx="50%"
              cy="50%"
            >
              {stats.statusData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Carriers Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Carriers</h3>
        <table className="w-full">
          <tbody>
            {stats.topCarriers.map((carrier) => (
              <tr key={carrier.carrierId} className="border-b">
                <td className="py-2">{carrier.carrierName}</td>
                <td className="py-2 text-right">{carrier.count} bookings</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## 4. Terminal Availability Response

### API Response Format

```json
GET /terminals/t1/availability

Response:
{
  "status": "success",
  "data": {
    "terminalId": "t1",
    "terminalName": "Terminal A",
    "capacity": {
      "total": 50,
      "available": 12,
      "used": 38
    },
    "operatingHours": {
      "open": "06:00",
      "close": "22:00"
    },
    "schedule": [
      {
        "hour": "06:00",
        "available": 5,
        "booked": 45,
        "percentage": 90
      },
      // ... more hours
    ]
  }
}
```

### Component Usage

```typescript
'use client'

import { useEffect, useState } from 'react'
import { axiosInstance } from '@/services'

interface Terminal {
  terminalId: string
  terminalName: string
  capacity: {
    total: number
    available: number
    used: number
  }
  operatingHours: {
    open: string
    close: string
  }
}

export function TerminalCapacity({ terminalId }: { terminalId: string }) {
  const [terminal, setTerminal] = useState<Terminal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTerminal = async () => {
      try {
        const response = await axiosInstance.get(`/terminals/${terminalId}/availability`)
        setTerminal(response.data.data)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTerminal()
  }, [terminalId])

  if (loading) return <div>Loading...</div>
  if (!terminal) return <div>Terminal not found</div>

  const { available, total } = terminal.capacity
  const percentageAvailable = (available / total) * 100

  return (
    <div className="p-6 bg-white rounded-lg">
      <h3 className="text-lg font-semibold">{terminal.terminalName}</h3>
      <p className="text-sm text-gray-600">
        Open: {terminal.operatingHours.open} - {terminal.operatingHours.close}
      </p>

      <div className="mt-4">
        <p className="text-2xl font-bold">
          {available}/{total} Slots Available
        </p>
        <div className="bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
          <div
            className="bg-green-500 h-full"
            style={{ width: `${percentageAvailable}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {percentageAvailable.toFixed(0)}% available
        </p>
      </div>
    </div>
  )
}
```

---

## 5. Nested List Response (Users/Fleet)

### API Response Format

```json
GET /fleet?limit=10&page=1

Response:
{
  "status": "success",
  "data": [
    {
      "id": "f1",
      "carrierName": "MedTransport SA",
      "trucks": [
        {
          "id": "t1",
          "plate": "MZ-25-8547",
          "type": "standard",
          "capacity": 1000,
          "status": "active"
        },
        // ... more trucks
      ],
      "totalTrucks": 15,
      "activeTrucks": 12
    },
    // ... more carriers
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Component Usage

```typescript
'use client'

import { useEffect, useState } from 'react'
import { axiosInstance } from '@/services'

interface Truck {
  id: string
  plate: string
  type: string
  capacity: number
  status: 'active' | 'inactive' | 'maintenance'
}

interface Fleet {
  id: string
  carrierName: string
  trucks: Truck[]
  totalTrucks: number
  activeTrucks: number
}

export function FleetList() {
  const [fleets, setFleets] = useState<Fleet[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchFleets = async () => {
      try {
        const response = await axiosInstance.get('/fleet', {
          params: { limit: 10, page }
        })
        
        setFleets(response.data.data)
        setTotalPages(response.data.pagination.pages)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFleets()
  }, [page]) // Re-fetch when page changes

  return (
    <div className="space-y-6">
      {fleets.map((fleet) => (
        <div key={fleet.id} className="border rounded p-4">
          <h3 className="font-semibold">{fleet.carrierName}</h3>
          <p className="text-sm text-gray-600">
            {fleet.activeTrucks} of {fleet.totalTrucks} trucks active
          </p>

          <div className="mt-4 space-y-2">
            {fleet.trucks.map((truck) => (
              <div key={truck.id} className="text-sm flex justify-between p-2 bg-gray-50">
                <span>{truck.plate}</span>
                <span>{truck.type}</span>
                <span className="font-semibold">{truck.capacity}kg</span>
                <span className={truck.status === 'active' ? 'text-green-600' : 'text-gray-500'}>
                  {truck.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="py-2">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

---

## Common Transformation Patterns

### Pattern 1: Flatten Nested Data
```typescript
// API returns: { name: "Company", address: { street: "123 Main", city: "NYC" } }
// Component expects: { name: "Company", street: "123 Main", city: "NYC" }

const flattened = {
  ...data,
  ...data.address // Spread address fields to top level
}
```

### Pattern 2: Array to Object Lookup
```typescript
// API returns: [{ id: "1", name: "Option A" }, { id: "2", name: "Option B" }]
// Component expects: { "1": "Option A", "2": "Option B" }

const lookup = data.reduce((acc, item) => {
  acc[item.id] = item.name
  return acc
}, {})
```

### Pattern 3: Add Computed Properties
```typescript
// API returns: { total: 100, used: 25 }
// Component expects: { total: 100, used: 25, available: 75, percentUsed: 25 }

const enhanced = {
  ...data,
  available: data.total - data.used,
  percentUsed: (data.used / data.total) * 100
}
```

### Pattern 4: Format Dates
```typescript
// API returns: "2026-01-15T10:00:00Z"
// Component expects: "Jan 15, 2026"

const formatted = new Date(data.createdAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
})
```

### Pattern 5: Filter and Sort
```typescript
// API returns all items, component needs only top N

const topItems = data
  .sort((a, b) => b.count - a.count) // Sort descending
  .slice(0, 5) // Take first 5
```

---

## Debugging API Responses

When data doesn't appear as expected:

### Step 1: Log the Raw Response
```typescript
const response = await axiosInstance.get('/bookings')
console.log('Full response:', response)
console.log('Status:', response.status)
console.log('Data structure:', response.data)
console.log('Actual records:', response.data.data)
```

### Step 2: Check Network Tab
1. DevTools → Network tab
2. Find your API request
3. Click it and check:
   - URL correct?
   - Request headers include x-csrf-token?
   - Status code 200?
   - Response tab shows JSON?

### Step 3: Verify Field Names
```typescript
// If component shows undefined values:
if (response.data.data.length > 0) {
  console.log('First record:', response.data.data[0])
  console.log('Available keys:', Object.keys(response.data.data[0]))
}
// Then update component to use correct field names
```

### Step 4: Test with Postman
- Copy API endpoint from API_DOCUMENTATION.md
- Test in Postman before integrating into component
- Verify response structure matches documentation
- If different, update documentation OR adjust component

---

## TypeScript Interfaces from API Docs

Here are ready-to-use TypeScript interfaces matching API_DOCUMENTATION.md:

```typescript
// Auth
interface LoginRequest {
  email: string
  password: string
}

interface AuthResponse {
  user: {
    id: string
    email: string
    role: 'admin' | 'operator' | 'carrier'
    firstName?: string
    lastName?: string
  }
  token?: string // If JWT in body
}

// Bookings
interface Booking {
  id: string
  bookingNumber: string
  carrierName: string
  carrierIcon?: string
  terminal: string
  trucks: string
  status: 'pending' | 'approved' | 'rejected'
  scheduledDate: string
  approvedDate?: string
  createdAt: string
}

interface BookingListResponse {
  status: 'success'
  data: Booking[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Reports
interface ReportResponse {
  status: 'success'
  data: {
    kpis: {
      totalBookings: number
      pendingBookings: number
      approvedBookings: number
      rejectedBookings: number
      percentChanges: {
        totalBookings: number
        pendingBookings: number
        approvedBookings: number
        rejectedBookings: number
      }
    }
    chartData: {
      weeklyBookings: ChartEntry[]
      monthlyTrend: ChartEntry[]
      topCarriers: TopCarrierEntry[]
    }
  }
}

interface ChartEntry {
  day?: string
  month?: string
  hour?: string
  [key: string]: string | number | undefined
}

interface TopCarrierEntry {
  id: string
  name: string
  bookings: number
}
```

---

## Summary Checklist

When integrating any API endpoint:

- [ ] Check API response format in API_DOCUMENTATION.md
- [ ] Log raw response to verify structure
- [ ] Check Network tab in DevTools
- [ ] Verify field names match between API and component
- [ ] Transform data if API format != component expectations
- [ ] Add loading state while fetching
- [ ] Add error handling and display
- [ ] Test with real backend data
- [ ] Verify CSRF token in request headers
- [ ] No console errors or warnings

Done with one endpoint? Repeat for next component!
