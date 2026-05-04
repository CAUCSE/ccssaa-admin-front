import type {
  DeletedUserListParams,
  DeletedUserListResponse,
  DeletedUserListSortBy,
  DeletedUserSummary,
  UserSummary,
  UserDetail,
  UserListParams,
  UserListResponse,
  UserStatus,
  AcademicStatus,
  Department,
  UserDropResult,
  UserRole,
  UserRestoreResult,
  UserRoleUpdateResult,
  UserListSortBy,
} from "@/types/user"
import type { AdmissionSummary } from "@/types/admission"

/** 목록/상세 모의 API가 공유하는 회원 내부 상태 (invalidate·refetch 후에도 유지) */
type MockUser = Omit<UserSummary, "email" | "admissionYear"> & {
  roles: UserRole[]
  rejectionOrDropReason: string | null
  deletedAt: string | null
}

const DEFAULT_REJECTION_OR_DROP_REASON = "재학 증빙 서류 미제출"

const initialRolesForStatus = (status: UserStatus): UserRole[] => {
  if (status === "ACTIVE") {
    return Math.random() > 0.8 ? ["ADMIN"] : ["COMMON"]
  }
  return ["COMMON"]
}

const initialRejectionReasonForStatus = (status: UserStatus): string | null =>
  status === "REJECT" || status === "DROP" ? DEFAULT_REJECTION_OR_DROP_REASON : null

const toUserSummary = (u: MockUser): UserSummary => ({
  id: u.id,
  studentNo: u.studentNo,
  name: u.name,
  email: `${u.studentNo}@dongne.ac.kr`,
  admissionYear: Number(u.studentNo.slice(0, 4)),
  department: u.department,
  status: u.status,
  academicStatus: u.academicStatus,
  createdAt: u.createdAt,
})

const toDeletedUserSummary = (u: MockUser): DeletedUserSummary => ({
  id: u.id,
  name: u.name,
  email: `${u.studentNo}@dongne.ac.kr`,
  studentNo: u.studentNo,
  admissionYear: Number(u.studentNo.slice(0, 4)),
  department: u.department,
  userState: u.status,
  academicStatus: u.academicStatus,
  deletedAt: u.deletedAt ?? u.createdAt,
  dropReason: u.rejectionOrDropReason,
})

