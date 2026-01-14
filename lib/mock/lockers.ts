import type {
  Locker,
  LockerListParams,
  LockerListResponse,
  LockerStatus,
  AssignLockerRequest,
  LockerApplicationPeriod,
} from "@/types/locker"

// Mock 데이터 생성
const generateMockLockers = (): Locker[] => {
  const names = [
    "김철수",
    "이영희",
    "박민수",
    "정수진",
    "최동현",
    "강미영",
    "윤성호",
    "임지은",
    "한동욱",
    "오세진",
  ]

  return Array.from({ length: 100 }, (_, i) => {
    const number = 101 + i
    const isOccupied = Math.random() > 0.4 // 60% 확률로 사용 중
    const status: LockerStatus = isOccupied ? "OCCUPIED" : "AVAILABLE"

    let currentUserId: number | undefined
    let currentUserName: string | undefined
    let currentUserStudentNo: string | undefined
    let currentUserPhone: string | undefined
    let assignedAt: string | undefined

    if (isOccupied) {
      currentUserId = i + 1
      currentUserName = names[Math.floor(Math.random() * names.length)]
      const year = 2020 + Math.floor(Math.random() * 5)
      currentUserStudentNo = `${year}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`
      currentUserPhone = `010-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`
      const assignedDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      assignedAt = assignedDate.toISOString()
    }

    // 이전 사용자 정보 (50% 확률)
    let previousUserId: number | undefined
    let previousUserName: string | undefined
    let previousUserStudentNo: string | undefined
    let releasedAt: string | undefined

    if (Math.random() > 0.5) {
      previousUserId = (i + 1) * 100
      previousUserName = names[Math.floor(Math.random() * names.length)]
      const year = 2020 + Math.floor(Math.random() * 5)
      previousUserStudentNo = `${year}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`
      const releasedDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      releasedAt = releasedDate.toISOString()
    }

    return {
      id: i + 1,
      number,
      status,
      currentUserId,
      currentUserName,
      currentUserStudentNo,
      currentUserPhone,
      assignedAt,
      previousUserId,
      previousUserName,
      previousUserStudentNo,
      releasedAt,
    }
  })
}

const mockLockers = generateMockLockers()

// 신청 기간 설정 데이터 (메모리 저장)
let applicationPeriod: LockerApplicationPeriod | null = null

// Mock API 함수들
export const mockLockerApi = {
  // 사물함 목록 조회
  getLockers: async (params: LockerListParams): Promise<LockerListResponse> => {
    // 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

    let filteredLockers = [...mockLockers]

    // 사물함 번호 필터링
    if (params.number) {
      filteredLockers = filteredLockers.filter(
        (locker) => locker.number.toString().includes(params.number!)
      )
    }

    // 상태 필터링
    if (params.status && params.status !== "ALL") {
      filteredLockers = filteredLockers.filter(
        (locker) => locker.status === params.status
      )
    }

    // 사용자 검색
    if (params.userKeyword) {
      const keyword = params.userKeyword.toLowerCase()
      filteredLockers = filteredLockers.filter(
        (locker) =>
          locker.currentUserName?.toLowerCase().includes(keyword) ||
          locker.currentUserStudentNo?.includes(keyword) ||
          locker.previousUserName?.toLowerCase().includes(keyword) ||
          locker.previousUserStudentNo?.includes(keyword)
      )
    }

    // 정렬 (기본: 번호 오름차순)
    filteredLockers.sort((a, b) => a.number - b.number)

    // 페이지네이션
    const page = params.page || 0
    const size = params.size || 10
    const start = page * size
    const end = start + size
    const paginatedLockers = filteredLockers.slice(start, end)

    return {
      content: paginatedLockers,
      totalElements: filteredLockers.length,
      totalPages: Math.ceil(filteredLockers.length / size),
      size,
      number: page,
    }
  },

  // 사물함 상세 조회
  getLockerDetail: async (lockerId: number): Promise<Locker> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const locker = mockLockers.find((l) => l.id === lockerId)
    if (!locker) {
      throw new Error("사물함을 찾을 수 없습니다.")
    }

    return locker
  },

  // 수동 배정
  assignLocker: async (lockerId: number, data: AssignLockerRequest): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const locker = mockLockers.find((l) => l.id === lockerId)
    if (!locker) {
      throw new Error("사물함을 찾을 수 없습니다.")
    }

    // Mock: 사용자 정보 가져오기 (실제로는 API에서 가져와야 함)
    const names = ["김철수", "이영희", "박민수", "정수진", "최동현"]
    const name = names[Math.floor(Math.random() * names.length)]
    const year = 2020 + Math.floor(Math.random() * 5)
    const studentNo = `${year}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`
    const phone = `010-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`

    // 이전 사용자 정보 저장
    if (locker.currentUserId) {
      locker.previousUserId = locker.currentUserId
      locker.previousUserName = locker.currentUserName
      locker.previousUserStudentNo = locker.currentUserStudentNo
      locker.releasedAt = new Date().toISOString()
    }

    // 새 사용자 배정
    locker.status = "OCCUPIED"
    locker.currentUserId = data.userId
    locker.currentUserName = name
    locker.currentUserStudentNo = studentNo
    locker.currentUserPhone = phone
    locker.assignedAt = new Date().toISOString()
  },

  // 개별 회수
  releaseLocker: async (lockerId: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const locker = mockLockers.find((l) => l.id === lockerId)
    if (!locker) {
      throw new Error("사물함을 찾을 수 없습니다.")
    }

    if (locker.status === "AVAILABLE") {
      throw new Error("이미 사용 가능한 사물함입니다.")
    }

    // 이전 사용자 정보 저장
    if (locker.currentUserId) {
      locker.previousUserId = locker.currentUserId
      locker.previousUserName = locker.currentUserName
      locker.previousUserStudentNo = locker.currentUserStudentNo
      locker.releasedAt = new Date().toISOString()
    }

    // 회수 처리
    locker.status = "AVAILABLE"
    locker.currentUserId = undefined
    locker.currentUserName = undefined
    locker.currentUserStudentNo = undefined
    locker.currentUserPhone = undefined
    locker.assignedAt = undefined
  },

  // 일괄 회수
  releaseAllLockers: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    mockLockers.forEach((locker) => {
      if (locker.status === "OCCUPIED") {
        // 이전 사용자 정보 저장
        if (locker.currentUserId) {
          locker.previousUserId = locker.currentUserId
          locker.previousUserName = locker.currentUserName
          locker.previousUserStudentNo = locker.currentUserStudentNo
          locker.releasedAt = new Date().toISOString()
        }

        // 회수 처리
        locker.status = "AVAILABLE"
        locker.currentUserId = undefined
        locker.currentUserName = undefined
        locker.currentUserStudentNo = undefined
        locker.currentUserPhone = undefined
        locker.assignedAt = undefined
      }
    })
  },

  // 신청 기간 설정
  setLockerApplicationPeriod: async (data: LockerApplicationPeriod): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    applicationPeriod = data
  },

  // 신청 기간 조회
  getLockerApplicationPeriod: async (): Promise<LockerApplicationPeriod | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))

    return applicationPeriod
  },
}
