import api from "./axios"

export async function getAuditLogs(params?: Record<string, any>) {
  const { data } = await api.get("/audit", { params })
  return data
}

export async function getAuditLogById(id: string) {
  const { data } = await api.get(`/audit/${id}`)
  return data
}
