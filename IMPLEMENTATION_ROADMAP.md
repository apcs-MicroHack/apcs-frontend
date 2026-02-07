// ...existing code moved to md/IMPLEMENTATION_ROADMAP.md
# Implementation Roadmap: Mock Data to API Integration

## Overview
This roadmap breaks down the mock data removal into manageable sprints with clear deliverables.

---

## 🎯 Sprint 1: Foundation (Day 1)
**Goal:** Set up service layer + test authentication

### Tasks
1. **Create helper loading components**
   - [ ] `components/ui/loading-card.tsx` 
   - [ ] `components/ui/error-card.tsx`
   - [ ] `components/ui/loading-skeleton.tsx`

2. **Update services**
   - [ ] Expand `services/booking.service.ts` with more methods
   - [ ] Create `services/reports.service.ts`
   - [ ] Create `services/terminal.service.ts`

3. **Test Authentication**
   - [ ] Verify login endpoint returns CSRF token
   - [ ] Verify token is stored in CSRF service
   - [ ] Test making authenticated request with token header

### Deliverable
- [ ] All service layer files created and documented
- [ ] Loading/error components ready for use
- [ ] Authentication verified working

---

## 🎯 Sprint 2: Admin Dashboard (Days 2-3)
**Goal:** Replace all admin hardcoded data with API calls

### Component Updates (In Order)
1. **`components/admin/kpi-cards.tsx`**
   - Remove hardcoded `kpis` array
   - Fetch from `GET /reports/admin`
   - Add loading state
   - **Difficulty:** Medium | **Time:** 1-2 hours

2. **`components/admin/bookings-chart.tsx`**
   - Remove hardcoded `weeklyData` array
   - Fetch from `GET /reports/admin` 
   - Parse `chartData.weeklyBookings`
   - Add loading skeleton for chart
   - **Difficulty:** Medium | **Time:** 1-2 hours

3. **`components/admin/recent-bookings.tsx`**
   - Remove hardcoded `bookings` array
   - Fetch from `GET /bookings?limit=6&sort=createdAt`
   - Implement pagination
   - Add loading table skeleton
   - **Difficulty:** Easy | **Time:** 1 hour

4. **`components/admin/capacity-overview.tsx`**
   - Remove hardcoded capacity data
   - Fetch from `GET /terminals`
   - Calculate available/used capacity
   - **Difficulty:** Easy | **Time:** 1 hour

### Testing Checklist
- [ ] All components show loading state while fetching
- [ ] Data displays correctly once loaded
- [ ] Error state shows when API fails
- [ ] Nav between admin pages doesn't cause re-fetches (use SWR or React Query if needed)

### Deliverable
- [ ] Admin dashboard fully uses API data
- [ ] All admin components have error handling
- [ ] Admin pages load and display correctly

---

## 🎯 Sprint 3: Operator Dashboard (Days 4-5)
**Goal:** Replace all operator hardcoded data with API calls

### Component Updates (In Order)
1. **`components/operator/operator-kpi-cards.tsx`**
   - Remove hardcoded `kpis` array
   - Fetch from `GET /reports/operator`
   - Add loading state
   - **Difficulty:** Easy | **Time:** 1 hour

2. **`components/operator/hourly-activity-chart.tsx`**
   - Remove hardcoded `hourlyData` array
   - Fetch from `GET /reports/operator`
   - Parse `chartData.hourlyActivity`
   - **Difficulty:** Medium | **Time:** 1-2 hours

3. **`components/operator/live-queue-preview.tsx`**
   - Remove hardcoded queue data
   - Fetch from `GET /bookings?status=pending&limit=5`
   - **Difficulty:** Easy | **Time:** 1 hour

4. **`app/operator/reports/page.tsx`**
   - Remove `topCarriers`, `statusData` arrays
   - Fetch from `GET /reports/operator`
   - Parse chart data appropriately
   - **Difficulty:** Medium | **Time:** 2 hours

### Testing Checklist
- [ ] Operator dashboard shows real-time pending bookings
- [ ] Hourly activity chart updates with actual data
- [ ] KPI cards show accurate metrics
- [ ] Reports page displays correct statistics

### Deliverable
- [ ] Operator dashboard fully uses API data
- [ ] Real-time data displays for operator features
- [ ] All operator pages fully functional

---

## 🎯 Sprint 4: Carrier Dashboard (Days 6-7)
**Goal:** Replace all carrier hardcoded data with API calls

### Component Updates (In Order)
1. **`components/carrier/carrier-kpi-cards.tsx`**
   - Remove hardcoded `kpis` array
   - Fetch from `GET /reports/carrier`
   - Add loading state
   - **Difficulty:** Easy | **Time:** 1 hour

