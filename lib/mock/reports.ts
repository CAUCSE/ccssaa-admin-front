import type {
  ReportedComment,
  ReportedCommentListResponse,
  ReportedPost,
  ReportedPostListResponse,
  ReportedUserContentParams,
  ReportedUserListParams,
  ReportedUserListResponse,
  ReportedUserSummary,
} from "@/types/report"
import type { AcademicStatus, UserStatus } from "@/types/user"

type MockReportedUser = ReportedUserSummary & {
  posts: ReportedPost[]
  comments: ReportedComment[]
}

const ACADEMIC_STATUSES: AcademicStatus[] = [
  "ENROLLED",
  "GRADUATED",
  "UNDETERMINED",
]

const USER_STATES: UserStatus[] = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "DROP"]

const POST_REASONS = [
  "낚시/놀람/도배",
  "욕설/비하",
  "광고/홍보",
  "허위 정보",
  "개인정보 노출",
]

const COMMENT_REASONS = [
  "욕설/비하",
  "도배",
  "분쟁 유도",
  "허위 사실",
  "부적절한 표현",
]

function createDate(offsetDays: number, offsetHours: number) {
  const date = new Date("2026-04-16T13:00:00.000Z")
  date.setUTCDate(date.getUTCDate() - offsetDays)
  date.setUTCHours(date.getUTCHours() - offsetHours)
  return date.toISOString()
}

function buildMockReportedUsers(): MockReportedUser[] {
  return Array.from({ length: 18 }, (_, index) => {
    const userNumber = index + 1
    const userId = `reported-user-${userNumber}`
    const studentId = `202${(index % 6) + 1}${String(1000 + userNumber).slice(-4)}`
    const name = `신고회원${userNumber}`
    const academicStatus = ACADEMIC_STATUSES[index % ACADEMIC_STATUSES.length]
    const userState = USER_STATES[index % USER_STATES.length]
    const posts = Array.from({ length: (index % 4) + 1 }, (_, postIndex) => ({
      reportId: `report-post-${userNumber}-${postIndex + 1}`,
      studentId,
      postId: `post-${userNumber}-${postIndex + 1}`,
      postTitle: `${name}의 신고된 게시글 ${postIndex + 1}`,
      writerName: name,
      writerState: userState,
      reportReasonDescription:
        POST_REASONS[(index + postIndex) % POST_REASONS.length],
      reportCreatedAt: createDate(index + postIndex, postIndex),
      boardName: ["자유게시판", "질문게시판", "장터게시판"][(index + postIndex) % 3],
      url: `/board/mock-board-${(index % 3) + 1}/post-${userNumber}-${postIndex + 1}`,
    }))

    const comments = Array.from({ length: (index % 3) + 1 }, (_, commentIndex) => ({
      reportId: `report-comment-${userNumber}-${commentIndex + 1}`,
      studentId,
      commentId: `comment-${userNumber}-${commentIndex + 1}`,
      commentContent: `${name}의 신고된 댓글 ${commentIndex + 1} 내용입니다.`,
      writerName: name,
      writerState: userState,
      reportReasonDescription:
        COMMENT_REASONS[(index + commentIndex) % COMMENT_REASONS.length],
      reportCreatedAt: createDate(index + commentIndex, commentIndex + 2),
      url: `/board/mock-board-${(index % 3) + 1}/post-${userNumber}-${commentIndex + 1}`,
    }))

    return {
      userId,
      studentId,
      name,
      academicStatus,
      userState,
      reportedCount: posts.length + comments.length,
      posts,
      comments,
    }
  })
}

const mockReportedUsers = buildMockReportedUsers()

function paginate<T>(
  items: T[],
  params: ReportedUserContentParams
): {
  content: T[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
} {
  const currentPage = params.page ?? 0
  const size = params.size ?? 10
  const start = currentPage * size
  const content = items.slice(start, start + size)
  const totalElements = items.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))

  return {
    content,
    currentPage,
    size,
    totalPages,
    totalElements,
    hasNext: currentPage + 1 < totalPages,
    hasPrev: currentPage > 0,
  }
}

export const mockReportApi = {
  getReportedUsers: async (
    params: ReportedUserListParams
  ): Promise<ReportedUserListResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    let items = [...mockReportedUsers]

    const keyword = params.keyword?.trim().toLowerCase()
    if (keyword) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.studentId.toLowerCase().includes(keyword)
      )
    }

    const state = params.state ?? "ACTIVE"
    items = items.filter((item) => item.userState === state)

    if (params.academicStatus && params.academicStatus !== "ALL") {
      items = items.filter((item) => item.academicStatus === params.academicStatus)
    }

    items.sort((a, b) => {
      if (b.reportedCount !== a.reportedCount) {
        return b.reportedCount - a.reportedCount
      }
      return a.name.localeCompare(b.name, "ko")
    })

    return paginate(items, params)
  },

  getReportedUserPosts: async (
    userId: string,
    params: ReportedUserContentParams
  ): Promise<ReportedPostListResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const user = mockReportedUsers.find((item) => item.userId === userId)
    if (!user) {
      throw new Error("신고 회원을 찾을 수 없습니다.")
    }

    const posts = [...user.posts].sort(
      (a, b) =>
        new Date(b.reportCreatedAt).getTime() - new Date(a.reportCreatedAt).getTime()
    )

    return paginate(posts, params)
  },

  getReportedUserComments: async (
    userId: string,
    params: ReportedUserContentParams
  ): Promise<ReportedCommentListResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const user = mockReportedUsers.find((item) => item.userId === userId)
    if (!user) {
      throw new Error("신고 회원을 찾을 수 없습니다.")
    }

    const comments = [...user.comments].sort(
      (a, b) =>
        new Date(b.reportCreatedAt).getTime() - new Date(a.reportCreatedAt).getTime()
    )

    return paginate(comments, params)
  },
}
