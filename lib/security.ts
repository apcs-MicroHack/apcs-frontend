// ─────────────────────────────────────────────────────────────
// Security Utilities - Input Validation, Sanitization, XSS Prevention
// ─────────────────────────────────────────────────────────────

// ── XSS Sanitization ─────────────────────────────────────────

/**
 * Sanitize string to prevent XSS attacks
 * Escapes HTML special characters
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  }
  return input.replace(/[&<>"'`=/]/g, (char) => map[char] || char)
}

/**
 * Strip all HTML tags from input
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "")
}

/**
 * Sanitize object values recursively
 */
export function sanitizeObject<T extends object>(obj: T): T {
  const sanitized = { ...obj } as Record<string, unknown>
  for (const key in sanitized) {
    const value = sanitized[key]
    if (typeof value === "string") {
      sanitized[key] = sanitizeHtml(value)
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as object)
    }
  }
  return sanitized as T
}

// ── Input Validation ─────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ValidationRule {
  test: (value: unknown) => boolean
  message: string
}

/**
 * Validate a value against multiple rules
 */
export function validate(value: unknown, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = []
  for (const rule of rules) {
    if (!rule.test(value)) {
      errors.push(rule.message)
    }
  }
  return { valid: errors.length === 0, errors }
}

// ── Common Validation Rules ──────────────────────────────────

export const rules = {
  required: (message = "This field is required"): ValidationRule => ({
    test: (v) => v != null && v !== "",
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (v) => typeof v === "string" && v.length >= min,
    message: message ?? `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (v) => typeof v === "string" && v.length <= max,
    message: message ?? `Must be at most ${max} characters`,
  }),

  email: (message = "Invalid email address"): ValidationRule => ({
    test: (v) =>
      typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message,
  }),

  phone: (message = "Invalid phone number"): ValidationRule => ({
    test: (v) =>
      typeof v === "string" && /^[+]?[\d\s-()]{10,20}$/.test(v),
    message,
  }),

  alphanumeric: (message = "Only letters and numbers allowed"): ValidationRule => ({
    test: (v) => typeof v === "string" && /^[a-zA-Z0-9]+$/.test(v),
    message,
  }),

  noScriptTags: (message = "Invalid characters detected"): ValidationRule => ({
    test: (v) =>
      typeof v === "string" &&
      !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(v) &&
      !/javascript:/gi.test(v) &&
      !/on\w+=/gi.test(v),
    message,
  }),

  noSqlInjection: (message = "Invalid characters detected"): ValidationRule => ({
    test: (v) =>
      typeof v === "string" &&
      !/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|EXECUTE)\b)/gi.test(v),
    message,
  }),

  password: (message?: string): ValidationRule => ({
    test: (v) =>
      typeof v === "string" &&
      v.length >= 8 &&
      /[A-Z]/.test(v) &&
      /[a-z]/.test(v) &&
      /\d/.test(v),
    message: message ?? "Password must be at least 8 characters with uppercase, lowercase, and number",
  }),

  plateNumber: (message = "Invalid plate number format"): ValidationRule => ({
    test: (v) =>
      typeof v === "string" && /^[A-Z0-9-]{4,15}$/i.test(v),
    message,
  }),

  containerNumber: (message = "Invalid container number format"): ValidationRule => ({
    test: (v) =>
      !v || (typeof v === "string" && /^[A-Z]{4}\d{7}$/i.test(v)),
    message,
  }),

  uuid: (message = "Invalid ID format"): ValidationRule => ({
    test: (v) =>
      typeof v === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
    message,
  }),
}

// ── Rate Limiting ────────────────────────────────────────────

interface RateLimitState {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitState>()

/**
 * Check if an action is rate limited
 * @returns true if action is allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const state = rateLimitStore.get(key)

  // Clean up expired entries
  if (state && now > state.resetTime) {
    rateLimitStore.delete(key)
  }

  const current = rateLimitStore.get(key)

  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxAttempts) {
    return false
  }

  current.count++
  return true
}

/**
 * Get remaining time until rate limit resets
 */
export function getRateLimitReset(key: string): number {
  const state = rateLimitStore.get(key)
  if (!state) return 0
  const remaining = state.resetTime - Date.now()
  return remaining > 0 ? remaining : 0
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key)
}

// ── Secure Random Generation ─────────────────────────────────

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureId(length: number = 32): string {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
  }
  // Fallback for non-browser environments
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")
}

// ── Content Security ─────────────────────────────────────────

/**
 * Check if URL is safe (same origin or allowed)
 */
export function isSafeUrl(url: string, allowedOrigins: string[] = []): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    
    // Same origin is always safe
    if (parsed.origin === window.location.origin) {
      return true
    }
    
    // Check against allowed origins
    return allowedOrigins.includes(parsed.origin)
  } catch {
    // Relative URLs are safe
    return url.startsWith("/") && !url.startsWith("//")
  }
}

/**
 * Sanitize redirect URL to prevent open redirect attacks
 */
export function sanitizeRedirectUrl(url: string, fallback: string = "/"): string {
  // Only allow relative URLs starting with /
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url
  }
  return fallback
}

// ── Data Masking ─────────────────────────────────────────────

/**
 * Mask email address for display
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!domain) return "***"
  const maskedLocal = local.length > 2 
    ? `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}`
    : "*".repeat(local.length)
  return `${maskedLocal}@${domain}`
}

/**
 * Mask phone number for display
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 4) return "****"
  return `${"*".repeat(digits.length - 4)}${digits.slice(-4)}`
}

// ── Form Security ────────────────────────────────────────────

/**
 * Create a secure form submission handler
 * Includes sanitization and basic validation
 */
export function createSecureFormHandler<T extends object>(
  handler: (data: T) => Promise<void>,
  options: {
    sanitize?: boolean
    rateLimit?: { key: string; max: number; windowMs: number }
  } = {}
): (data: T) => Promise<{ success: boolean; error?: string }> {
  return async (data: T) => {
    // Rate limiting
    if (options.rateLimit) {
      const { key, max, windowMs } = options.rateLimit
      if (!checkRateLimit(key, max, windowMs)) {
        const resetMs = getRateLimitReset(key)
        return {
          success: false,
          error: `Too many attempts. Please try again in ${Math.ceil(resetMs / 1000)} seconds.`,
        }
      }
    }

    // Sanitize if enabled
    const processedData = options.sanitize ? sanitizeObject(data) : data

    try {
      await handler(processedData)
      return { success: true }
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message ?? "An error occurred",
      }
    }
  }
}