2. **`components/carrier/carrier-booking-chart.tsx`**
   - Remove hardcoded `weeklyData` array
   - Fetch from `GET /reports/carrier`
   - **Difficulty:** Medium | **Time:** 1-2 hours

3. **`components/carrier/carrier-recent-bookings.tsx`**
   - Remove hardcoded bookings
   - Fetch using filtering by current carrier
   - Implement pagination
   - **Difficulty:** Easy | **Time:** 1 hour

4. **`app/carrier/reports/page.tsx`**
   - Remove `monthlyData`, `statusData` arrays
   - Fetch from `GET /reports/carrier`
   - **Difficulty:** Medium | **Time:** 2 hours

### Testing Checklist
- [ ] Carrier dashboard shows their bookings only
- [ ] Charts reflect carrier-specific data
- [ ] KPI cards show carrier metrics
- [ ] Reports page displays carrier analytics

### Deliverable
- [ ] Carrier dashboard fully uses API data
- [ ] Carrier role-based filtering working
- [ ] Carrier pages fully functional

---

## 🎯 Sprint 5: Chat & Notifications (Days 8-10)
**Goal:** Replace chat mock data with real implementation

### Tasks
1. **`app/chat/page.tsx`**
   - Remove `demoChatSessions` array
   - Remove `botResponses` object
   - Fetch real chat history from `GET /notifications`
   - Implement message sending to `POST /chat` (if backend supports)
   - **Difficulty:** Hard | **Time:** 4-6 hours

2. **Create chat service**
   - `services/chat.service.ts`
   - Methods: `getMessages()`, `sendMessage()`, `markAsRead()`
   - **Difficulty:** Medium | **Time:** 2 hours

3. **Implement real-time updates** (Optional)
   - Consider WebSocket if backend supports
   - Or use polling with intervals
   - **Difficulty:** Hard | **Time:** 3-4 hours

### Testing Checklist
- [ ] Chat loads previous messages from API
- [ ] Messages send successfully
- [ ] Error handling for failed sends
- [ ] Real-time updates work (if implemented)

### Deliverable
- [ ] Chat interface uses real data
- [ ] Message history loads correctly
- [ ] Message sending functional

---

## 📋 PR/Commit Strategy

### Per Component: Create PR with these checks
```
PR Title: "Remove mock data from {Component}: use {Endpoint} API"

Before merge:
- [ ] Component shows loading state
- [ ] Component handles errors gracefully
- [ ] Data displays correctly when loaded
- [ ] No console errors or warnings
- [ ] Responsive on mobile/tablet
- [ ] Tested with real backend data
```

### Commits Format
```
commit message: "Remove mock data: {ComponentName} → {Endpoint}"

Example:
commit: "Remove mock data: AdminKpiCards → GET /reports/admin"
commit: "Remove mock data: RecentBookings → GET /bookings"
commit: "Remove mock data: HourlyActivityChart → GET /reports/operator"
```

---

## 🚀 Quick Start Commands

### 1. Start Testing Backend Endpoints with Postman
```bash
# Import API_DOCUMENTATION.md into Postman
# Create collections for each role (Admin, Operator, Carrier)
# Test GET /auth/me to verify CSRF token is working
```

### 2. Create Loading Components First
```bash
# Create the helper components before updating dashboard components
# This makes the refactoring cleaner and faster
```

### 3. Update Components One By One
```bash
# Start with simple components (tables) before complex ones (charts)
# Test each component in isolation before moving to next
# Use browser DevTools -> Network tab to verify API calls
```

### 4. Verify API Contract Matches
```bash
# Before making component changes, ensure backend returns:
# - Correct field names (from API_DOCUMENTATION.md)
# - Correct data types
# - Correct array structure
# - Pagination format (if applicable)

# If backend differs from API_DOCUMENTATION.md:
# EITHER update component to match actual backend response
# OR ask backend to update to match contract
```

---

## ⚠️ Common Pitfalls & Solutions

### 1. Components Re-fetch Data on Every Render
**Problem:** useEffect dependency array missing or wrong
**Solution:**
```typescript
// Bad
useEffect(() => {
  fetchData()
  // Missing dependency array → runs every render
})

// Good
useEffect(() => {
  fetchData()
}, []) // Empty array = run once on mount

// Also good
useEffect(() => {
  fetchData()
}, [profileId]) // Re-fetch only when profileId changes
```

### 2. Missing Loading States
**Problem:** Components show no data while fetching
**Solution:**
```typescript
const [loading, setLoading] = useState(true)

if (loading) return <LoadingCard />
// Data shows only after loading: false
```

