"use client"

import { SystemAdminGuard } from "@/components/auth/SystemAdminGuard"
import { EmailCampaignComposer } from "@/components/email-campaign/EmailCampaignComposer"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { useEmailCampaign } from "@/hooks/useEmailCampaigns"

export default function EditEmailCampaignPage({ params }: { params: { campaignId: string } }) {
  return <SystemAdminGuard><EditContent id={params.campaignId}/></SystemAdminGuard>
}

function EditContent({ id }: { id: string }) {
  const { data: campaign, isLoading } = useEmailCampaign(id)
  if (isLoading) return <Skeleton className="h-96 w-full"/>
  if (!campaign) return <p className="py-16 text-center text-muted-foreground">캠페인을 찾을 수 없습니다.</p>
  if (campaign.status !== "DRAFT") return <p className="py-16 text-center text-muted-foreground">초안 상태의 캠페인만 수정할 수 있습니다.</p>
  return <div className="space-y-6"><PageHeader title="이메일 캠페인 수정" description="제목, 본문과 수신자 대상을 전체 교체합니다." breadcrumbs={[{ label: "이메일 캠페인", href: "/admin/email-campaigns" }, { label: campaign.subject, href: `/admin/email-campaigns/${id}` }, { label: "수정" }]}/><EmailCampaignComposer campaign={campaign}/></div>
}
