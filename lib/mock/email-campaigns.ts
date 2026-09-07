import type { CreateEmailCampaignRequest, EmailCampaign, EmailCampaignListParams, EmailCampaignRecipient, EmailCampaignRecipientListParams, EmailCampaignTargetPreview, EmailCampaignTargetRequest, PageResponse, SendEmailCampaignRequest, UpdateEmailCampaignRequest } from "@/types/email-campaign"

let campaigns: EmailCampaign[] = [{
  id: "campaign-demo-1", subject: "2026 동문회 행사 안내", sanitizedHtml: "<h2>동문회 행사 안내</h2><p>많은 참여 바랍니다.</p>",
  filterJson: JSON.stringify({ admissionYears: [2020, 2021], departments: ["SCHOOL_OF_SW"], academicStatuses: ["ENROLLED", "GRADUATED"] }),
  status: "DRAFT", recipientCount: 120, pendingCount: 120, sentCount: 0, failedCount: 0, skippedCount: 0,
  createdAt: "2026-09-07T12:30:00", completedAt: null,
}]

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms))
const pageOf = <T,>(items: T[], page = 0, size = 10): PageResponse<T> => ({
  content: items.slice(page * size, (page + 1) * size), currentPage: page, size,
  totalPages: Math.ceil(items.length / size), totalElements: items.length,
  hasNext: (page + 1) * size < items.length, hasPrev: page > 0,
})

export const mockEmailCampaignApi = {
  async preview(data: EmailCampaignTargetRequest): Promise<EmailCampaignTargetPreview> {
    await delay()
    const years = data.filter.admissionYears?.length ? data.filter.admissionYears : [2020, 2021]
    const count = data.recipientEmails?.length || years.length * 34
    return { recipientCount: count, admissionYearDistribution: Object.fromEntries(years.map((year) => [String(year), 34])), departmentDistribution: { SCHOOL_OF_SW: count }, academicStatusDistribution: { ENROLLED: count } }
  },
  async create(data: CreateEmailCampaignRequest): Promise<EmailCampaign> {
    await delay()
    const recipientCount = data.recipientEmails?.length || (data.filter.admissionYears?.length || 2) * 34
    const campaign: EmailCampaign = { id: `campaign-${Date.now()}`, subject: data.subject, sanitizedHtml: data.html, filterJson: JSON.stringify(data.filter), status: "DRAFT", recipientCount, pendingCount: recipientCount, sentCount: 0, failedCount: 0, skippedCount: 0, createdAt: new Date().toISOString(), completedAt: null }
    campaigns = [campaign, ...campaigns]
    return { ...campaign }
  },
  async update(id: string, data: UpdateEmailCampaignRequest): Promise<EmailCampaign> {
    await delay()
    const campaign = campaigns.find((item) => item.id === id)
    if (!campaign) throw new Error("캠페인을 찾을 수 없습니다.")
    if (campaign.status !== "DRAFT") throw new Error("초안 상태의 캠페인만 수정할 수 있습니다.")
    const recipientCount = data.recipientEmails?.length || (data.filter.admissionYears?.length || 2) * 34
    Object.assign(campaign, { subject: data.subject, sanitizedHtml: data.html, filterJson: JSON.stringify(data.filter), recipientCount, pendingCount: recipientCount })
    return { ...campaign }
  },
  async remove(id: string): Promise<void> {
    await delay()
    const campaign = campaigns.find((item) => item.id === id)
    if (!campaign) throw new Error("캠페인을 찾을 수 없습니다.")
    if (campaign.status !== "DRAFT") throw new Error("초안 상태의 캠페인만 삭제할 수 있습니다.")
    campaigns = campaigns.filter((item) => item.id !== id)
  },
  async send(id: string, data: SendEmailCampaignRequest): Promise<EmailCampaign> {
    await delay()
    const campaign = campaigns.find((item) => item.id === id)
    if (!campaign) throw new Error("캠페인을 찾을 수 없습니다.")
    if (campaign.subject !== data.confirmedSubject || campaign.recipientCount !== data.confirmedRecipientCount) throw new Error("확인 정보가 일치하지 않습니다.")
    campaign.status = "QUEUED"
    return { ...campaign }
  },
  async getAll(params: EmailCampaignListParams): Promise<PageResponse<EmailCampaign>> {
    await delay()
    const filtered = params.status ? campaigns.filter((item) => item.status === params.status) : campaigns
    return pageOf(filtered.map((item) => ({ ...item, sanitizedHtml: null, filterJson: null })), params.page, params.size)
  },
  async get(id: string): Promise<EmailCampaign> {
    await delay()
    const campaign = campaigns.find((item) => item.id === id)
    if (!campaign) throw new Error("캠페인을 찾을 수 없습니다.")
    return { ...campaign }
  },
  async getRecipients(id: string, params: EmailCampaignRecipientListParams): Promise<PageResponse<EmailCampaignRecipient>> {
    await delay()
    const campaign = campaigns.find((item) => item.id === id)
    if (!campaign) throw new Error("캠페인을 찾을 수 없습니다.")
    const recipients = Array.from({ length: campaign.recipientCount }, (_, index): EmailCampaignRecipient => ({ id: index + 1, maskedEmail: `user${index + 1}***@example.com`, status: campaign.status === "DRAFT" ? "PENDING" : index % 12 === 0 ? "FAILED" : "SENT", attemptCount: campaign.status === "DRAFT" ? 0 : 1, lastAttemptAt: campaign.status === "DRAFT" ? null : new Date().toISOString(), sentAt: campaign.status === "DRAFT" || index % 12 === 0 ? null : new Date().toISOString(), lastErrorCode: index % 12 === 0 && campaign.status !== "DRAFT" ? "SES_REJECTED" : null }))
    const filtered = params.status ? recipients.filter((item) => item.status === params.status) : recipients
    return pageOf(filtered, params.page, params.size)
  },
}
