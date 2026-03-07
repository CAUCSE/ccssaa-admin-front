import type {
  CeremonyDetail,
  CeremonyListItem,
  EventListParams,
  EventListResponse,
  CeremonyState,
} from "@/types/event"

// Mock 경조사 데이터 생성
const generateMockEvents = (): CeremonyDetail[] => {
  const states: CeremonyState[] = ["AWAIT", "ACCEPT", "REJECT", "CLOSE"]
  const applicants = [
    { name: "박지성", studentId: "20180001" },
    { name: "김민수", studentId: "20190012" },
    { name: "이영희", studentId: "20200023" },
    { name: "정수진", studentId: "20210034" },
    { name: "최지훈", studentId: "20170045" },
  ]
  const categories = ["결혼식", "장례식", "출산", "기타"]

  return Array.from({ length: 20 }, (_, i) => {
    const applicant = applicants[i % applicants.length]
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 60))
    const startDate = new Date(createdAt)
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30))
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)
    const state = states[i % states.length]
    const hasRejectNote = state === "REJECT"
    const category = categories[i % categories.length]
    const isSetAll = i % 2 === 0

    return {
      id: `mock-ceremony-${i + 1}`,
      title: `${applicant.name}(${applicant.studentId.slice(2, 4)}학번) 경조사`,
      type: category === "장례식" ? "조사" : "경사",
      category,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      startTime: "10:00",
      endTime: "12:00",
      applicant: applicant.name,
      subject: `${applicant.name} 가족`,
      content: `경조사 내용 ${i + 1}`,
      attachedImageUrlList: [`https://picsum.photos/seed/ceremony-${i + 1}/400/300`],
      address: "서울특별시 동작구 흑석로 84",
      postalAddress: "12345",
      detailedAddress: "중앙대학교 310관",
      contact: "010-1234-5678",
      link: "www.example.com/link",
      isSetAll,
      targetAdmissionYears: isSetAll ? [] : [19, 21, 22],
      state,
      note: hasRejectNote ? `거부 사유 ${i + 1}` : undefined,
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
    if (params.fromDate) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.startDate) >= new Date(params.fromDate!)
      )
    }
    if (params.toDate) {
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.endDate) <= new Date(params.toDate!)
      )
    }

    // 상태 필터링
    if (params.state) {
      filteredEvents = filteredEvents.filter((event) => event.state === params.state)
    }

    // 페이지네이션
    const page = params.page || 0
    const size = params.size || 10
    const start = page * size
    const end = start + size
    const paginatedEvents = filteredEvents.slice(start, end).map<CeremonyListItem>((event) => ({
      id: event.id,
      applicantName: event.applicant,
      applicantStudentId: event.title.match(/\((\d{2})학번\)/)?.[1]
        ? `20${event.title.match(/\((\d{2})학번\)/)![1]}0000`
        : "20210000",
      state: event.state,
      startDate: event.startDate,
      createdAt: new Date().toISOString(),
      category: event.category,
    }))

    return {
      content: paginatedEvents,
      currentPage: page,
      size,
      totalPages: Math.ceil(filteredEvents.length / size),
      totalElements: filteredEvents.length,
      hasNext: end < filteredEvents.length,
      hasPrev: page > 0,
    }
  },

  // 경조사 상세 조회
  getEventDetail: async (eventId: string): Promise<CeremonyDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    const event = mockEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("경조사를 찾을 수 없습니다.")
    }

    return event
  },
}

