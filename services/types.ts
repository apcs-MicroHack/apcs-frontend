// ─────────────────────────────────────────────────────────────
// Shared TypeScript types — aligned with the Prisma backend
// ─────────────────────────────────────────────────────────────

// ── Enums (match backend exactly) ────────────────────────────

export type Role = "ADMIN" | "OPERATOR" | "CARRIER"

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CONSUMED"
  | "CANCELLED"
  | "EXPIRED"

export type CargoType = "IMPORT" | "EXPORT" | "EMPTY_RETURN" | "TRANSSHIPMENT"

export type TruckType =
  | "FLATBED"
  | "CONTAINER_CHASSIS"
  | "REFRIGERATED"
  | "TANKER"
  | "OTHER"

export type TerminalType = "IMPORT" | "EXPORT" | "REFRIGERATED" | "MIXED"

export type NotificationType =
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_REJECTED"
  | "BOOKING_CANCELLED"
  | "BOOKING_REMINDER"
  | "CAPACITY_WARNING"
  | "CAPACITY_FULL"
  | "SYSTEM_ALERT"

// ── User / Auth ──────────────────────────────────────────────

export interface OperatorTerminalAssignment {
  id: string
  terminalId: string
  terminal: {
    id: string
    name: string
    code: string
    type: TerminalType
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: Role
  isActive: boolean
  mustChangePassword: boolean
  is2FAEnabled: boolean
  createdAt: string
  updatedAt: string
  carrier?: CarrierBrief | null
  // Backend returns singular terminal for operators
  terminal?: {
    id: string
    name: string
    code: string
    type: TerminalType
    isActive?: boolean
  } | null
  terminalAssignedAt?: string | null
  // Also support array format if backend ever changes
  operatorTerminals?: OperatorTerminalAssignment[]
}

export interface CarrierBrief {
  id: string
  name?: string
  companyName?: string
}

export interface LoginResponse {
  message: string
  csrfToken: string
  user: User
}

export interface OtpRequiredResponse {
  message: string
  requires2FA: true
  userId: string
}

// ── Carrier ──────────────────────────────────────────────────

export interface Carrier {
  id: string
  companyName: string
  registrationNumber: string
  address: string | null
  contactEmail: string | null
  contactPhone: string | null
  isApproved: boolean
  createdAt: string
  updatedAt: string
  userId: string | null
  user?: { email: string; firstName: string; lastName: string }
}

// ── Terminal ─────────────────────────────────────────────────

export interface Terminal {
  id: string
  name: string
  code: string
  type: TerminalType
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ── Time Slot ────────────────────────────────────────────────

export interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  maxCapacity: number
  bookedCount: number
  isAvailable: boolean
  availableCapacity?: number
}

// ── Truck ────────────────────────────────────────────────────

export interface Truck {
  id: string
  plateNumber: string
  truckType: TruckType
  driverName: string | null
  driverPhone: string | null
  driverLicense: string | null
  isActive: boolean
  carrierId: string
  createdAt: string
  updatedAt: string
  carrier?: {
    id: string
    companyName: string
    user?: { email: string; firstName: string; lastName: string }
  }
  _count?: { bookings: number }
}

// ── Booking ──────────────────────────────────────────────────

export interface Booking {
  id: string
  bookingNumber: string
  status: BookingStatus
  cargoType: CargoType
  containerNumber: string | null
  isHazardous: boolean
  specialRequirements: string | null
  qrCode: string | null
  rejectionReason: string | null
  validatedAt: string | null
  validatedBy: string | null
  consumedAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
  carrierId: string
  terminalId: string
  timeSlotId: string
  truckId: string
  carrier: {
    companyName: string
    user: { email: string; phone: string | null }
  }
  terminal: {
    name: string
    code: string
    type: TerminalType
  }
  timeSlot: {
    date: string
    startTime: string
    endTime: string
  }
  truck: {
    plateNumber: string
    truckType: TruckType
    driverName: string | null
  }
}

export interface BookingDetail extends Booking {
  modifications: BookingModification[]
}

export interface BookingModification {
  id: string
  field: string
  oldValue: string | null
  newValue: string | null
  modifiedBy: string
  reason: string | null
  createdAt: string
}

// ── Notification ─────────────────────────────────────────────

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  readAt: string | null
  createdAt: string
  userId: string
  bookingId: string | null
  booking?: {
    bookingNumber: string
    status: BookingStatus
  } | null
}

// ── Chat ─────────────────────────────────────────────────────

export interface ChatSession {
  id: string
  threadId: string
  title: string | null
  createdAt: string
  updatedAt: string
  userId: string
}

// ── Pagination ───────────────────────────────────────────────

export interface OffsetPagination {
  total: number
  unread?: number
  limit: number
  offset: number
}

// ── Capacity ─────────────────────────────────────────────────

export interface CapacityForDate {
  isClosed: boolean
  closedReason?: string
  operatingStart: string
  operatingEnd: string
  slotDurationMin: number
  maxTrucksPerSlot: number
  source: "CLOSED_DATE" | "OVERRIDE" | "DEFAULT_CONFIG"
  sourceId?: string
  sourceLabel?: string
}

// ── Availability (from GET /slots/available) ─────────────────

export interface AvailabilitySlot {
  startTime: string
  endTime: string
  maxCapacity: number
  bookedCount: number
  availableCapacity: number
  isAvailable: boolean
}

export interface AvailabilityDay {
  date: string
  dayOfWeek: string
  isClosed: boolean
  closedReason: string | null
  operatingHours?: {
    start: string
    end: string
    slotDuration: number
    source: string
  }
  slots: AvailabilitySlot[]
}

export interface AvailabilityResponse {
  terminal: { id: string; name: string; code: string }
  dateRange: { start: string; end: string; days: number }
  availability: AvailabilityDay[]
}

// ── Capacity Override ────────────────────────────────────────

export interface CapacityOverrideDayConfig {
  id?: string
  dayOfWeek: string
  operatingStart: string
  operatingEnd: string
  slotDurationMin: number
  maxTrucksPerSlot: number
}

export interface CapacityOverride {
  id: string
  terminalId: string
  label: string
  startDate: string
  endDate: string
  timeStart: string | null
  timeEnd: string | null
  slotDurationMin: number | null
  maxTrucksPerSlot: number | null
  manualPriority: number
  dayCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  dayConfigs: CapacityOverrideDayConfig[]
}

export interface CreateCapacityOverridePayload {
  label: string
  startDate: string
  endDate: string
  manualPriority?: number
  timeStart?: string
  timeEnd?: string
  slotDurationMin?: number
  maxTrucksPerSlot?: number
  dayConfigs: Omit<CapacityOverrideDayConfig, "id">[]
}

