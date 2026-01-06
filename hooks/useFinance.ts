import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { financeApi } from "@/lib/api/finance"
import type { FinanceListParams, PaymentStatus } from "@/types/finance"
import { toast } from "sonner"

// 재정 리스트 조회
export function useFinanceRecords(params: FinanceListParams) {
  return useQuery({
    queryKey: ["admin-finance", params],
    queryFn: () => financeApi.getFinanceRecords(params),
  })
}

// 납부 상태 업데이트
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recordId, status }: { recordId: number; status: PaymentStatus }) =>
      financeApi.updatePaymentStatus(recordId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-finance"] })
      toast.success("납부 상태가 변경되었습니다.")
    },
    onError: () => {
      toast.error("납부 상태 변경에 실패했습니다.")
    },
  })
}

