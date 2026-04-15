export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  pendingEvents: number
  pendingReports: number
  pendingApprovals: number
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

export interface DashboardActionItem {
  id: string
  title: string
  description: string
  owner: string
  priority: "HIGH" | "MEDIUM" | "LOW"
  href: string
}

export interface DashboardFeedItem {
  id: string
  title: string
  category: string
  createdAt: string
  href: string
}

export interface DashboardHealthItem {
  id: string
  label: string
  value: string
  description: string
}

export interface DashboardData {
  targetDate: string
  stats: DashboardStats
  recentReports: RecentReport[]
  recentUsers: RecentUser[]
  actionItems: DashboardActionItem[]
  activityFeed: DashboardFeedItem[]
  contentHealth: DashboardHealthItem[]
}
