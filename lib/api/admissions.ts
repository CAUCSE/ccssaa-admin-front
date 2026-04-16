import type {
  AdmissionListParams,
  AdmissionListResponse,
  AdmissionDetail,
  RejectAdmissionRequest,
} from "@/types/admission"
import { mockAdmissionApi } from "../mock/admissions"
import {
  getAdmissions as getAdmissionsV2,
  getAdmissionDetail as getAdmissionDetailV2,
  approveAdmission as approveAdmissionV2,
  rejectAdmission as rejectAdmissionV2,
} from "./v2/admissions"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

const realAdmissionApi = {
  getAdmissions: (params: AdmissionListParams): Promise<AdmissionListResponse> =>
    getAdmissionsV2(params),

  getAdmissionDetail: (admissionId: string): Promise<AdmissionDetail> =>
    getAdmissionDetailV2(admissionId),

  approveAdmission: (admissionId: string): Promise<void> =>
    approveAdmissionV2(admissionId),

  rejectAdmission: (admissionId: string, data: RejectAdmissionRequest): Promise<void> =>
    rejectAdmissionV2(admissionId, data),
}

export const admissionApi = USE_MOCK_API ? mockAdmissionApi : realAdmissionApi
