import type { EmailCampaignStatus } from "@/types/email-campaign"

interface CampaignDraftInput {
  subject: string
  htmlText: string
  admissionYears: number[]
}

export interface CampaignDraftErrors {
  subject?: string
  html?: string
  admissionYears?: string
}

export function getCampaignDraftErrors(input: CampaignDraftInput): CampaignDraftErrors {
  const errors: CampaignDraftErrors = {}
  const subject = input.subject.trim()
  if (!subject) errors.subject = "제목을 입력해 주세요."
  else if (subject.length > 255) errors.subject = "제목은 255자 이하로 입력해 주세요."
  if (!input.htmlText.trim()) errors.html = "본문을 입력해 주세요."
  if (input.admissionYears.some((year) => year < 1900 || year > 2100)) {
    errors.admissionYears = "입학연도는 1900년부터 2100년까지 입력할 수 있습니다."
  }
  return errors
}

export const isCampaignInProgress = (status: EmailCampaignStatus): boolean =>
  status === "QUEUED" || status === "SENDING"
