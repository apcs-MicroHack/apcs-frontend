// ...existing code moved to md/API_DOCUMENTATION.md
# ShipLink API Documentation

## 🌐 Base API Configuration

```
Base URL: http://localhost:8000/api
Protocol: HTTPS (production)
Content-Type: application/json
Authentication: JWT + CSRF Token
```

## 📋 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Booking Endpoints](#booking-endpoints)
3. [Terminal Endpoints](#terminal-endpoints)
4. [User Endpoints](#user-endpoints)
5. [Carrier Endpoints](#carrier-endpoints)
6. [Fleet Endpoints](#fleet-endpoints)
7. [Reports Endpoints](#reports-endpoints)
8. [Notifications Endpoints](#notifications-endpoints)

---

## 🔐 Authentication Endpoints

### POST `/auth/login`
**Description:** User login with email and password

**Request:**
```json
{
  "email": "admin@shiplink.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "csrfToken": "token-string-here",
  "user": {
    "id": "user-123",
    "email": "admin@shiplink.com",
    "role": "admin",
    "name": "Admin User"
  },
  "message": "Login successful"
}
```

**Errors:**
- `400` - Invalid credentials
- `401` - Unauthorized
- `422` - Validation error

---

### POST `/auth/logout`
**Description:** Logout user and invalidate session

**Headers Required:**
- `X-CSRF-Token`: CSRF token from login

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### GET `/auth/me`
**Description:** Get current authenticated user profile

**Headers Required:**
- `X-CSRF-Token`: CSRF token
- `Cookie`: Session cookie (HTTP-only)

**Response (200):**
```json
{
  "id": "user-123",
  "email": "admin@shiplink.com",
  "role": "admin",
  "name": "Admin User",
  "avatar_url": "https://...",
  "permissions": ["booking.view", "booking.create", "user.manage"]
}
```

---

### POST `/auth/forgot-password`
**Description:** Request password reset email

**Request:**
```json
{
  "email": "admin@shiplink.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### POST `/auth/reset-password`
**Description:** Reset password with token from email

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 📦 Booking Endpoints

### GET `/bookings`
**Description:** Get all bookings with optional filters

**Query Parameters:**
```
status?=pending&terminal_id?=terminal-1&start_date?=2026-02-01&end_date?=2026-02-28&page?=1&limit?=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-123",
      "bookingNumber": "BK-2026-0892",
      "carrierName": "MedTransport SA",
      "terminal": "Terminal A",
      "status": "approved",
      "appointmentTime": "2026-02-06T08:00:00Z",
      "containerType": "20ft",
      "containerNumber": "MEDUT1234567",
      "truckPlate": "00216-142-AB",
      "createdAt": "2026-02-06T07:00:00Z",
      "updatedAt": "2026-02-06T07:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

**Filters Available:**
- `status`: pending, approved, rejected, completed, cancelled
- `terminal_id`: terminal identifier
- `carrier_id`: carrier identifier
- `start_date`, `end_date`: ISO date format
- `page`, `limit`: pagination

---

### GET `/bookings/:id`
**Description:** Get single booking by ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking-123",
    "bookingNumber": "BK-2026-0892",
    "carrierId": "carrier-1",
    "carrierName": "MedTransport SA",
    "terminalId": "terminal-1",
    "terminal": "Terminal A",
    "status": "approved",
    "appointmentTime": "2026-02-06T08:00:00Z",
    "containerType": "20ft",
    "containerNumber": "MEDUT1234567",
    "containerWeight": 18.5,
    "truckPlate": "00216-142-AB",
    "driverId": "driver-1",
    "driverName": "Karim Bouzid",
    "driverPhone": "+213612345678",
    "notes": "Handle with care",
    "createdAt": "2026-02-06T07:00:00Z",
    "updatedAt": "2026-02-06T07:30:00Z"
  }
}
```

---

### POST `/bookings`
**Description:** Create a new booking

**Request:**
```json
{
  "carrierId": "carrier-1",
  "containerType": "20ft",
  "containerNumber": "MEDUT1234567",
  "containerWeight": 18.5,
  "terminalId": "terminal-1",
  "appointmentTime": "2026-02-10T10:00:00Z",
  "truckPlate": "00216-142-AB",
  "driverId": "driver-1",
  "notes": "Optional special instructions"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "booking-456",
    "bookingNumber": "BK-2026-0900",
    "status": "pending",
    "createdAt": "2026-02-06T10:00:00Z"
  },
  "message": "Booking created successfully"
}
```

---

### PATCH `/bookings/:id/status`
**Description:** Update booking status (admin/operator only)

**Request:**
```json
{
  "status": "approved",
  "notes": "Approved for processing",
  "rejectionReason": null
}
```

**Status Values:**
- `approved` - Approved for processing
- `rejected` - Rejected with reason
- `completed` - Completed successfully
- `cancelled` - Cancelled by user

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking-123",
    "status": "approved",
    "updatedAt": "2026-02-06T10:30:00Z"
  },
  "message": "Booking status updated"
}
```

---

### DELETE `/bookings/:id`
**Description:** Delete a booking (pending bookings only)

**Response (200):**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

---

### GET `/bookings/stats`
**Description:** Get booking statistics

**Query Parameters:**
```
start_date?=2026-02-01&end_date?=2026-02-28&terminal_id?=terminal-1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 156,
    "pending": 18,
    "approved": 112,
    "rejected": 6,
    "completed": 20,
    "avgProcessingTime": "4.2 minutes",
    "approvalRate": "93.6%",
    "byTerminal": {
      "terminal-1": { "total": 42, "approved": 39, "pending": 2, "rejected": 1 },
      "terminal-2": { "total": 38, "approved": 34, "pending": 3, "rejected": 1 }
    },
    "byCarrier": {
      "carrier-1": { "total": 28, "approved": 26, "pending": 1, "rejected": 1 },
      "carrier-2": { "total": 22, "approved": 20, "pending": 2, "rejected": 0 }
    },
    "timeline": [
      { "date": "2026-02-01", "total": 18, "approved": 15, "pending": 2, "rejected": 1 },
      { "date": "2026-02-02", "total": 22, "approved": 21, "pending": 1, "rejected": 0 }
    ]
  }
}
```

---

## 🏢 Terminal Endpoints

### GET `/terminals`
**Description:** Get all terminals

**Query Parameters:**
```
page?=1&limit?=20&status?=active
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "terminal-1",
      "name": "Terminal A",
      "location": "Algiers Port - North Dock",
      "capacity": 150,
      "currentUtilization": 78,
      "availableSlots": 33,
      "status": "active",
      "operatingHours": {
        "start": "06:00",
        "end": "22:00"
      },
      "equipment": ["Gantry Crane", "Reach Stacker", "Forklift"],
      "contactPerson": "Manager Name",
      "contactPhone": "+213612345678"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4
  }
}
```

---

### GET `/terminals/:id`
**Description:** Get terminal details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "terminal-1",
    "name": "Terminal A",
    "location": "Algiers Port - North Dock",
    "coordinates": {
      "lat": 36.7538,
      "lng": 3.0588
    },
    "capacity": 150,
    "currentUtilization": 78,
    "availableSlots": 33,
    "status": "active",
    "operatingHours": {
      "start": "06:00",
      "end": "22:00"
    },
    "equipment": ["Gantry Crane", "Reach Stacker", "Forklift"],
    "holidayClosures": ["2026-02-14"],
    "contactPerson": "Manager Name",
    "contactPhone": "+213612345678",
    "email": "terminal-a@shiplink.com"
  }
}
```

---

### GET `/terminals/:id/availability`
**Description:** Get terminal time slot availability

**Query Parameters:**
```
date?=2026-02-10&duration_hours?=1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "terminalId": "terminal-1",
    "date": "2026-02-10",
    "slots": [
      {
        "timeSlot": "06:00-07:00",
        "available": true,
        "remainingCapacity": 12,
        "bookings": 138
      },
      {
        "timeSlot": "07:00-08:00",
        "available": true,
        "remainingCapacity": 8,
        "bookings": 142
      },
      {
        "timeSlot": "08:00-09:00",
        "available": false,
        "remainingCapacity": 0,
        "bookings": 150
      }
    ]
  }
}
```

---

## 👥 User Endpoints

### GET `/users`
**Description:** Get all users (admin only)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-1",
      "email": "admin@shiplink.com",
      "name": "Admin User",
      "role": "admin",
      "status": "active",
      "lastLogin": "2026-02-06T10:00:00Z",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/users`
