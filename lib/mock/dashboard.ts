import type {
  DashboardData,
  DashboardStats,
  RecentReport,
  RecentUser,
  PendingApproval,
  RecentEvent,
  RecentPost,
} from "@/types/dashboard"

// Mock 데이터 생성 헬퍼 함수들
const generateMockStats = (): DashboardStats => {
  return {
    totalUsers: 1250,
    newUsersToday: 5,
    pendingReports: 3,
    pendingEvents: 2,
    activeStudents: 850,
    pendingApprovals: 12,
    studentCouncilNotices: 15,
    cultureNotices: 8,
    alumniCount: 400,
    pendingEventApplications: 2,
    newPostsToday: 5,
    departmentNotices: 3,
  }
}

const generateMockRecentReports = (): RecentReport[] => {
  const reasons = [
    "욕설 및 비하 발언",
    "스팸 게시글",
    "부적절한 콘텐츠",
    "개인정보 유출",
    "허위 정보 유포",
  ]
  const targets = ["게시글", "댓글", "유저"]
  const reporters = ["익명", "20201234", "20212345", "20223456"]

  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    target: targets[Math.floor(Math.random() * targets.length)],
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    reporter: reporters[Math.floor(Math.random() * reporters.length)],
    createdAt: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: Math.random() > 0.3 ? "UNRESOLVED" : "RESOLVED",
  }))
}

const generateMockRecentUsers = (): RecentUser[] => {
  const departments = [
    "소프트웨어학부",
    "컴퓨터공학부",
    "전자공학부",
    "기계공학부",
    "화학공학부",
  ]
  const names = [
    "김철수",
    "이영희",
    "박민수",
    "정수진",
    "최동현",
    "강미영",
    "윤성호",
    "임지은",
  ]

  return Array.from({ length: 5 }, (_, i) => {
    const year = 2020 + Math.floor(Math.random() * 5)
    const studentNo = `${year}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`

    return {
      id: i + 1,
      studentNo,
      name: names[Math.floor(Math.random() * names.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      joinedAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: Math.random() > 0.5 ? "ACTIVE" : "PENDING",
    }
  })
}

const generateMockPendingApprovals = (): PendingApproval[] => {
  const departments = [
    "소프트웨어학부",
    "컴퓨터공학부",
    "전자공학부",
    "기계공학부",
  ]
  const names = [
    "김철수",
    "이영희",
    "박민수",
    "정수진",
    "최동현",
    "강미영",
  ]

  return Array.from({ length: 5 }, (_, i) => {
    const year = 2020 + Math.floor(Math.random() * 5)
    const studentNo = `${year}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`

    return {
      id: i + 1,
      studentNo,
      name: names[Math.floor(Math.random() * names.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      joinedAt: new Date(
        Date.now() - (i + 1) * 2 * 24 * 60 * 60 * 1000
      ).toISOString(), // 오래된 순으로 정렬
    }
  })
}

const generateMockRecentEvents = (): RecentEvent[] => {
  const applicants = ["박지성", "이영수", "김민호", "정수진", "최동현"]
  const applicantNos = ["20180001", "20190012", "20200023", "20210034", "20220045"]

  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    applicant: applicants[Math.floor(Math.random() * applicants.length)],
    applicantNo: applicantNos[Math.floor(Math.random() * applicantNos.length)],
    type: Math.random() > 0.5 ? "MARRIAGE" : "DEATH",
    eventDate: new Date(
      Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    status: Math.random() > 0.5 ? "PENDING" : Math.random() > 0.5 ? "APPROVED" : "REJECTED",
  }))
}

const generateMockRecentPosts = (): RecentPost[] => {
  const boards = ["학생회 공지", "문화부 공지", "동문 게시판", "학부 공지"]
  const authors = ["학생회장", "문화부장", "동문회장", "학부장"]
  const titles = [
    "2025년 1학기 개강총회 안내",
    "문화행사 일정 공지",
    "동문 모임 안내",
    "졸업생 취업 현황 공유",
    "새로운 동문 소식",
  ]

  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: titles[Math.floor(Math.random() * titles.length)],
    author: authors[Math.floor(Math.random() * authors.length)],
    board: boards[Math.floor(Math.random() * boards.length)],
    createdAt: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
  }))
}

// Mock API 함수
export const mockDashboardApi = {
  // 대시보드 데이터 조회
  getDashboardData: async (): Promise<DashboardData> => {
    // 지연 시뮬레이션 (300-500ms)
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 200)
    )

    const stats = generateMockStats()

    // 역할별로 다른 데이터 반환 (현재는 Master 기준)
    // TODO: 실제 역할 정보를 받아서 역할별 데이터 반환
    return {
      stats,
      recentReports: generateMockRecentReports(),
      recentUsers: generateMockRecentUsers(),
      pendingApprovals: generateMockPendingApprovals(),
      recentEvents: generateMockRecentEvents(),
      recentPosts: generateMockRecentPosts(),
    }
  },
}

