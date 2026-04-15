import { api } from "../api"
import type {
  LockerLog,
  LockerLogListParams,
  LockerLogListResponse,
} from "@/types/locker"
import type { ApiResponse } from "@/types/api-v2"
import { unwrapV2 } from "./v2/response"

export const lockerLogApi = {
  // 로그 목록 조회
  getLogs: async (params: LockerLogListParams): Promise<LockerLogListResponse> => {
    const res = await api.get<ApiResponse<LockerLogListResponse>>("/admin/logs", {
      params,
    })
    return unwrapV2(res)
  },
}