**Description:** Create new user (admin only)

**Request:**
```json
{
  "email": "newuser@shiplink.com",
  "name": "New User",
  "role": "operator",
  "password": "temporaryPassword123",
  "terminalIds": ["terminal-1", "terminal-2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user-2",
    "email": "newuser@shiplink.com",
    "message": "Temporary password sent to email"
  }
}
```

---

## 🚚 Carrier Endpoints

### GET `/carriers`
**Description:** Get all carriers

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "carrier-1",
      "name": "MedTransport SA",
      "licenseNumber": "LIC-2026-001",
      "status": "active",
      "totalBookings": 28,
      "completedBookings": 26,
      "approvalRate": 95.2,
      "contactPerson": "Karim Benali",
      "contactPhone": "+213612345678",
      "email": "karim@medtransport.com",
      "fleetSize": 8,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET `/carriers/:id`
**Description:** Get carrier details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "carrier-1",
    "name": "MedTransport SA",
    "licenseNumber": "LIC-2026-001",
    "licenseExpiryDate": "2027-12-31",
    "status": "active",
    "address": "123 Business St, Algiers",
    "phone": "+213612345678",
    "email": "karim@medtransport.com",
    "contactPerson": "Karim Benali",
    "totalBookings": 28,
    "completedBookings": 26,
    "rejectedBookings": 1,
    "approvalRate": 95.2,
    "averageProcessingTime": "4.2 minutes",
    "fleetSize": 8,
    "activeVehicles": 7,
    "statistics": {
      "thisMonth": { "bookings": 8, "completed": 7, "pending": 1 },
      "thisYear": { "bookings": 28, "completed": 26, "rejected": 1 }
    }
  }
}
```

---

## 🚛 Fleet Endpoints

### GET `/fleet`
**Description:** Get user's fleet vehicles (carrier users)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "vehicle-1",
      "plate": "00216-142-AB",
      "model": "Scania R450",
      "manufacturer": "Scania",
      "year": 2021,
      "color": "blue",
      "status": "active",
      "driver": {
        "id": "driver-1",
        "name": "Karim Bouzid",
        "phone": "+213612345678"
      },
      "totalBookings": 14,
      "currentBooking": "BK-2026-0892",
      "lastServiceDate": "2026-01-15",
      "nextServiceDate": "2026-03-15",
      "insuranceExpiry": "2026-12-31",
      "registrationExpiry": "2026-04-30"
    }
  ]
}
```

