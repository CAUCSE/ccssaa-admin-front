import type {
  CalendarEvent,
  CalendarListParams,
  CalendarListResponse,
  CalendarType,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from "@/types/calendar"

// Mock 데이터 생성
const generateMockCalendarEvents = (): CalendarEvent[] => {
  const events: CalendarEvent[] = []

  events.push({
    id: "a3bb189e-8bf9-4558-8c5e-5c8d5e8f4e3a",
    title: "2026학년도 1학기 중간고사",
    type: "ACADEMIC",
    start: "2026-04-13T09:00:00",
    end: "2026-04-17T18:00:00",
  })

  events.push({
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "컴퓨터공학부 세미나",
    type: "DEPARTMENT",
    start: "2026-04-20T14:00:00",
    end: "2026-04-20T16:00:00",
  })

  events.push({
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    title: "수강신청 기간",
    type: "ACADEMIC",
    start: "2025-02-10T10:00:00",
    end: "2025-02-14T17:00:00",
  })

  events.push({
    id: "b2c1d345-6789-4def-a012-3456789abcde",
    title: "컴공 총학생회 정기총회",
    type: "STUDENT_COUNCIL",
    start: "2026-03-05T18:00:00",
    end: "2026-03-05T20:00:00",
  })

  events.push({
    id: "c3d2e456-789a-4bcd-b123-456789abcdef",
    title: "프로그래밍 경진대회",
    type: "COMPETITION",
    start: "2026-05-15T10:00:00",
    end: "2026-05-15T17:00:00",
  })

  events.push({
    id: "d4e3f567-89ab-4cde-c234-56789abcdef0",
    title: "석가탄신일",
    type: "HOLIDAY",
    start: "2026-05-05T00:00:00",
    end: "2026-05-05T23:59:59",
  })

  events.push({
    id: "e5f4a678-9abc-4def-d345-6789abcdef01",
    title: "CCSSAA 신입생 환영회",
    type: "CCSSAA",
    start: "2026-03-15T17:00:00",
    end: "2026-03-15T21:00:00",
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
        (event) => new Date(event.start) >= startDate
      )
    }
    if (params.endDate) {
      const endDate = new Date(params.endDate)
      endDate.setHours(23, 59, 59, 999)
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.end) <= endDate
      )
    }

    // 타입 필터링
    if (params.type) {
      filteredEvents = filteredEvents.filter(
        (event) => event.type === params.type
      )
    }

    // 키워드 검색
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredEvents = filteredEvents.filter(
        (event) => event.title.toLowerCase().includes(keyword)
      )
    }

    // 정렬 (기본: 날짜 오름차순)
    filteredEvents.sort((a, b) => {
      return new Date(a.start).getTime() - new Date(b.start).getTime()
    })

    return {
      count: filteredEvents.length,
      data: filteredEvents,
    }
  },

  // 캘린더 일정 상세 조회
  getCalendarEventDetail: async (eventId: string): Promise<CalendarEvent> => {
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
      id: crypto.randomUUID(),
      ...data,
    }

    mockCalendarEvents.push(newEvent)
    return newEvent
  },

  // 일정 수정
  updateCalendarEvent: async (
    eventId: string,
    data: UpdateCalendarEventRequest
  ): Promise<CalendarEvent> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const event = mockCalendarEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("일정을 찾을 수 없습니다.")
    }

    Object.assign(event, data)

    return event
  },

  // 일정 삭제
  deleteCalendarEvent: async (eventId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockCalendarEvents.findIndex((e) => e.id === eventId)
    if (index === -1) {
      throw new Error("일정을 찾을 수 없습니다.")
    }

    mockCalendarEvents.splice(index, 1)
  },
}
