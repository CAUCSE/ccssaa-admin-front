import type {
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
} from "@/types/user"

// Mock 데이터 생성
const generateMockUsers = (): UserSummary[] => {
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
    const joinedDate = new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)

    return {
      id: String(i + 1),
      studentNo,
      name: names[Math.floor(Math.random() * names.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      status,
      academicStatus,
      joinedAt: joinedDate.toISOString(),
    }
  })
}

const mockUsers = generateMockUsers()

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
          user.studentNo.includes(keyword)
      )
    }

    // 학과 필터링
    if (params.department) {
      filteredUsers = filteredUsers.filter(
        (user) => user.department === params.department
      )
    }

    // 상태 필터링
    if (params.status && params.status !== "ALL") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === params.status
      )
    }

    // 학적 상태 필터링
    if (params.academicStatus && params.academicStatus !== "ALL") {
      filteredUsers = filteredUsers.filter(
        (user) => user.academicStatus === params.academicStatus
      )
    }

    // 정렬 (기본: 가입일 내림차순)
    filteredUsers.sort((a, b) => {
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    })

    // 페이지네이션
    const page = params.page || 0
    const size = params.size || 10
    const start = page * size
    const end = start + size
    const paginatedUsers = filteredUsers.slice(start, end)

    return {
      content: paginatedUsers,
      totalElements: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / size),
      size,
      number: page,
    }
  },

  // 회원 상세 조회
  getUserDetail: async (userId: string): Promise<UserDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      throw new Error("User not found")
    }

    // 상세 정보 생성 (서버 응답 형식에 맞게 변환)
    const roles = user.status === "ACTIVE" 
      ? (Math.random() > 0.8 ? ["ADMIN"] : ["COMMON"])
      : ["COMMON"]

    return {
      id: String(user.id),
      email: `${user.studentNo}@dongne.ac.kr`,
      name: user.name,
      studentId: user.studentNo,
      roles,
      profileImageUrl: null,
      state: user.status,
      nickname: user.name,
      major: user.department,
      department: user.department,
      academicStatus: user.academicStatus,
      phoneNumber: `010-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      rejectionOrDropReason: (user.status === "REJECT" || user.status === "DROP") 
        ? "재학 증빙 서류 미제출" 
        : null,
      createdAt: user.joinedAt,
    }
  },

  // 회원 승인
  approveUser: async (userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.status = "ACTIVE"
    }
  },

  // 회원 거부
  rejectUser: async (userId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.status = "REJECT"
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
      return {
        id: user.id,
        roles: [newRole],
      }
    }
    throw new Error("User not found")
  },
}

