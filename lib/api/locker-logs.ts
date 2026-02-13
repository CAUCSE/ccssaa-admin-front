import { api } from "../api"
import type {
  LockerLog,
  LockerLogListParams,
  LockerLogListResponse,
} from "@/types/locker"

export const lockerLogApi = {
  // 로그 목록 조회
  getLogs: async (params: LockerLogListParams): Promise<LockerLogListResponse> => {
    const res = await api.get<LockerLogListResponse>("/admin/logs", { params })
    return res.data
  },
}

