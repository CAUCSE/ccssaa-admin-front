import type {
  AdmissionListParams,
  AdmissionListResponse,
  AdmissionDetail,
} from "@/types/admission"
import { mockAdmissionApi } from "../mock/admissions"
import { getAdmissions as getAdmissionsV2, getAdmissionDetail as getAdmissionDetailV2 } from "./v2/admissions"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

const realAdmissionApi = {
  getAdmissions: (params: AdmissionListParams): Promise<AdmissionListResponse> =>
    getAdmissionsV2(params),

  getAdmissionDetail: (admissionId: string): Promise<AdmissionDetail> =>
    getAdmissionDetailV2(admissionId),
}

export const admissionApi = USE_MOCK_API ? mockAdmissionApi : realAdmissionApi
