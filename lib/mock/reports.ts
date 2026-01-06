import type {
  Report,
  ReportListParams,
  ReportListResponse,
  ReportTargetType,
  ReportStatus,
} from "@/types/report"

// Mock 신고 데이터 생성
const generateMockReports = (): Report[] => {
  const reasons = [
    "욕설 및 비하 발언",
    "스팸 게시글",
    "부적절한 콘텐츠",
    "개인정보 유출",
    "허위 정보 유포",
    "성적 비하 발언",
    "혐오 표현",
    "저작권 침해",
  ]

  const targetTypes: ReportTargetType[] = ["POST", "COMMENT", "USER"]
  const reporters = ["익명", "20201234", "20212345", "20223456", "20234567"]
  const authors = ["김철수", "이영희", "박민수", "정수진", "최지훈"]

  return Array.from({ length: 30 }, (_, i) => {
    const targetType = targetTypes[i % targetTypes.length]
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30))
    createdAt.setHours(Math.floor(Math.random() * 24))
    createdAt.setMinutes(Math.floor(Math.random() * 60))

    const isResolved = Math.random() > 0.4
    const resolvedAt = isResolved
      ? new Date(createdAt.getTime() + Math.random() * 86400000 * 2)
      : undefined

    return {
      id: i + 1,
      targetType,
      targetId: i + 1,
      targetTitle:
        targetType === "POST"
          ? `게시글 제목 ${i + 1}`
          : targetType === "COMMENT"
            ? `댓글 내용 ${i + 1}`
            : undefined,
      targetContent:
        targetType === "POST"
          ? `게시글 내용 ${i + 1}입니다.`
          : targetType === "COMMENT"
            ? `댓글 내용 ${i + 1}입니다.`
            : undefined,
      targetAuthor: authors[i % authors.length],
      targetDeleted: Math.random() > 0.7, // 30% 확률로 삭제된 글
      reason: reasons[i % reasons.length],
      reporter: reporters[i % reporters.length],
      reporterId: i + 1,
      createdAt: createdAt.toISOString(),
      status: isResolved ? "RESOLVED" : "UNRESOLVED",
      resolvedAt: resolvedAt?.toISOString(),
      resolvedBy: isResolved ? "관리자" : undefined,
      action: isResolved ? (Math.random() > 0.5 ? "APPROVE" : "REJECT") : undefined,
    }
  })
}

const mockReports = generateMockReports()

// Mock API 함수들
export const mockReportApi = {
  // 신고 리스트 조회
  getReports: async (params: ReportListParams): Promise<ReportListResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    let filteredReports = [...mockReports]

    // 대상 유형 필터링
    if (params.targetType && params.targetType !== "ALL") {
      filteredReports = filteredReports.filter(
        (report) => report.targetType === params.targetType
      )
    }

    // 처리 상태 필터링
    if (params.status && params.status !== "ALL") {
      filteredReports = filteredReports.filter(
        (report) => report.status === params.status
      )
    }

    // 정렬 (최신순)
    filteredReports.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // 페이지네이션
    const page = params.page || 0
    const size = params.size || 10
    const start = page * size
    const end = start + size
    const paginatedReports = filteredReports.slice(start, end)

    return {
      content: paginatedReports,
      totalElements: filteredReports.length,
      totalPages: Math.ceil(filteredReports.length / size),
      size,
      number: page,
    }
  },

  // 신고 상세 조회
  getReportDetail: async (reportId: number): Promise<Report> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    const report = mockReports.find((r) => r.id === reportId)
    if (!report) {
      throw new Error("신고를 찾을 수 없습니다.")
    }

    return report
  },

  // 신고 처리 (반려/승인)
  processReport: async (
    reportId: number,
    action: "REJECT" | "APPROVE",
    targetId?: number
  ): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const report = mockReports.find((r) => r.id === reportId)
    if (report) {
      report.status = "RESOLVED"
      report.resolvedAt = new Date().toISOString()
      report.resolvedBy = "관리자"
      report.action = action

      // 승인 시 대상 삭제 처리 (Mock에서는 상태만 변경)
      if (action === "APPROVE" && report.targetType === "POST") {
        // 실제로는 게시글 삭제 API 호출
      } else if (action === "APPROVE" && report.targetType === "USER" && targetId) {
        // 실제로는 유저 제재 API 호출
      }
    }
  },
}

