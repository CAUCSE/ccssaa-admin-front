import type { Role, Permission, Banner, DesignSettings } from "@/types/settings"

// Mock 역할 데이터
const mockRoles: Role[] = [
  {
    id: 1,
    name: "Master",
    description: "시스템 전체 관리 권한",
    permissions: ["*"],
    userCount: 1,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "학생회장",
    description: "학생회 관련 관리 권한",
    permissions: ["users:read", "users:approve", "posts:read", "posts:write"],
    userCount: 2,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "크자회장",
    description: "경조사 관리 권한",
    permissions: ["events:read", "events:approve"],
    userCount: 1,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

// Mock 권한 데이터
const mockPermissions: Permission[] = [
  { id: "users:read", name: "회원 조회", description: "회원 목록 및 상세 조회", category: "회원 관리" },
  { id: "users:approve", name: "회원 승인", description: "회원 가입 승인/거부", category: "회원 관리" },
  { id: "users:ban", name: "회원 추방", description: "회원 강제 추방", category: "회원 관리" },
  { id: "posts:read", name: "게시글 조회", description: "게시글 목록 및 상세 조회", category: "게시판 관리" },
  { id: "posts:write", name: "게시글 작성", description: "게시글 작성 및 수정", category: "게시판 관리" },
  { id: "posts:delete", name: "게시글 삭제", description: "게시글 삭제", category: "게시판 관리" },
  { id: "events:read", name: "경조사 조회", description: "경조사 목록 및 상세 조회", category: "경조사 관리" },
  { id: "events:approve", name: "경조사 승인", description: "경조사 승인/거부", category: "경조사 관리" },
  { id: "reports:read", name: "신고 조회", description: "신고 목록 및 상세 조회", category: "신고 관리" },
  { id: "reports:process", name: "신고 처리", description: "신고 반려/승인 처리", category: "신고 관리" },
]

// Mock 배너 데이터
const mockBanners: Banner[] = [
  {
    id: 1,
    title: "2025년 신년 인사",
    imageUrl: "/banners/new-year-2025.jpg",
    linkUrl: "/posts/123",
    order: 1,
    isActive: true,
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2025-01-31T23:59:59Z",
    createdAt: "2024-12-20T00:00:00Z",
  },
  {
    id: 2,
    title: "학생회 모집 공고",
    imageUrl: "/banners/student-council.jpg",
    order: 2,
    isActive: true,
    createdAt: "2024-12-15T00:00:00Z",
  },
]

// Mock 디자인 설정
const mockDesignSettings: DesignSettings = {
  primaryColor: "#3b82f6",
  secondaryColor: "#8b5cf6",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
}

// Mock API 함수들
export const mockSettingsApi = {
  // 역할 목록 조회
  getRoles: async (): Promise<Role[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockRoles
  },

  // 역할 생성
  createRole: async (data: { name: string; description: string; permissions: string[] }): Promise<Role> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newRole: Role = {
      id: mockRoles.length + 1,
      ...data,
      userCount: 0,
      createdAt: new Date().toISOString(),
    }
    mockRoles.push(newRole)
    return newRole
  },

  // 역할 수정
  updateRole: async (
    roleId: number,
    data: { name: string; description: string; permissions: string[] }
  ): Promise<Role> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const role = mockRoles.find((r) => r.id === roleId)
    if (!role) {
      throw new Error("역할을 찾을 수 없습니다.")
    }
    Object.assign(role, data)
    return role
  },

  // 역할 삭제
  deleteRole: async (roleId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockRoles.findIndex((r) => r.id === roleId)
    if (index === -1) {
      throw new Error("역할을 찾을 수 없습니다.")
    }
    mockRoles.splice(index, 1)
  },

  // 권한 목록 조회
  getPermissions: async (): Promise<Permission[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockPermissions
  },

  // 배너 목록 조회
  getBanners: async (): Promise<Banner[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockBanners
  },

  // 배너 생성
  createBanner: async (data: Omit<Banner, "id" | "createdAt">): Promise<Banner> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newBanner: Banner = {
      id: mockBanners.length + 1,
      ...data,
      createdAt: new Date().toISOString(),
    }
    mockBanners.push(newBanner)
    return newBanner
  },

  // 배너 수정
  updateBanner: async (bannerId: number, data: Partial<Banner>): Promise<Banner> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const banner = mockBanners.find((b) => b.id === bannerId)
    if (!banner) {
      throw new Error("배너를 찾을 수 없습니다.")
    }
    Object.assign(banner, data)
    return banner
  },

  // 배너 삭제
  deleteBanner: async (bannerId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockBanners.findIndex((b) => b.id === bannerId)
    if (index === -1) {
      throw new Error("배너를 찾을 수 없습니다.")
    }
    mockBanners.splice(index, 1)
  },

  // 디자인 설정 조회
  getDesignSettings: async (): Promise<DesignSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockDesignSettings
  },

  // 디자인 설정 업데이트
  updateDesignSettings: async (data: Partial<DesignSettings>): Promise<DesignSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    Object.assign(mockDesignSettings, data)
    return mockDesignSettings
  },
}

