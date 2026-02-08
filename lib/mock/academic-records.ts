import type {
  AcademicRecordApplication,
  AcademicRecordApplicationDetail,
  AcademicRecordApplicationListPayload,
  AcademicRecordListParams,
  AcademicRequestStatus,
} from "@/types/academic-record"
import type { AcademicStatus, Department } from "@/types/user"

const departments: Department[] = [
  "DEPT_OF_AI",
  "SCHOOL_OF_SW",
  "SCHOOL_OF_CSE",
  "DEPT_OF_CSE",
  "DEPT_OF_CS",
]
const academicStatuses: AcademicStatus[] = ["ENROLLED", "GRADUATED", "UNDETERMINED"]
const requestStatuses: AcademicRequestStatus[] = ["ACCEPT", "REJECT", "AWAIT", "CLOSE"]
const names = [
  "김철수", "이영희", "박민수", "정수진", "최동현",
  "강미영", "윤성호", "임지은", "한동욱", "오세진",
]

const generateMockApplications = (): AcademicRecordApplication[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const year = 2020 + Math.floor(Math.random() * 5)
    const studentId = `${year}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`
    const current = academicStatuses[Math.floor(Math.random() * academicStatuses.length)]
    let target = academicStatuses[Math.floor(Math.random() * academicStatuses.length)]
    while (target === current) {
      target = academicStatuses[Math.floor(Math.random() * academicStatuses.length)]
    }
    const createdDate = new Date(
      2025 + Math.floor(Math.random() * 2),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )

    return {
      applicationId: `app-${String(i + 1).padStart(3, "0")}`,
      userId: `user-${String(i + 1).padStart(3, "0")}`,
      userName: names[Math.floor(Math.random() * names.length)],
      studentId,
      department: departments[Math.floor(Math.random() * departments.length)],
      currentAcademicStatus: current,
      targetAcademicStatus: target,
      requestStatus: requestStatuses[Math.floor(Math.random() * requestStatuses.length)],
      createdAt: createdDate.toISOString(),
    }
  })
}

const mockApplications = generateMockApplications()

export const mockAcademicRecordsApi = {
  /** 목록 조회 */
  getApplications: async (
    params?: AcademicRecordListParams
  ): Promise<AcademicRecordApplicationListPayload> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    let filtered = [...mockApplications]

    if (params?.requestStatus && params.requestStatus !== "ALL") {
      filtered = filtered.filter((a) => a.requestStatus === params.requestStatus)
    }
    if (params?.department && params.department !== "ALL") {
      filtered = filtered.filter((a) => a.department === params.department)
    }
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase()
      filtered = filtered.filter(
        (a) => a.userName.toLowerCase().includes(kw) || a.studentId.includes(kw)
      )
    }

    // 최신순 정렬
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const page = params?.page ?? 0
    const size = params?.size ?? 10
    const start = page * size
    const end = start + size
    const paginated = filtered.slice(start, end)

    return {
      content: paginated,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      size,
      number: page,
      numberOfElements: paginated.length,
      first: page === 0,
      last: end >= filtered.length,
      empty: paginated.length === 0,
      sort: { empty: true, unsorted: true, sorted: false },
      pageable: {
        offset: start,
        sort: { empty: true, unsorted: true, sorted: false },
        pageNumber: page,
        pageSize: size,
        paged: true,
        unpaged: false,
      },
    }
  },

  /** 상세 조회 */
  getApplicationDetail: async (
    applicationId: string
  ): Promise<AcademicRecordApplicationDetail | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    const app = mockApplications.find((a) => a.applicationId === applicationId)
    if (!app) return null

    return {
      ...app,
      note: "학적 상태 변경을 요청합니다.",
      rejectMessage: app.requestStatus === "REJECT" ? "서류 미비로 반려되었습니다." : "",
      attachImageUrls: [
        "https://placehold.co/600x400?text=증빙서류1",
        "https://placehold.co/600x400?text=증빙서류2",
      ],
      updatedAt: new Date().toISOString(),
    }
  },

  /** 승인 */
  approve: async (applicationId: string): Promise<unknown> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const app = mockApplications.find((a) => a.applicationId === applicationId)
    if (app) app.requestStatus = "ACCEPT"
    return {}
  },

  /** 거절 */
  reject: async (applicationId: string, _rejectReason: string): Promise<unknown> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const app = mockApplications.find((a) => a.applicationId === applicationId)
    if (app) app.requestStatus = "REJECT"
    return {}
  },
}
