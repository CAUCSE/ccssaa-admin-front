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
    actor: { userId: "admin-1", email: "admin@causw.net", name: "관리자", studentId: "20190001" },
    target: { type: "USER", id: "user-1", email: "student1@causw.net", name: "홍길동", studentId: "20201234" },
    summary: "홍길동 사용자를 추방했습니다.",
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
    actor: { userId: "admin-2", email: "president@causw.net", name: "학생회장", studentId: "20180001" },
    target: { type: "USER", id: "user-2", email: "student2@causw.net", name: "김민수", studentId: "20211234" },
    summary: "김민수 사용자를 복구했습니다.",
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
    actor: { userId: "admin-1", email: "admin@causw.net", name: "관리자", studentId: "20190001" },
    target: { type: "USER", id: "user-3", email: "leader@causw.net", name: "이서연", studentId: "20221234" },
    summary: "이서연 사용자의 권한을 변경했습니다.",
    metadata: {
      beforeState: "ACTIVE",
      afterState: "ACTIVE",
      beforeRoles: "COMMON",
      afterRoles: "COMMON,ADMIN",
    },
    createdAt: "2026-06-11T09:05:00",
  },
  {
    id: "audit-4",
    category: "LOCKER",
    actionType: "ASSIGN",
    actionDescription: "사물함 배정",
    actor: { userId: "admin-1", email: "admin@causw.net", name: "관리자", studentId: "20190001" },
    target: { type: "LOCKER", id: "locker-12", email: "student4@causw.net", name: "박지훈", studentId: "20231234" },
    summary: "310관-12 사물함을 박지훈에게 배정했습니다.",
    metadata: {
      lockerId: "locker-12",
      lockerNumber: 12,
      lockerLocationName: "310관",
      expireDate: "2026-12-31T23:59:59",
      expiredAt: "2026-12-31T23:59:59",
    },
    createdAt: "2026-06-14T13:20:00",
  },
  {
    id: "audit-5",
    category: "LOCKER",
    actionType: "DISABLE",
    actionDescription: "사물함 비활성화",
    actor: { userId: "admin-2", email: "president@causw.net", name: "학생회장", studentId: "20180001" },
    target: { type: "LOCKER", id: "locker-18", email: null, name: null, studentId: null },
    summary: "310관-18 사물함을 비활성화했습니다.",
    metadata: {
      lockerId: "locker-18",
      lockerNumber: 18,
      lockerLocationName: "310관",
      expireDate: "2026-08-31T23:59:59",
      releasedUserId: "user-5",
    },
    createdAt: "2026-06-10T16:45:00",
  },
  {
    id: "audit-6",
    category: "ACADEMIC",
    actionType: "ADMISSION_REJECT",
    actionDescription: "재학 인증 거절",
    actor: { userId: "admin-3", email: "academic@causw.net", name: "학적 관리자", studentId: null },
    target: { type: "USER", id: "user-6", email: "freshman@causw.net", name: "최유진", studentId: "20261234" },
    summary: "최유진 사용자의 재학 인증을 거절했습니다.",
    metadata: {
      admissionId: "admission-6",
      requestedAcademicStatus: "ENROLLED",
      requestedStudentId: "20261234",
      requestedAdmissionYear: 2026,
      requestedDepartment: "소프트웨어학부",
      requestedGraduationYear: 2030,
      rejectReason: "증빙 자료가 식별되지 않습니다.",
    },
    createdAt: "2026-06-09T11:10:00",
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
      const searchable = [
        log.actor.email,
        log.actor.name,
        log.actor.studentId,
        log.target.email,
        log.target.name,
        log.target.studentId,
      ]
      if (
        keyword &&
        !searchable.some((value) => value?.toLowerCase().includes(keyword))
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
