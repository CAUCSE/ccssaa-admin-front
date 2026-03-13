import type {
  ScheduleEvent,
  ScheduleListParams,
  ScheduleListResponse,
  ScheduleType,
  CreateScheduleEventRequest,
  UpdateScheduleEventRequest,
} from "@/types/schedule"

// Mock 데이터 생성
const generateMockScheduleEvents = (): ScheduleEvent[] => {
  const events: ScheduleEvent[] = []

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

const mockScheduleEvents = generateMockScheduleEvents()

// Mock API 함수들
const baseMockScheduleApi = {
  // 스케줄 일정 목록 조회
  getScheduleEvents: async (params: ScheduleListParams): Promise<ScheduleListResponse> => {
    // 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    let filteredEvents = [...mockScheduleEvents]

    // 날짜 범위 필터링 (overlap)
    const fromDate = params.from ? new Date(params.from) : null
    const toDate = params.to ? new Date(params.to) : null
    if (toDate) {
      toDate.setHours(23, 59, 59, 999)
    }
    if (fromDate || toDate) {
      filteredEvents = filteredEvents.filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        const afterFrom = fromDate ? eventEnd >= fromDate : true
        const beforeTo = toDate ? eventStart <= toDate : true
        return afterFrom && beforeTo
      })
    }

    // 타입 필터링 (복수 선택)
    if (params.types && params.types.length > 0) {
      filteredEvents = filteredEvents.filter(
        (event) => params.types!.includes(event.type)
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

  // 스케줄 일정 상세 조회
  getScheduleEventDetail: async (eventId: string): Promise<ScheduleEvent> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const event = mockScheduleEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("일정을 찾을 수 없습니다.")
    }

    return event
  },

  // 일정 생성
  createScheduleEvent: async (data: CreateScheduleEventRequest): Promise<ScheduleEvent> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newEvent: ScheduleEvent = {
      id: crypto.randomUUID(),
      ...data,
    }

    mockScheduleEvents.push(newEvent)
    return newEvent
  },

  // 일정 수정
  updateScheduleEvent: async (
    eventId: string,
    data: UpdateScheduleEventRequest
  ): Promise<ScheduleEvent> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const event = mockScheduleEvents.find((e) => e.id === eventId)
    if (!event) {
      throw new Error("일정을 찾을 수 없습니다.")
    }

    Object.assign(event, data)

    return event
  },

  // 일정 삭제
  deleteScheduleEvent: async (eventId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const index = mockScheduleEvents.findIndex((e) => e.id === eventId)
    if (index === -1) {
      throw new Error("일정을 찾을 수 없습니다.")
    }

    mockScheduleEvents.splice(index, 1)
  },
}

export const mockScheduleApi = {
  ...baseMockScheduleApi,
  getCalendarEvents: baseMockScheduleApi.getScheduleEvents,
  getCalendarEventDetail: baseMockScheduleApi.getScheduleEventDetail,
  createCalendarEvent: baseMockScheduleApi.createScheduleEvent,
  updateCalendarEvent: baseMockScheduleApi.updateScheduleEvent,
  deleteCalendarEvent: baseMockScheduleApi.deleteScheduleEvent,
}

export const mockCalendarApi = mockScheduleApi
