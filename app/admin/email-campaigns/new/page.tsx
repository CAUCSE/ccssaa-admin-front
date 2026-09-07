import { SystemAdminGuard } from "@/components/auth/SystemAdminGuard"
import { EmailCampaignComposer } from "@/components/email-campaign/EmailCampaignComposer"
import { PageHeader } from "@/components/layout/PageHeader"

export default function NewEmailCampaignPage() {
  return <SystemAdminGuard><div className="space-y-6"><PageHeader title="이메일 캠페인 작성" description="발송 대상을 확인하고 이메일 캠페인 초안을 생성합니다." breadcrumbs={[{ label: "이메일 캠페인", href: "/admin/email-campaigns" }, { label: "새 캠페인" }]}/><EmailCampaignComposer/></div></SystemAdminGuard>
}
