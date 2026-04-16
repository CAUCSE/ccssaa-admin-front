import type {
  DashboardActionItem,
  DashboardData,
  DashboardFeedItem,
  DashboardHealthItem,
  DashboardStats,
  RecentReport,
  RecentUser,
} from "@/types/dashboard"

const MOCK_STATS: DashboardStats = {
  totalUsers: 28377171,
  newUsersToday: 42,
  pendingEvents: 5,
  pendingReports: 7,
  pendingApprovals: 14,
}

const MOCK_RECENT_USERS: RecentUser[] = [
  {
    id: 101,
    studentNo: "20231234",
    name: "김민준",
    department: "소프트웨어학부",
    joinedAt: "2026-04-10T08:30:00+09:00",
    status: "ACTIVE",
  },
  {
    id: 102,
    studentNo: "20224567",
    name: "박서연",
    department: "컴퓨터공학부",
    joinedAt: "2026-04-10T08:05:00+09:00",
    status: "PENDING",
  },
  {
    id: 103,
    studentNo: "20219876",
    name: "이도윤",
    department: "전자공학부",
    joinedAt: "2026-04-09T17:20:00+09:00",
    status: "ACTIVE",
  },
  {
    id: 104,
    studentNo: "20235678",
    name: "정하은",
    department: "기계공학부",
    joinedAt: "2026-04-09T15:40:00+09:00",
    status: "PENDING",
  },
]

const MOCK_RECENT_REPORTS: RecentReport[] = [
  {
    id: 201,
    target: "게시글",
    reason: "광고성 게시물 반복 등록",
    reporter: "20201234",
    createdAt: "2026-04-10T09:15:00+09:00",
    status: "UNRESOLVED",
  },
  {
    id: 202,
    target: "댓글",
    reason: "욕설 및 비하 표현",
    reporter: "익명",
    createdAt: "2026-04-10T08:10:00+09:00",
    status: "UNRESOLVED",
  },
  {
    id: 203,
    target: "유저",
    reason: "허위 정보 유포",
    reporter: "20219876",
    createdAt: "2026-04-09T18:45:00+09:00",
    status: "RESOLVED",
  },
  {
    id: 204,
    target: "게시글",
    reason: "개인정보 노출 가능성",
    reporter: "20224567",
    createdAt: "2026-04-09T14:35:00+09:00",
    status: "UNRESOLVED",
  },
]

const MOCK_ACTION_ITEMS: DashboardActionItem[] = [
  {
    id: "approval-queue",
    title: "승인 대기 요청 검토",
    description: "학적 인증이 완료된 회원부터 우선 승인 처리",
    owner: "회원 관리",
    priority: "HIGH",
    href: "/users/pending",
  },
  {
    id: "report-review",
    title: "미처리 신고 7건 확인",
    description: "게시글 신고 4건, 댓글 신고 2건, 유저 신고 1건",
    owner: "신고 관리",
    priority: "HIGH",
    href: "/reports",
  },
  {
    id: "ceremony-review",
    title: "경조사 신청 서류 확인",
    description: "증빙 누락 신청 2건 우선 점검",
    owner: "경조사",
    priority: "MEDIUM",
    href: "/events",
  },
]

const MOCK_ACTIVITY_FEED: DashboardFeedItem[] = [
  {
    id: "feed-1",
    title: "학생회 공지 게시판에 학기 일정 안내가 등록되었습니다.",
    category: "공지",
    createdAt: "2026-04-10T09:00:00+09:00",
    href: "/content",
  },
  {
    id: "feed-2",
    title: "사물함 정책 수정 요청이 접수되었습니다.",
    category: "사물함",
    createdAt: "2026-04-10T08:20:00+09:00",
    href: "/lockers/policies",
  },
  {
    id: "feed-3",
    title: "캘린더에 행사 일정 3건이 추가되었습니다.",
    category: "캘린더",
    createdAt: "2026-04-09T17:10:00+09:00",
    href: "/calendar",
  },
  {
    id: "feed-4",
    title: "게시판 관리 화면에서 게시판 순서 변경이 완료되었습니다.",
    category: "게시판",
    createdAt: "2026-04-09T14:00:00+09:00",
    href: "/content/boards",
  },
]

const MOCK_CONTENT_HEALTH: DashboardHealthItem[] = [
  {
    id: "health-1",
    label: "오늘 게시글 등록",
    value: "18건",
    description: "전일 대비 12% 증가",
  },
  {
    id: "health-2",
    label: "검토 필요 게시물",
    value: "6건",
    description: "자동 필터 감지 기준",
  },
  {
    id: "health-3",
    label: "이번 주 공지 발행",
    value: "4건",
    description: "학생회 2건, 학부 2건",
  },
]

export function buildMockDashboardData(targetDate: string): DashboardData {
  return {
    targetDate,
    stats: MOCK_STATS,
    recentReports: MOCK_RECENT_REPORTS,
    recentUsers: MOCK_RECENT_USERS,
    actionItems: MOCK_ACTION_ITEMS,
    activityFeed: MOCK_ACTIVITY_FEED,
    contentHealth: MOCK_CONTENT_HEALTH,
  }
}

export const mockDashboardApi = {
  getDashboardData: async (targetDate: string): Promise<DashboardData> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return buildMockDashboardData(targetDate)
  },
}