// Mock 데이터 생성
const generateMockUsers = (): MockUser[] => {
  const departments: Department[] = [
    "DEPT_OF_AI",
    "SCHOOL_OF_SW",
    "SCHOOL_OF_CSE",
    "DEPT_OF_CSE",
    "DEPT_OF_CS",
  ]
  const statuses: UserStatus[] = ["AWAIT", "ACTIVE", "DROP", "REJECT", "GUEST"]
  const academicStatuses: AcademicStatus[] = ["ENROLLED", "GRADUATED", "UNDETERMINED"]
  const names = [
    "김철수",
    "이영희",
    "박민수",
    "정수진",
    "최동현",
    "강미영",
    "윤성호",
    "임지은",
    "한동욱",
    "오세진",
  ]

  return Array.from({ length: 50 }, (_, i) => {
    const year = 2020 + Math.floor(Math.random() * 5)
    const studentNo = `${year}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const academicStatus = academicStatuses[Math.floor(Math.random() * academicStatuses.length)]
    const createdAt = new Date(
      2023 + Math.floor(Math.random() * 3),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
    const deletedAt =
      status === "DROP"
        ? new Date(
            createdAt.getTime() + (Math.floor(Math.random() * 200) + 1) * 86400000
          ).toISOString()
        : null

    return {
      id: String(i + 1),
      studentNo,
      name: names[Math.floor(Math.random() * names.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      status,
      academicStatus,
      createdAt: createdAt.toISOString(),
      roles: initialRolesForStatus(status),
      rejectionOrDropReason: initialRejectionReasonForStatus(status),
      deletedAt,
    }
  })
}

const mockUsers = generateMockUsers()

export function upsertMockUserFromAdmission(admission: AdmissionSummary) {
  const existingUser = mockUsers.find(
    (user) => user.studentNo === admission.requestedStudentId
  )

  if (existingUser) {
    existingUser.name = admission.userName
    existingUser.department = admission.requestedDepartment
    existingUser.academicStatus = admission.requestedAcademicStatus
    existingUser.status = "ACTIVE"
    existingUser.createdAt = admission.createdAt
    existingUser.deletedAt = null
    existingUser.rejectionOrDropReason = null
    return
  }

  mockUsers.unshift({
    id: `approved-${admission.id}`,
    studentNo: admission.requestedStudentId,
    name: admission.userName,
    department: admission.requestedDepartment,
    status: "ACTIVE",
    academicStatus: admission.requestedAcademicStatus,
    createdAt: admission.createdAt,
    roles: ["COMMON"],
    rejectionOrDropReason: null,
    deletedAt: null,
  })
}

function sortUsers(users: MockUser[], sortBy: UserListSortBy | undefined) {
  switch (sortBy) {
    case "CREATED_AT_ASC":
      return users.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case "NAME_ASC":
      return users.sort((a, b) => a.name.localeCompare(b.name, "ko-KR"))
    case "NAME_DSC":
      return users.sort((a, b) => b.name.localeCompare(a.name, "ko-KR"))
    case "STUDENT_ID_ASC":
      return users.sort((a, b) => a.studentNo.localeCompare(b.studentNo))
    case "CREATED_AT_DESC":
    default:
      return users.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }
}

function sortDeletedUsers(
  users: MockUser[],
  sortBy: DeletedUserListSortBy | undefined
) {
  switch (sortBy) {
    case "DELETED_AT_ASC":
      return users.sort(
        (a, b) =>
          new Date(a.deletedAt ?? a.createdAt).getTime() -
          new Date(b.deletedAt ?? b.createdAt).getTime()
      )
    case "NAME_ASC":
      return users.sort((a, b) => a.name.localeCompare(b.name, "ko-KR"))
    case "DELETED_AT_DESC":
    default:
      return users.sort(
        (a, b) =>
          new Date(b.deletedAt ?? b.createdAt).getTime() -
          new Date(a.deletedAt ?? a.createdAt).getTime()
      )
  }
}

// Mock API 함수들
export const mockUserApi = {
  // 회원 리스트 조회
  getUsers: async (params: UserListParams): Promise<UserListResponse> => {
    // 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredUsers = [...mockUsers]

    // 키워드 필터링
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(keyword) ||
          user.studentNo.includes(keyword) ||
          `${user.studentNo}@dongne.ac.kr`.toLowerCase().includes(keyword)
      )
    }

    // 학과 필터링
    if (params.department) {
      filteredUsers = filteredUsers.filter(
        (user) => user.department === params.department
      )
    }

    // 상태 필터링
    if (params.states?.length) {
      filteredUsers = filteredUsers.filter(
        (user) => params.states?.includes(user.status)
      )
    } else {
      filteredUsers = filteredUsers.filter((user) => user.status === "ACTIVE")
    }

    // 학적 상태 필터링
    if (params.academicStatus && params.academicStatus !== "ALL") {
      filteredUsers = filteredUsers.filter(
        (user) => user.academicStatus === params.academicStatus
      )
    }

    if (params.admissionYearFrom != null) {
      filteredUsers = filteredUsers.filter(
        (user) => Number(user.studentNo.slice(0, 4)) >= params.admissionYearFrom!
      )
    }

    if (params.admissionYearTo != null) {
      filteredUsers = filteredUsers.filter(
        (user) => Number(user.studentNo.slice(0, 4)) <= params.admissionYearTo!
      )
    }

    sortUsers(filteredUsers, params.sortBy)

    // 페이지네이션
    const page = params.page || 0
    const size = params.size || 10
    const start = page * size
    const end = start + size
    const paginatedUsers = filteredUsers.slice(start, end).map(toUserSummary)

    return {
      content: paginatedUsers,
      totalElements: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / size),
      size,
      currentPage: page,
      hasNext: end < filteredUsers.length,
      hasPrev: page > 0,
    }
  },

  getDeletedUsers: async (
    params: DeletedUserListParams
  ): Promise<DeletedUserListResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    let filteredUsers = mockUsers.filter((user) => user.deletedAt != null)

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(keyword) ||
          user.studentNo.includes(keyword) ||
          `${user.studentNo}@dongne.ac.kr`.toLowerCase().includes(keyword)
      )
    }

    if (params.department) {
      filteredUsers = filteredUsers.filter(
        (user) => user.department === params.department
      )
    }

    if (params.academicStatus && params.academicStatus !== "ALL") {
      filteredUsers = filteredUsers.filter(
        (user) => user.academicStatus === params.academicStatus
      )
    }

    if (params.admissionYearFrom != null) {
      filteredUsers = filteredUsers.filter(
        (user) => Number(user.studentNo.slice(0, 4)) >= params.admissionYearFrom!
      )
    }

    if (params.admissionYearTo != null) {
      filteredUsers = filteredUsers.filter(
        (user) => Number(user.studentNo.slice(0, 4)) <= params.admissionYearTo!
      )
    }

    sortDeletedUsers(filteredUsers, params.sortBy)

    const page = params.page || 0
    const size = params.size || 10
    const start = page * size
    const end = start + size

    return {
      content: filteredUsers.slice(start, end).map(toDeletedUserSummary),
      totalElements: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / size),
      size,
      currentPage: page,
      hasNext: end < filteredUsers.length,
      hasPrev: page > 0,
    }
  },

  // 회원 상세 조회
  getUserDetail: async (userId: string): Promise<UserDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      throw new Error("User not found")
    }

    return {
      id: String(user.id),
      email: `${user.studentNo}@dongne.ac.kr`,
      name: user.name,
      studentId: user.studentNo,
      roles: user.roles,
      profileImageUrl: null,
      state: user.status,
      nickname: user.name,
      major: user.department,
      department: user.department,
      academicStatus: user.academicStatus,
      phoneNumber: `010-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      rejectionOrDropReason: user.rejectionOrDropReason,
      createdAt: user.createdAt,
    }
  },

  // 회원 승인
  approveUser: async (userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.status = "ACTIVE"
      user.roles = ["COMMON"]
      user.rejectionOrDropReason = null
      user.deletedAt = null
    }
  },

  // 회원 거부
  rejectUser: async (userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.status = "REJECT"
      user.rejectionOrDropReason = DEFAULT_REJECTION_OR_DROP_REASON
    }
  },

  // 회원 추방
  banUser: async ({
    userId,
    dropReason,
  }: {
    userId: string
    dropReason: string
  }): Promise<UserDropResult> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.status = "DROP"
      user.roles = ["NONE"]
      user.rejectionOrDropReason = dropReason
      user.deletedAt = new Date().toISOString()
      return {
        id: user.id,
        state: "DROP",
        roles: ["NONE"],
        dropReason,
      }
    }
    throw new Error("User not found")
  },

  // 추방 사용자 복구
  restoreUser: async (userId: string): Promise<UserRestoreResult> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.status = "ACTIVE"
      user.roles = ["COMMON"]
      user.rejectionOrDropReason = null
      user.deletedAt = null
      return {
        id: user.id,
        state: "ACTIVE",
        roles: ["COMMON"],
      }
    }
    throw new Error("User not found")
  },

  // 역할 변경
  updateUserRole: async (
    userId: string,
    _currentRole: UserRole,
    newRole: UserRole
  ): Promise<UserRoleUpdateResult> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.roles = [newRole]
      return {
        id: user.id,
        roles: [newRole],
      }
    }
    throw new Error("User not found")
  },
}
