import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"
import { createEmailCampaign, deleteEmailCampaign, getEmailCampaign, getEmailCampaignRecipients, getEmailCampaigns, previewEmailCampaignTargets, sendEmailCampaign, updateEmailCampaign } from "@/lib/api/v2/email-campaigns"
import { isCampaignInProgress } from "@/lib/utils/email-campaign"
import { getApiErrorStatus } from "@/lib/api-error"
import type { CreateEmailCampaignRequest, EmailCampaignListParams, EmailCampaignRecipientListParams, EmailCampaignTargetRequest, SendEmailCampaignRequest, UpdateEmailCampaignRequest } from "@/types/email-campaign"

export const EMAIL_CAMPAIGNS_KEY = ["email-campaigns"] as const

export const useEmailCampaigns = (params: EmailCampaignListParams) => useQuery({ queryKey: [...EMAIL_CAMPAIGNS_KEY, "list", params], queryFn: () => getEmailCampaigns(params) })

export const useEmailCampaign = (id: string) => useQuery({
  queryKey: [...EMAIL_CAMPAIGNS_KEY, "detail", id], queryFn: () => getEmailCampaign(id), enabled: !!id,
  refetchInterval: (query) => query.state.data && isCampaignInProgress(query.state.data.status) ? 3000 : false,
})

export const useEmailCampaignRecipients = (id: string, params: EmailCampaignRecipientListParams, enabled = true, shouldPoll = false) => useQuery({ queryKey: [...EMAIL_CAMPAIGNS_KEY, "recipients", id, params], queryFn: () => getEmailCampaignRecipients(id, params), enabled: !!id && enabled, refetchInterval: shouldPoll ? 5000 : false })

function useCampaignMutation<T, R>(mutationFn: (value: T) => Promise<R>, successMessage?: string) {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({ mutationFn, onSuccess: () => { queryClient.invalidateQueries({ queryKey: EMAIL_CAMPAIGNS_KEY }); if (successMessage) toast.success(successMessage) }, onError: (error) => { if (getApiErrorStatus(error) === 409) queryClient.invalidateQueries({ queryKey: EMAIL_CAMPAIGNS_KEY }); showError?.(error) } })
}

export const usePreviewEmailCampaignTargets = () => useCampaignMutation<EmailCampaignTargetRequest, Awaited<ReturnType<typeof previewEmailCampaignTargets>>>(previewEmailCampaignTargets)
export const useCreateEmailCampaign = () => useCampaignMutation<CreateEmailCampaignRequest, Awaited<ReturnType<typeof createEmailCampaign>>>(createEmailCampaign, "이메일 캠페인 초안이 생성되었습니다.")
export const useSendEmailCampaign = (id: string) => useCampaignMutation<SendEmailCampaignRequest, Awaited<ReturnType<typeof sendEmailCampaign>>>((data) => sendEmailCampaign(id, data), "이메일 발송 요청이 등록되었습니다.")
export const useUpdateEmailCampaign = (id: string) => useCampaignMutation<UpdateEmailCampaignRequest, Awaited<ReturnType<typeof updateEmailCampaign>>>((data) => updateEmailCampaign(id, data), "이메일 캠페인 초안이 수정되었습니다.")

export function useDeleteEmailCampaign(id: string) {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn: () => deleteEmailCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMAIL_CAMPAIGNS_KEY })
      queryClient.removeQueries({ queryKey: [...EMAIL_CAMPAIGNS_KEY, "detail", id] })
      queryClient.removeQueries({ queryKey: [...EMAIL_CAMPAIGNS_KEY, "recipients", id] })
      toast.success("이메일 캠페인 초안이 삭제되었습니다.")
    },
    onError: (error) => { if (getApiErrorStatus(error) === 409) queryClient.invalidateQueries({ queryKey: EMAIL_CAMPAIGNS_KEY }); showError?.(error) },
  })
}
