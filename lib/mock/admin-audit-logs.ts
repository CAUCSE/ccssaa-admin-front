import type {
  AdminAuditLog,
  AdminAuditLogListParams,
  AdminAuditLogListPayload,
} from "@/types/admin-audit-log"

const logs: AdminAuditLog[] = [
  {
    id: "audit-1",
    category: "USER",
    actionType: "DROP",
    actionDescription: "유저 추방",
    actor: { userId: "admin-1", email: "admin@causw.net" },
    target: { type: "USER", id: "user-1", email: "student1@causw.net" },
    summary: "admin@causw.net dropped user student1@causw.net",
    metadata: {
      beforeState: "ACTIVE",
      afterState: "DROP",
      beforeRoles: "COMMON",
      afterRoles: "COMMON",
      reason: "운영 정책 위반",
    },
    createdAt: "2026-06-13T10:30:00",
  },
  {
    id: "audit-2",
    category: "USER",
    actionType: "RESTORE",
    actionDescription: "추방 유저 복구",
    actor: { userId: "admin-2", email: "president@causw.net" },
    target: { type: "USER", id: "user-2", email: "student2@causw.net" },
    summary: "president@causw.net restored user student2@causw.net",
    metadata: {
      beforeState: "DROP",
      afterState: "ACTIVE",
      beforeRoles: "COMMON",
      afterRoles: "COMMON",
    },
    createdAt: "2026-06-12T14:15:00",
  },
  {
    id: "audit-3",
    category: "USER",
    actionType: "ROLE_CHANGE",
    actionDescription: "유저 역할 변경",
    actor: { userId: "admin-1", email: "admin@causw.net" },
    target: { type: "USER", id: "user-3", email: "leader@causw.net" },
    summary: "admin@causw.net changed roles for leader@causw.net",
    metadata: {
      beforeState: "ACTIVE",
      afterState: "ACTIVE",
      beforeRoles: "COMMON",
      afterRoles: "COMMON,ADMIN",
    },
    createdAt: "2026-06-11T09:05:00",
  },
]

export const mockAdminAuditLogApi = {
  getAuditLogs: async (
    params: AdminAuditLogListParams
  ): Promise<AdminAuditLogListPayload> => {
    await new Promise((resolve) => setTimeout(resolve, 250))

    const from = params.from ? new Date(params.from).getTime() : null
    const to = params.to ? new Date(params.to).getTime() : null
    const keyword = params.keyword?.trim().toLowerCase()
    const page = params.page ?? 0
    const size = params.size ?? 10

    let filtered = logs.filter((log) => {
      const createdAt = log.createdAt ? new Date(log.createdAt).getTime() : null
      if (from != null && createdAt != null && createdAt < from) return false
      if (to != null && createdAt != null && createdAt > to) return false
      if (params.category && log.category !== params.category) return false
      if (params.actionType && log.actionType !== params.actionType) return false
      if (
        keyword &&
        !log.actor.email.toLowerCase().includes(keyword) &&
        !log.target.email.toLowerCase().includes(keyword)
      ) {
        return false
      }
      return true
    })

    filtered = filtered.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })

    const start = page * size
    const content = filtered.slice(start, start + size)

    return {
      content,
      currentPage: page,
      size,
      totalPages: Math.ceil(filtered.length / size),
      totalElements: filtered.length,
      hasNext: start + size < filtered.length,
      hasPrev: page > 0,
    }
  },
}

