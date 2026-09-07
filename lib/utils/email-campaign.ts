import type { EmailCampaignStatus } from "@/types/email-campaign"

interface CampaignDraftInput {
  subject: string
  htmlText: string
  admissionYears: number[]
  targetMode?: "FILTER" | "EMAILS" | null
  recipientEmails?: string[]
}

export interface CampaignDraftErrors {
  subject?: string
  html?: string
  admissionYears?: string
  recipientEmails?: string
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
  if (input.targetMode === "EMAILS" && !input.recipientEmails?.length) {
    errors.recipientEmails = "대상 이메일을 한 개 이상 입력해 주세요."
  }
  return errors
}

export function normalizeRecipientEmails(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((email) => email.trim().toLowerCase()).filter(Boolean))]
}

export const isCampaignInProgress = (status: EmailCampaignStatus): boolean =>
  status === "QUEUED" || status === "SENDING"