### 3. API Response Format Mismatch
**Problem:** API returns different field names than component expects
**Solution:**
```typescript
// API returns: { booking_number, carrier_name }
// Component expects: { bookingNumber, carrierName }

// Transform data:
const transformed = response.data.map(item => ({
  bookingNumber: item.booking_number,
  carrierName: item.carrier_name
}))
```

### 4. Pagination Not Implemented  
**Problem:** Component shows only first page, can't navigate
**Solution:**
```typescript
const [page, setPage] = useState(1)

const fetchBookings = useCallback(async () => {
  const response = await axiosInstance.get('/bookings', {
    params: { page, limit: 6 }
  })
  setBookings(response.data.data)
}, [page]) // Re-fetch when page changes

useEffect(() => {
  fetchBookings()
}, [fetchBookings])
```

---

## 📊 Progress Tracking

### Sprint Completion Status
- [ ] Sprint 1: Foundation (Services + Loading Components)
- [ ] Sprint 2: Admin Dashboard (All Admin Components)
- [ ] Sprint 3: Operator Dashboard (All Operator Components)
- [ ] Sprint 4: Carrier Dashboard (All Carrier Components)
- [ ] Sprint 5: Chat & Notifications

### Overall Mock Data Removal Progress
```
[████████░░] 80% Complete

Completed:
✓ HourlyActivityChart (Operator)
✓ KpiCards (Admin)
✓ RecentBookings (Admin)
✓ BookingsChart (Admin)

In Progress:
⟳ OperatorKpiCards

Remaining:
○ CarrierKpiCards
○ CarrierBookingChart
○ ChatSessions
○ And 15 more...
```

---

## 🔍 Verification Checklist Before Finishing

### For Each Component Updated
- [ ] Removed all hardcoded mock data arrays
- [ ] Added `useEffect` to fetch from API
- [ ] Added proper loading state
- [ ] Added error handling
- [ ] Tested with real backend data
- [ ] Mobile responsive
- [ ] No console errors/warnings
- [ ] API call in Network tab shows correct URL and response

### Overall Application
- [ ] All pages load without errors
- [ ] No hardcoded test/demo data visible to users
- [ ] All role-based dashboards show correct data
- [ ] Pagination works where implemented
- [ ] Filtering/sorting works where implemented
- [ ] Error states display gracefully
- [ ] Loading states look good

---

## 📞 When Stuck

1. **API returns different format than expected?**
   - Print response in console: `console.log(response.data)`
   - Update component to match actual API response
   - OR update API documentation if backend doesn't match contract

2. **Component shows old data instead of new?**
   - Check useEffect dependencies
   - Add `setData([])` before fetch to clear old data
   - Verify API returns new data (check Network tab)

3. **Loading state never disappears?**
   - Check that `setLoading(false)` is called in finally block
   - Verify API is actually responding (check Network tab)
   - Look for uncaught errors in catch block

4. **CSRF token missing from request?**
   - Verify axios instance is imported from `@/services`
   - Check that request interceptor is running (Network tab → Headers)
   - Verify CSRF token was set from login response

---

## 🎉 Definition of Done

All mock data removal is complete when:

1. ✅ **Zero hardcoded arrays** of bookings, KPIs, chart data
2. ✅ **All components fetch from API** with proper loading/error states
3. ✅ **No demo emails** or test data visible in UI
4. ✅ **All endpoints tested** with real backend
5. ✅ **Error handling** for network failures
6. ✅ **Loading skeletons** show while fetching
7. ✅ **Pagination working** where applicable
8. ✅ **Role-based filtering** applied correctly
9. ✅ **No console errors** in browser DevTools
10. ✅ **Application ready** for production backend

---

## Code Review Template

When reviewing mock data removal PRs:

```
### Removes Mock Data
- [ ] All hardcoded arrays removed
- [ ] Demo data/test values removed
- [ ] Constants replaced with API calls

### API Integration
- [ ] Uses correct endpoint from API_DOCUMENTATION.md
- [ ] Request parameters match endpoint spec
- [ ] Response object parsed correctly
- [ ] CSRF token included (via axios interceptor)

### User Experience
- [ ] Loading state shows while fetching
- [ ] Error state displays on failure
- [ ] Empty state shows when no data
- [ ] Data updates when needed

### Code Quality
- [ ] No console.log() left in code
- [ ] useEffect dependencies correct
- [ ] No memory leaks (cleanup functions)
- [ ] Error messages user-friendly

### Testing
- [ ] Tested with real backend
- [ ] Network tab shows correct API calls
- [ ] Error states verified
- [ ] Mobile responsive
```
