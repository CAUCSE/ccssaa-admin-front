import { useQuery } from "@tanstack/react-query"
import { admissionApi } from "@/lib/api/admissions"
import type { AdmissionListParams } from "@/types/admission"

export function useAdmissions(params: AdmissionListParams) {
  return useQuery({
    queryKey: ["admissions", params],
    queryFn: () => admissionApi.getAdmissions(params),
  })
}

export function useAdmissionDetail(admissionId: string) {
  return useQuery({
    queryKey: ["admission", admissionId],
    queryFn: () => admissionApi.getAdmissionDetail(admissionId),
    enabled: !!admissionId,
  })
}
