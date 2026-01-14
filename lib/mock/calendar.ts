import type {
  CalendarEvent,
  CalendarListParams,
  CalendarListResponse,
  CalendarScope,
  CalendarActionType,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from "@/types/calendar"

// Mock 데이터 생성
const generateMockCalendarEvents = (): CalendarEvent[] => {
  const events: CalendarEvent[] = []

  // 사물함 신청 기간 (재학생 전용)
  events.push({
    id: 1,
    title: "사물함 신청 기간",
    description: "2025년 1학기 사물함 신청을 받습니다.",
    date: new Date(2025, 1, 1, 9, 0).toISOString(),
    scope: "STUDENT",
    actionType: "Service",
    serviceLink: "/lockers/apply",
    notificationEnabled: true,
    createdAt: new Date(2024, 11, 15).toISOString(),
    updatedAt: new Date(2024, 11, 15).toISOString(),
  })

  // 개강총회 (전체)
  events.push({
    id: 2,
    title: "2025년 1학기 개강총회",
    description: "새 학기를 맞이하여 개강총회를 개최합니다.",
    date: new Date(2025, 2, 3, 14, 0).toISOString(),
    scope: "ALL",
    actionType: "Notice",
    notificationEnabled: true,
    createdAt: new Date(2024, 11, 20).toISOString(),
    updatedAt: new Date(2024, 11, 20).toISOString(),
  })

  // 경조사 (졸업생 전용)
  events.push({
    id: 3,
    title: "박지성 동문 결혼식",
    description: "박지성 동문의 결혼식을 축하합니다.",
    date: new Date(2025, 2, 15, 12, 0).toISOString(),
    scope: "ALUMNI",
    actionType: "Notice",
    notificationEnabled: false,
    createdAt: new Date(2025, 0, 10).toISOString(),
    updatedAt: new Date(2025, 0, 10).toISOString(),
  })

  // 외부 링크 (전체)
  events.push({
    id: 4,
    title: "동문회 홈페이지",
    description: "동문회 공식 홈페이지로 이동합니다.",
    date: new Date(2025, 2, 1, 0, 0).toISOString(),
    scope: "ALL",
    actionType: "Link",
    externalLink: "https://alumni.example.com",
    notificationEnabled: false,
    createdAt: new Date(2024, 11, 1).toISOString(),
    updatedAt: new Date(2024, 11, 1).toISOString(),
  })

  // 추가 일정들
  const additionalEvents = [
    {
      title: "학부 공지사항",
      description: "학부에서 전달하는 공지사항입니다.",
      scope: "STUDENT" as CalendarScope,
      actionType: "Notice" as CalendarActionType,
    },
    {
      title: "문화부 행사",
      description: "문화부에서 주최하는 행사입니다.",
      scope: "STUDENT" as CalendarScope,
      actionType: "Service" as CalendarActionType,
      serviceLink: "/events/culture",
    },
    {
      title: "동문 네트워킹",
      description: "동문 간 네트워킹 행사입니다.",
      scope: "ALUMNI" as CalendarScope,
      actionType: "Link" as CalendarActionType,
      externalLink: "https://networking.example.com",
    },
  ]

  additionalEvents.forEach((event, index) => {
    const date = new Date(2025, 2 + index, 10 + index * 5, 10 + index, 0)
    events.push({
      id: 5 + index,
      title: event.title,
      description: event.description,
      date: date.toISOString(),
      scope: event.scope,
      actionType: event.actionType,
      serviceLink: event.serviceLink,
      externalLink: event.externalLink,
      notificationEnabled: Math.random() > 0.5,
      createdAt: new Date(2024, 11, 1 + index).toISOString(),
      updatedAt: new Date(2024, 11, 1 + index).toISOString(),
    })
  })

  return events
}

const mockCalendarEvents = generateMockCalendarEvents()

// Mock API 함수들
export const mockCalendarApi = {
  // 캘린더 일정 목록 조회
  getCalendarEvents: async (params: CalendarListParams): Promise<CalendarListResponse> => {
    // 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    let filteredEvents = [...mockCalendarEvents]

    // 날짜 범위 필터링
    if (params.startDate) {
      const startDate = new Date(params.startDate)
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.date) >= startDate
      )
    }
    if (params.endDate) {
      const endDate = new Date(params.endDate)
      endDate.setHours(23, 59, 59, 999)
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.date) <= endDate
      )
    }

    // 스코프 필터링
    if (params.scope && params.scope !== "ALL") {
      filteredEvents = filteredEvents.filter(
        (event) => event.scope === params.scope
      )
    }

    // 액션 타입 필터링
    if (params.actionType && params.actionType !== "ALL") {
      filteredEvents = filteredEvents.filter(
        (event) => event.actionType === params.actionType
      )
    }

    // 키워드 검색
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(keyword) ||
          event.description?.toLowerCase().includes(keyword)
      )
    }

    // 정렬 (기본: 날짜 오름차순)
    filteredEvents.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

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

  // 캘린더 일정 상세 조회
  getCalendarEventDetail: async (eventId: number): Promise<CalendarEvent> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const event = mockCalendarEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("일정을 찾을 수 없습니다.")
    }

    return event
  },

  // 일정 생성
  createCalendarEvent: async (data: CreateCalendarEventRequest): Promise<CalendarEvent> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newEvent: CalendarEvent = {
      id: mockCalendarEvents.length + 1,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockCalendarEvents.push(newEvent)
    return newEvent
  },

  // 일정 수정
  updateCalendarEvent: async (
    eventId: number,
    data: UpdateCalendarEventRequest
  ): Promise<CalendarEvent> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const event = mockCalendarEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("일정을 찾을 수 없습니다.")
    }

    Object.assign(event, data, {
      updatedAt: new Date().toISOString(),
    })

    return event
  },

  // 일정 삭제
  deleteCalendarEvent: async (eventId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockCalendarEvents.findIndex((e) => e.id === eventId)
    if (index === -1) {
      throw new Error("일정을 찾을 수 없습니다.")
    }

    mockCalendarEvents.splice(index, 1)
  },

  // 사물함 기간 캘린더 동기화
  syncLockerPeriodToCalendar: async (
    startAt: string,
    endAt: string
  ): Promise<CalendarEvent> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // 기존 사물함 신청 기간 일정 찾기
    let event = mockCalendarEvents.find(
      (e) => e.title === "사물함 신청 기간" && e.scope === "STUDENT"
    )

    if (event) {
      // 기존 일정 업데이트
      event.date = startAt
      event.description = `${new Date(startAt).toLocaleDateString()} ~ ${new Date(endAt).toLocaleDateString()} 사물함 신청을 받습니다.`
      event.updatedAt = new Date().toISOString()
    } else {
      // 새 일정 생성
      event = {
        id: mockCalendarEvents.length + 1,
        title: "사물함 신청 기간",
        description: `${new Date(startAt).toLocaleDateString()} ~ ${new Date(endAt).toLocaleDateString()} 사물함 신청을 받습니다.`,
        date: startAt,
        scope: "STUDENT",
        actionType: "Service",
        serviceLink: "/lockers/apply",
        notificationEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockCalendarEvents.push(event)
    }

    return event
  },
}
