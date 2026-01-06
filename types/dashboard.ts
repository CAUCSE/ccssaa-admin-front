export type UserRole = "MASTER" | "STUDENT_COUNCIL" | "ALUMNI_COUNCIL"

export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  pendingReports: number
  pendingEvents: number
  activeStudents: number
  pendingApprovals: number
  studentCouncilNotices: number
  cultureNotices: number
  alumniCount: number
  pendingEventApplications: number
  newPostsToday: number
  departmentNotices: number
}

export interface RecentReport {
  id: number
  target: string
  reason: string
  reporter: string
  createdAt: string
  status: "UNRESOLVED" | "RESOLVED"
}

export interface RecentUser {
  id: number
  studentNo: string
  name: string
  department: string
  joinedAt: string
  status: "PENDING" | "ACTIVE" | "BANNED"
}

export interface PendingApproval {
  id: number
  studentNo: string
  name: string
  department: string
  joinedAt: string
}

export interface RecentEvent {
  id: number
  applicant: string
  applicantNo: string
  type: "MARRIAGE" | "DEATH"
  eventDate: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export interface RecentPost {
  id: number
  title: string
  author: string
  board: string
  createdAt: string
}

export interface DashboardData {
  stats: DashboardStats
  recentReports?: RecentReport[]
  recentUsers?: RecentUser[]
  pendingApprovals?: PendingApproval[]
  recentEvents?: RecentEvent[]
  recentPosts?: RecentPost[]
}
