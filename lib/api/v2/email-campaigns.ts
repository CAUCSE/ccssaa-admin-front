import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import { mockEmailCampaignApi } from "@/lib/mock/email-campaigns"
import type { ApiResponse } from "@/types/api-v2"
import type {
  CreateEmailCampaignRequest,
  EmailCampaign,
  EmailCampaignFilter,
  EmailCampaignListParams,
  EmailCampaignRecipient,
  EmailCampaignRecipientListParams,
  EmailCampaignTargetPreview,
  EmailCampaignTargetRequest,
  PageResponse,
  SendEmailCampaignRequest,
  UpdateEmailCampaignRequest,
} from "@/types/email-campaign"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

export async function previewEmailCampaignTargets(data: EmailCampaignTargetRequest): Promise<EmailCampaignTargetPreview> {
  if (USE_MOCK_API) return mockEmailCampaignApi.preview(data)
  const response = await apiV2.post<ApiResponse<EmailCampaignTargetPreview>>("/admin/email-campaigns/target-preview", data)
  return unwrapV2(response)
}

export async function updateEmailCampaign(id: string, data: UpdateEmailCampaignRequest): Promise<EmailCampaign> {
  if (USE_MOCK_API) return mockEmailCampaignApi.update(id, data)
  const response = await apiV2.put<ApiResponse<EmailCampaign>>(`/admin/email-campaigns/${encodeURIComponent(id)}`, data)
  return unwrapV2(response)
}

export async function deleteEmailCampaign(id: string): Promise<void> {
  if (USE_MOCK_API) return mockEmailCampaignApi.remove(id)
  const response = await apiV2.delete<ApiResponse<void>>(`/admin/email-campaigns/${encodeURIComponent(id)}`)
  unwrapV2(response)
}

export async function createEmailCampaign(data: CreateEmailCampaignRequest): Promise<EmailCampaign> {
  if (USE_MOCK_API) return mockEmailCampaignApi.create(data)
  const response = await apiV2.post<ApiResponse<EmailCampaign>>("/admin/email-campaigns", data)
  return unwrapV2(response)
}

export async function sendEmailCampaign(id: string, data: SendEmailCampaignRequest): Promise<EmailCampaign> {
  if (USE_MOCK_API) return mockEmailCampaignApi.send(id, data)
  const response = await apiV2.post<ApiResponse<EmailCampaign>>(`/admin/email-campaigns/${encodeURIComponent(id)}/send`, data)
  return unwrapV2(response)
}

export async function getEmailCampaigns(params: EmailCampaignListParams): Promise<PageResponse<EmailCampaign>> {
  if (USE_MOCK_API) return mockEmailCampaignApi.getAll(params)
  const response = await apiV2.get<ApiResponse<PageResponse<EmailCampaign>>>("/admin/email-campaigns", { params })
  return unwrapV2(response)
}

export async function getEmailCampaign(id: string): Promise<EmailCampaign> {
  if (USE_MOCK_API) return mockEmailCampaignApi.get(id)
  const response = await apiV2.get<ApiResponse<EmailCampaign>>(`/admin/email-campaigns/${encodeURIComponent(id)}`)
  return unwrapV2(response)
}

export async function getEmailCampaignRecipients(id: string, params: EmailCampaignRecipientListParams): Promise<PageResponse<EmailCampaignRecipient>> {
  if (USE_MOCK_API) return mockEmailCampaignApi.getRecipients(id, params)
  const response = await apiV2.get<ApiResponse<PageResponse<EmailCampaignRecipient>>>(`/admin/email-campaigns/${encodeURIComponent(id)}/recipients`, { params })
  return unwrapV2(response)
}
