import type {
  LockerPolicy,
  LockerPolicyFormData,
  LockerPolicyListResponse,
  LockerPolicyStatus,
} from "@/types/locker-policy"

let nextId = 1
const policies: LockerPolicy[] = []

function toPolicy(row: LockerPolicyFormData & { id: number; status: LockerPolicyStatus; createdAt: string }): LockerPolicy {
  return {
    id: row.id,
    version: row.version,
    applyStartAt: row.applyStartAt,
    applyEndAt: row.applyEndAt,
    applyExpiredAt: row.applyExpiredAt,
    extendStartAt: row.extendStartAt,
    extendEndAt: row.extendEndAt,
    extendExpiredAt: row.extendExpiredAt,
    status: row.status,
    createdAt: row.createdAt,
  }
}

export const mockLockerPolicyApi = {
  getList: async (): Promise<LockerPolicyListResponse> => {
    await new Promise((r) => setTimeout(r, 200))
    const sorted = [...policies].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return {
      content: sorted,
      totalElements: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / 10)),
      size: 10,
      number: 0,
    }
  },

  getById: async (id: number): Promise<LockerPolicy | null> => {
    await new Promise((r) => setTimeout(r, 150))
    return policies.find((p) => p.id === id) ?? null
  },

  create: async (data: LockerPolicyFormData): Promise<LockerPolicy> => {
    await new Promise((r) => setTimeout(r, 300))
    const duplicate = policies.some((p) => p.version === data.version.trim())
    if (duplicate) {
      const err = new Error("이미 존재하는 version입니다.") as Error & { response?: { status: number } }
      err.response = { status: 400 }
      throw err
    }
    const id = nextId++
    const policy: LockerPolicy = toPolicy({
      ...data,
      id,
      status: "INACTIVE",
      createdAt: new Date().toISOString(),
    })
    policies.push(policy)
    return policy
  },

  update: async (id: number, data: LockerPolicyFormData): Promise<LockerPolicy> => {
    await new Promise((r) => setTimeout(r, 300))
    const index = policies.findIndex((p) => p.id === id)
    if (index === -1) {
      const err = new Error("정책을 찾을 수 없습니다.") as Error & { response?: { status: number } }
      err.response = { status: 404 }
      throw err
    }
    const duplicate = policies.some((p) => p.id !== id && p.version === data.version.trim())
    if (duplicate) {
      const err = new Error("이미 존재하는 version입니다.") as Error & { response?: { status: number } }
      err.response = { status: 400 }
      throw err
    }
    const existing = policies[index]
    const updated: LockerPolicy = toPolicy({
      ...data,
      id,
      status: existing.status,
      createdAt: existing.createdAt,
    })
    policies[index] = updated
    return updated
  },

  activate: async (id: number): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300))
    const policy = policies.find((p) => p.id === id)
    if (!policy) {
      const err = new Error("정책을 찾을 수 없습니다.") as Error & { response?: { status: number } }
      err.response = { status: 404 }
      throw err
    }
    policies.forEach((p) => {
      (p as { status: LockerPolicyStatus }).status = p.id === id ? "ACTIVE" : "INACTIVE"
    })
  },
}
