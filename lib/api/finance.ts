import { api } from "../api"
import type {
  FinanceRecord,
  FinanceListParams,
  FinanceListResponse,
} from "@/types/finance"
import { mockFinanceApi } from "../mock/finance"

// 환경 변수로 Mock 모드 제어
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realFinanceApi = {
  // 재정 리스트 조회
  getFinanceRecords: async (params: FinanceListParams): Promise<FinanceListResponse> => {
    const response = await api.get<FinanceListResponse>("/admin/finance", { params })
    return response.data
  },

  // 납부 상태 업데이트
  updatePaymentStatus: async (recordId: number, status: FinanceRecord["status"]): Promise<void> => {
    await api.patch(`/admin/finance/${recordId}/status`, { status })
  },
}

// Mock 모드에 따라 API 선택
export const financeApi = USE_MOCK_API ? mockFinanceApi : realFinanceApi

