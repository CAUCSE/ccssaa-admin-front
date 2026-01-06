import type {
  FinanceRecord,
  FinanceListParams,
  FinanceListResponse,
  PaymentStatus,
} from "@/types/finance"

// Mock 재정 데이터 생성
const generateMockFinanceRecords = (): FinanceRecord[] => {
  const users = [
    { name: "김철수", studentNo: "20180001" },
    { name: "이영희", studentNo: "20190012" },
    { name: "박민수", studentNo: "20200023" },
    { name: "정수진", studentNo: "20210034" },
    { name: "최지훈", studentNo: "20170045" },
    { name: "한소영", studentNo: "20220056" },
    { name: "윤대현", studentNo: "20160067" },
    { name: "강미영", studentNo: "20230078" },
  ]

  const statuses: PaymentStatus[] = ["PAID", "PENDING", "OVERDUE"]
  const amounts = [50000, 100000, 150000]

  return Array.from({ length: 50 }, (_, i) => {
    const user = users[i % users.length]
    const createdAt = new Date()
    createdAt.setMonth(createdAt.getMonth() - Math.floor(Math.random() * 12))
    const dueDate = new Date(createdAt)
    dueDate.setMonth(dueDate.getMonth() + 1)

    const status = statuses[i % statuses.length]
    const paidAt =
      status === "PAID"
        ? new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined

    return {
      id: i + 1,
      userId: i + 1,
      userName: user.name,
      userStudentNo: user.studentNo,
      amount: amounts[i % amounts.length],
      status,
      paidAt,
      dueDate: dueDate.toISOString(),
      createdAt: createdAt.toISOString(),
    }
  })
}

const mockFinanceRecords = generateMockFinanceRecords()

// Mock API 함수들
export const mockFinanceApi = {
  // 재정 리스트 조회
  getFinanceRecords: async (params: FinanceListParams): Promise<FinanceListResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    let filteredRecords = [...mockFinanceRecords]

    // 날짜 범위 필터링
    if (params.startDate) {
      filteredRecords = filteredRecords.filter(
        (record) => new Date(record.createdAt) >= new Date(params.startDate!)
      )
    }
    if (params.endDate) {
      filteredRecords = filteredRecords.filter(
        (record) => new Date(record.createdAt) <= new Date(params.endDate!)
      )
    }

    // 상태 필터링
    if (params.status) {
      filteredRecords = filteredRecords.filter((record) => record.status === params.status)
    }

    // 유저 ID 필터링
    if (params.userId) {
      filteredRecords = filteredRecords.filter((record) => record.userId === params.userId)
    }

    // 키워드 필터링 (이름, 학번)
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredRecords = filteredRecords.filter(
        (record) =>
          record.userName.toLowerCase().includes(keyword) ||
          record.userStudentNo.toLowerCase().includes(keyword)
      )
    }

    // 정렬 (최신순)
    filteredRecords.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // 페이지네이션
    const page = params.page || 0
    const size = params.size || 10
    const start = page * size
    const end = start + size
    const paginatedRecords = filteredRecords.slice(start, end)

    return {
      content: paginatedRecords,
      totalElements: filteredRecords.length,
      totalPages: Math.ceil(filteredRecords.length / size),
      size,
      number: page,
    }
  },

  // 납부 상태 업데이트
  updatePaymentStatus: async (
    recordId: number,
    status: PaymentStatus
  ): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const record = mockFinanceRecords.find((r) => r.id === recordId)
    if (!record) {
      throw new Error("재정 기록을 찾을 수 없습니다.")
    }

    record.status = status
    if (status === "PAID") {
      record.paidAt = new Date().toISOString()
    } else {
      record.paidAt = undefined
    }
  },
}

