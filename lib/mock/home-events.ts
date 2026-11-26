import type { HomeEvent, HomeEventRequest } from "@/types/home-event"

const now = () => new Date().toISOString()

let events: HomeEvent[] = [
  {
    id: "home-event-1",
    title: "2학기 ICT 위원회 백엔드 신청",
    landingUrl: "https://causw.net",
    isActive: true,
    displayOrder: 10,
    createdAt: "2026-10-11T11:00:00",
    updatedAt: "2026-10-11T11:00:00",
  },
  {
    id: "home-event-2",
    title: "CCSSAA 동문 네트워킹 데이",
    landingUrl: "https://example.com/ccssaa",
    isActive: true,
    displayOrder: 20,
    createdAt: "2026-10-12T09:30:00",
    updatedAt: "2026-10-12T09:30:00",
  },
  {
    id: "home-event-3",
    title: "지난 학기 해커톤 (종료)",
    landingUrl: "https://example.com/hackathon",
    isActive: false,
    displayOrder: 30,
    createdAt: "2026-09-01T10:00:00",
    updatedAt: "2026-10-01T10:00:00",
  },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const sorted = () =>
  [...events].sort((a, b) => a.displayOrder - b.displayOrder).map((e) => ({ ...e }))

export const mockHomeEventApi = {
  async getAll(): Promise<HomeEvent[]> {
    await delay(200)
    return sorted()
  },
  async create(data: HomeEventRequest): Promise<HomeEvent> {
    await delay(300)
    const maxOrder = events.reduce((max, e) => Math.max(max, e.displayOrder), 0)
    const event: HomeEvent = {
      id: `home-event-${Date.now()}`,
      ...data,
      displayOrder: maxOrder + 10,
      createdAt: now(),
      updatedAt: now(),
    }
    events = [...events, event]
    return { ...event }
  },
  async update(id: string, data: HomeEventRequest): Promise<HomeEvent> {
    await delay(300)
    const target = events.find((e) => e.id === id)
    if (!target) throw new Error("이벤트를 찾을 수 없습니다.")
    const updated = { ...target, ...data, updatedAt: now() }
    events = events.map((e) => (e.id === id ? updated : e))
    return { ...updated }
  },
  async updateOrders(eventIds: string[]): Promise<void> {
    await delay(300)
    events = events.map((e) => {
      const index = eventIds.indexOf(e.id)
      return index === -1 ? e : { ...e, displayOrder: (index + 1) * 10 }
    })
  },
  async remove(id: string): Promise<void> {
    await delay(300)
    events = events.filter((e) => e.id !== id)
  },
}
