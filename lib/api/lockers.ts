import { api } from "../api"
import type {
  Locker,
  LockerListParams,
  LockerListResponse,
  AssignLockerRequest,
  LockerApplicationPeriod,
  ExtendLockerRequest,
} from "@/types/locker"
import { mockLockerApi } from "../mock/lockers"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realLockerApi = {
  // 사물함 목록 조회
  getLockers: async (params: LockerListParams): Promise<LockerListResponse> => {
    const response = await api.get<LockerListResponse>("/admin/lockers", { params })
    return response.data
  },

  // 사물함 상세 조회
  getLockerDetail: async (lockerId: number): Promise<Locker> => {
    const response = await api.get<Locker>(`/admin/lockers/${lockerId}`)
    return response.data
  },

  // 수동 배정
  assignLocker: async (lockerId: number, data: AssignLockerRequest): Promise<void> => {
    await api.post(`/admin/lockers/${lockerId}/assign`, data)
  },

  // 만료일 연장
  extendLocker: async (lockerId: number, data: ExtendLockerRequest): Promise<void> => {
    await api.post(`/admin/lockers/${lockerId}/extend`, data)
  },

  // 개별 회수
  releaseLocker: async (lockerId: number): Promise<void> => {
    await api.post(`/admin/lockers/${lockerId}/release`)
  },

  // 일괄 회수
  releaseAllLockers: async (): Promise<void> => {
    await api.post("/admin/lockers/release-all")
  },

  // 신청 기간 설정
  setLockerApplicationPeriod: async (data: LockerApplicationPeriod): Promise<void> => {
    await api.post("/admin/lockers/application-period", data)
  },

  // 신청 기간 조회
  getLockerApplicationPeriod: async (): Promise<LockerApplicationPeriod | null> => {
    const response = await api.get<LockerApplicationPeriod>("/admin/lockers/application-period")
    return response.data
  },
}

// Mock 모드에 따라 API 선택
export const lockerApi = USE_MOCK_API ? mockLockerApi : realLockerApi