---

### GET `/fleet/:id`
**Description:** Get vehicle details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "vehicle-1",
    "plate": "00216-142-AB",
    "model": "Scania R450",
    "vin": "SAP6A3...",
    "year": 2021,
    "color": "blue",
    "status": "active",
    "capacity": 25000,
    "driver": {
      "id": "driver-1",
      "name": "Karim Bouzid",
      "phone": "+213612345678",
      "license": "DZA123456"
    },
    "maintenance": {
      "lastService": "2026-01-15",
      "nextService": "2026-03-15",
      "odometer": 245000
    },
    "documents": {
      "insuranceExpiry": "2026-12-31",
      "registrationExpiry": "2026-04-30",
      "emissionsCertificateExpiry": "2026-08-15"
    },
    "statistics": {
      "totalBookings": 14,
      "activeBookings": 1,
      "completedBookings": 13,
      "averageMonthlyDistance": 4200
    }
  }
}
```

---

## 📊 Reports Endpoints

### GET `/reports/admin`
**Description:** Get admin dashboard data

**Query Parameters:**
```
start_date?=2026-02-01&end_date?=2026-02-28
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalBookings": 1284,
      "activeCarriers": 156,
      "capacityUtilization": 78.4,
      "percentChanges": {
        "totalBookings": 12.5,
        "activeCarriers": 3.2,
        "capacityUtilization": 5.1
      }
    },
    "chartData": {
      "weeklyBookings": [
        { "day": "Mon", "approved": 42, "pending": 18, "rejected": 5 },
        { "day": "Tue", "approved": 38, "pending": 22, "rejected": 3 }
      ],
      "topCarriers": [
        { "name": "Carrier A", "bookings": 42 },
        { "name": "Carrier B", "bookings": 38 }
      ]
    }
  }
}
```

---

### GET `/reports/operator`
**Description:** Get operator dashboard data

**Response (200):**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "bookingsProcessed": 391,
      "approvalRate": 93.6,
      "percentChanges": {
        "bookingsProcessed": 18.2,
        "approvalRate": 2.1
      }
    },
    "chartData": {
      "hourlyActivity": [
        { "hour": "06", "approved": 10, "pending": 2, "rejected": 0 },
        { "hour": "07", "approved": 15, "pending": 3, "rejected": 1 }
      ],
      "topCarriers": [
        { "name": "Carrier A", "bookings": 42 }
      ]
    }
  }
}
```

