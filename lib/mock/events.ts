import type {
  Event,
  EventListParams,
  EventListResponse,
  EventStatus,
  EventType,
  ApproveEventRequest,
} from "@/types/event"

// Mock 경조사 데이터 생성
const generateMockEvents = (): Event[] => {
  const types: EventType[] = ["MARRIAGE", "FUNERAL", "BIRTH", "OTHER"]
  const statuses: EventStatus[] = ["PENDING", "APPROVED", "REJECTED"]
  const applicants = [
    { name: "박지성", studentNo: "20180001" },
    { name: "김민수", studentNo: "20190012" },
    { name: "이영희", studentNo: "20200023" },
    { name: "정수진", studentNo: "20210034" },
    { name: "최지훈", studentNo: "20170045" },
  ]

  return Array.from({ length: 20 }, (_, i) => {
    const applicant = applicants[i % applicants.length]
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 60))
    const eventDate = new Date(createdAt)
    eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 30))

    const status = statuses[i % statuses.length]
    const hasRejection = status === "REJECTED" && Math.random() > 0.5

    return {
      id: i + 1,
      applicantId: i + 1,
      applicantName: applicant.name,
      applicantStudentNo: applicant.studentNo,
      type: types[i % types.length],
      eventDate: eventDate.toISOString(),
      description: `경조사 설명 ${i + 1}`,
      accountNumber: `123-456-7890${i}`,
      accountBank: "KB국민은행",
      accountHolder: applicant.name,
      evidenceFiles: [`evidence-${i + 1}-1.jpg`, `evidence-${i + 1}-2.jpg`],
      status,
      rejectionReason: hasRejection ? `거부 사유 ${i + 1}` : undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    }
  })
}

const mockEvents = generateMockEvents()

// Mock API 함수들
export const mockEventApi = {
  // 경조사 리스트 조회
  getEvents: async (params: EventListParams): Promise<EventListResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    let filteredEvents = [...mockEvents]

    // 날짜 범위 필터링
    if (params.startDate) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.eventDate) >= new Date(params.startDate!)
      )
    }
    if (params.endDate) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.eventDate) <= new Date(params.endDate!)
      )
    }

    // 상태 필터링
    if (params.status) {
      filteredEvents = filteredEvents.filter((event) => event.status === params.status)
    }

    // 정렬 (최신순)
    filteredEvents.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // 페이지네이션
    const page = params.page || 0
    const size = params.size || 10
    const start = page * size
    const end = start + size
    const paginatedEvents = filteredEvents.slice(start, end)

    return {
      content: paginatedEvents,
      totalElements: filteredEvents.length,
      totalPages: Math.ceil(filteredEvents.length / size),
      size,
      number: page,
    }
  },

  // 경조사 상세 조회
  getEventDetail: async (eventId: number): Promise<Event> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    const event = mockEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("경조사를 찾을 수 없습니다.")
    }

    return event
  },

  // 경조사 승인/거부
  approveEvent: async (eventId: number, data: ApproveEventRequest): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const event = mockEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("경조사를 찾을 수 없습니다.")
    }

    if (data.approved) {
      event.status = "APPROVED"
      event.rejectionReason = undefined
    } else {
      event.status = "REJECTED"
      event.rejectionReason = data.rejectionReason || "거부 사유 없음"
    }
    event.updatedAt = new Date().toISOString()
  },
}

