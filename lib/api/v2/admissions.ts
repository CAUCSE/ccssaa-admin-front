import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"
import type {
  AdmissionListParams,
  AdmissionListResponse,
  AdmissionDetail,
  AdmissionSummary,
} from "@/types/admission"

type RawAdmissionListResponse = {
  content: AdmissionSummary[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * 인증 신청 목록 조회
 * GET /api/v2/admin/users/admissions
 */
export async function getAdmissions(
  params: AdmissionListParams
): Promise<AdmissionListResponse> {
  const query: Record<string, string | number | undefined> = {
    page: params.page ?? 0,
    size: params.size ?? 10,
  }

  if (params.keyword) query.keyword = params.keyword
  if (params.userState) query.userState = params.userState
  if (params.sort) query.sort = params.sort

  const res = await apiV2.get<ApiResponse<RawAdmissionListResponse>>(
    "/admin/users/admissions",
    { params: query }
  )
  return unwrapV2(res) as AdmissionListResponse
}

/**
 * 인증 신청 상세 조회
 * GET /api/v2/admin/users/admissions/{admissionId}
 */
export async function getAdmissionDetail(
  admissionId: string
): Promise<AdmissionDetail> {
  const res = await apiV2.get<ApiResponse<AdmissionDetail>>(
    `/admin/users/admissions/${admissionId}`
  )
  return unwrapV2(res) as AdmissionDetail
}