---

### GET `/reports/carrier`
**Description:** Get carrier dashboard data

**Response (200):**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalBookings": 52,
      "completionRate": 95.2,
      "activeVehicles": "7/8",
      "percentChanges": {
        "totalBookings": 15.2,
        "completionRate": 2.1,
        "activeVehicles": 12.5
      }
    },
    "chartData": {
      "monthlyTrend": [
        { "month": "Sep", "bookings": 28 },
        { "month": "Oct", "bookings": 34 }
      ],
      "statusDistribution": [
        { "status": "Completed", "value": 38 },
        { "status": "Approved", "value": 8 }
      ]
    }
  }
}
```

---

## 🔔 Notifications Endpoints

### GET `/notifications`
**Description:** Get user notifications

**Query Parameters:**
```
unread?=true&limit?=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-1",
      "type": "booking_approved",
      "title": "Booking Approved",
      "message": "Your booking BK-2026-0892 has been approved",
      "bookingId": "booking-1",
      "read": false,
      "createdAt": "2026-02-06T10:00:00Z",
      "action": {
        "label": "View Booking",
        "url": "/carrier/bookings/booking-1"
      }
    }
  ],
  "unreadCount": 5
}
```

---

### PATCH `/notifications/:id/read`
**Description:** Mark notification as read

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### PATCH `/notifications/read-all`
**Description:** Mark all notifications as read

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 🌐 Common Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Error message 1", "Error message 2"]
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## 🔐 CSRF Token Handling

1. **Login** returns `csrfToken` in response
2. **Include token** in all subsequent requests with header: `X-CSRF-Token: {token}`
3. **Token refresh** - Backend can send new token in response header `X-CSRF-Token`
4. **On 403** - CSRF validation failed, user should re-login

---

## 🔒 Authentication Headers

All endpoints except `/auth/login` require:

```
Headers:
  X-CSRF-Token: {token from login}
  Cookie: {session cookie - set by browser automatically}
  Content-Type: application/json
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Pagination uses `page` (1-based) and `limit` parameters
- Status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 422 (Validation Error), 500 (Server Error)
- Rate limiting: 1000 requests per hour per IP
- All dates should be sent as ISO strings

---

## 🚀 Next Steps

1. Implement these endpoints on the backend
2. Update `.env.local` with your API URL
3. Test each endpoint with provided examples
4. Configure CORS on backend
5. Set up CSRF validation middleware
6. Enable HTTP-only cookies for sessions
7. Test with Postman/Insomnia before connecting frontend
