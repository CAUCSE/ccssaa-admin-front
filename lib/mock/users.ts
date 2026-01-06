import type {
  UserSummary,
  UserDetail,
  UserListParams,
  UserListResponse,
  UserStatus,
} from "@/types/user"

// Mock 데이터 생성
const generateMockUsers = (): UserSummary[] => {
  const departments = [
    "소프트웨어학부",
    "컴퓨터공학부",
    "전자공학부",
    "기계공학부",
    "화학공학부",
  ]
  const statuses: UserStatus[] = ["PENDING", "ACTIVE", "BANNED"]
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
    const joinedDate = new Date(2023 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)

    return {
      id: i + 1,
      studentNo,
      name: names[Math.floor(Math.random() * names.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      status,
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
    if (params.department && params.department !== "전체") {
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
  getUserDetail: async (userId: number): Promise<UserDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const user = mockUsers.find((u) => u.id === userId)
    if (!user) {
      throw new Error("User not found")
    }

    // 상세 정보 생성
    return {
      ...user,
      phone: `010-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
      email: `${user.studentNo}@dongne.ac.kr`,
      role: user.status === "ACTIVE" ? (Math.random() > 0.8 ? "ADMIN" : "USER") : "USER",
    }
  },

  // 회원 승인
  approveUser: async (userId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.status = "ACTIVE"
    }
  },

  // 회원 거부
  rejectUser: async (userId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.status = "BANNED"
    }
  },

  // 회원 추방
  banUser: async (userId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.status = "BANNED"
    }
  },

  // 역할 변경
  updateUserRole: async (
    userId: number,
    role: "USER" | "ADMIN" | "MASTER"
  ): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    // Mock에서는 상태만 변경 (실제로는 별도 저장 필요)
  },
}

