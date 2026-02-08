/**
 * v2 학적 상태 변경 요청 API
 * GET   /api/v2/admin/academic-records/applications (목록)
 * GET   /api/v2/admin/academic-records/applications/{applicationId} (상세)
 * PATCH /api/v2/admin/academic-records/applications/{applicationId}/approve (승인)
 * PATCH /api/v2/admin/academic-records/applications/{applicationId}/reject (거절)
 */

import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import { mockAcademicRecordsApi } from "@/lib/mock/academic-records"
import type { ApiResponse } from "@/types/api-v2"
import type {
  AcademicRecordApplicationListPayload,
  AcademicRecordApplicationDetail,
  AcademicRecordListParams,
} from "@/types/academic-record"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

/** 학적 상태 변경 요청 목록 조회 */
export async function getAcademicRecordApplications(
  params?: AcademicRecordListParams
): Promise<AcademicRecordApplicationListPayload> {
  if (USE_MOCK_API) return mockAcademicRecordsApi.getApplications(params)

  const query: Record<string, string | number | undefined> = {}
  if (params?.page != null) query.page = params.page
  if (params?.size != null) query.size = params.size
  if (params?.requestStatus && params.requestStatus !== "ALL") {
    query.requestStatus = params.requestStatus
  }
  if (params?.department && params.department !== "ALL") {
    query.department = params.department
  }
  if (params?.keyword) {
    query.keyword = params.keyword
  }

  const res = await apiV2.get<ApiResponse<AcademicRecordApplicationListPayload>>(
    "/admin/academic-records/applications",
    { params: query }
  )
  return unwrapV2(res)
}

/** 학적 상태 변경 요청 상세 조회 */
export async function getAcademicRecordApplicationDetail(
  applicationId: string
): Promise<AcademicRecordApplicationDetail | null> {
  if (USE_MOCK_API) return mockAcademicRecordsApi.getApplicationDetail(applicationId)

  const res = await apiV2.get<ApiResponse<AcademicRecordApplicationDetail>>(
    `/admin/academic-records/applications/${encodeURIComponent(applicationId)}`
  )
  return unwrapV2(res) ?? null
}

/** 학적 상태 변경 요청 승인 */
export async function approveAcademicRecordApplication(
  applicationId: string
): Promise<unknown> {
  if (USE_MOCK_API) return mockAcademicRecordsApi.approve(applicationId)

  const res = await apiV2.post<ApiResponse<unknown>>(
    `/admin/academic-records/applications/${encodeURIComponent(applicationId)}/approve`
  )
  return unwrapV2(res)
}

/** 학적 상태 변경 요청 거절 */
export async function rejectAcademicRecordApplication(
  applicationId: string,
  rejectReason: string
): Promise<unknown> {
  if (USE_MOCK_API) return mockAcademicRecordsApi.reject(applicationId, rejectReason)

  const res = await apiV2.post<ApiResponse<unknown>>(
    `/admin/academic-records/applications/${encodeURIComponent(applicationId)}/reject`,
    { rejectReason }
  )
  return unwrapV2(res)
}
