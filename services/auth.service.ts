import api, { setCsrfToken, clearCsrfToken } from "./axios"
import type { User, LoginResponse, OtpRequiredResponse } from "./types"

// ── Login ────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse | OtpRequiredResponse> {
  const { data } = await api.post("/auth/login", { email, password })

  // Normal login — store CSRF token & return user
  if (data.csrfToken) {
    setCsrfToken(data.csrfToken)
  }

  return data
}

// ── OTP verification (2FA) ───────────────────────────────────

export async function verifyOtp(
  userId: string,
  otp: string,
): Promise<LoginResponse> {
  const { data } = await api.post("/auth/verify-otp", { userId, otp })
  if (data.csrfToken) setCsrfToken(data.csrfToken)
  return data
}

// ── Token refresh ────────────────────────────────────────────

export async function refreshToken(): Promise<void> {
  const { data } = await api.post("/auth/refresh")
  if (data.csrfToken) setCsrfToken(data.csrfToken)
}

// ── Logout ───────────────────────────────────────────────────

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout")
  } finally {
    clearCsrfToken()
  }
}

// ── Profile ──────────────────────────────────────────────────

export async function getProfile(): Promise<User> {
  const { data } = await api.get("/auth/me")
  return data.user
}

// ── Password management ──────────────────────────────────────

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await api.post("/auth/change-password", { currentPassword, newPassword })
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email })
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  await api.post("/auth/reset-password", { token, newPassword })
}

// ── 2FA management ───────────────────────────────────────────

export async function enable2FA(): Promise<void> {
  await api.post("/auth/2fa/enable")
}

export async function disable2FA(otp: string): Promise<void> {
  await api.post("/auth/2fa/disable", { otp })
}
