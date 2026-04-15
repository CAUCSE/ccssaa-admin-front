/**
 * v2 사물함 정책 API
 * GET  /api/v2/admin/lockers/policy
 * PUT  /api/v2/admin/lockers/policy/register-period  (registerStartAt, registerEndAt, expiredAt)
 * PUT  /api/v2/admin/lockers/policy/extend-period
 * PUT  /api/v2/admin/lockers/policy/register-status  (status: boolean)
 * PUT  /api/v2/admin/lockers/policy/extend-status    (status: boolean)
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  LockerPolicyV2,
  LockerPolicyRegisterPeriodRequest,
  LockerPolicyExtendPeriodRequest,
  LockerPolicyStatusRequest,
} from "@/types/locker"

/** v2 사물함 정책 조회 — GET /api/v2/admin/lockers/policy */
export async function getLockerPolicyV2(): Promise<LockerPolicyV2> {
  const res = await apiV2.get<ApiResponse<LockerPolicyV2>>("/admin/lockers/policy")
  return unwrapV2(res) as LockerPolicyV2
}

/** 신청 기간 + 만료일 설정 — PUT /api/v2/admin/lockers/policy/register-period */
export async function updateLockerPolicyRegisterPeriodV2(
  data: LockerPolicyRegisterPeriodRequest
): Promise<void> {
  await unwrapV2(
    await apiV2.put<ApiResponse<LockerPolicyV2>>("/admin/lockers/policy/register-period", data)
  )
}

/** 연장 기간 설정 — PUT /api/v2/admin/lockers/policy/extend-period */
export async function updateLockerPolicyExtendPeriodV2(
  data: LockerPolicyExtendPeriodRequest
): Promise<void> {
  await unwrapV2(
    await apiV2.put<ApiResponse<LockerPolicyV2>>("/admin/lockers/policy/extend-period", data)
  )
}

/** 사물함 신청 가능 상태 — PUT /api/v2/admin/lockers/policy/register-status */
export async function updateLockerPolicyRegisterStatusV2(
  data: LockerPolicyStatusRequest
): Promise<void> {
  await unwrapV2(
    await apiV2.put<ApiResponse<LockerPolicyV2>>("/admin/lockers/policy/register-status", data)
  )
}

/** 사물함 연장 가능 상태 — PUT /api/v2/admin/lockers/policy/extend-status */
export async function updateLockerPolicyExtendStatusV2(
  data: LockerPolicyStatusRequest
): Promise<void> {
  await unwrapV2(
    await apiV2.put<ApiResponse<LockerPolicyV2>>("/admin/lockers/policy/extend-status", data)
  )
}
