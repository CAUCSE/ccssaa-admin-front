"use client"

import { Suspense, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { MailPlus } from "lucide-react"
import { SystemAdminGuard } from "@/components/auth/SystemAdminGuard"
import { PageHeader } from "@/components/layout/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns"
import { formatDateTime } from "@/lib/utils/datetime"
import type { EmailCampaignStatus } from "@/types/email-campaign"

const statusMap: Record<EmailCampaignStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  DRAFT: { label: "초안", variant: "outline" }, QUEUED: { label: "대기", variant: "secondary" }, SENDING: { label: "발송 중", variant: "default" }, COMPLETED: { label: "완료", variant: "secondary" }, PARTIALLY_FAILED: { label: "일부 실패", variant: "destructive" }, FAILED: { label: "실패", variant: "destructive" },
}

function CampaignList() {
  const router = useRouter(); const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1)
  const rawStatus = searchParams.get("status")
  const status = rawStatus && rawStatus !== "ALL" ? rawStatus as EmailCampaignStatus : undefined
  const from = searchParams.get("from") ?? ""; const to = searchParams.get("to") ?? ""
  const params = useMemo(() => ({ status, from: from ? `${from}T00:00:00` : undefined, to: to ? `${to}T23:59:59` : undefined, page: page - 1, size: 10 }), [from, page, status, to])
  const { data, isLoading } = useEmailCampaigns(params)
  const navigate = (nextPage: number, nextStatus: EmailCampaignStatus | null = status ?? null, nextFrom = from, nextTo = to) => { const query = new URLSearchParams(); if (nextStatus) query.set("status", nextStatus); if (nextFrom) query.set("from", nextFrom); if (nextTo) query.set("to", nextTo); if (nextPage > 1) query.set("page", String(nextPage)); router.push(`/admin/email-campaigns${query.size ? `?${query}` : ""}`) }
  return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><PageHeader title="이메일 캠페인" description="회원 대상 이메일을 작성하고 발송 현황을 추적합니다." breadcrumbs={[{ label: "이메일 캠페인" }]}/><Button asChild><Link href="/admin/email-campaigns/new"><MailPlus className="mr-2 h-4 w-4"/>새 캠페인</Link></Button></div>
    <Card><CardContent className="pt-6"><div className="mb-4 grid gap-3 sm:grid-cols-3"><Select value={status ?? "ALL"} onValueChange={(value) => navigate(1, value === "ALL" ? null : value as EmailCampaignStatus)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="ALL">전체 상태</SelectItem>{Object.entries(statusMap).map(([value, item]) => <SelectItem key={value} value={value}>{item.label}</SelectItem>)}</SelectContent></Select><Input type="date" aria-label="조회 시작일" value={from} onChange={(event) => navigate(1, status ?? null, event.target.value, to)}/><Input type="date" aria-label="조회 종료일" value={to} min={from || undefined} onChange={(event) => navigate(1, status ?? null, from, event.target.value)}/></div>
      <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>제목</TableHead><TableHead>상태</TableHead><TableHead className="text-right">대상</TableHead><TableHead className="text-right">성공</TableHead><TableHead className="text-right">실패</TableHead><TableHead>생성일</TableHead></TableRow></TableHeader><TableBody>
        {isLoading ? Array.from({ length: 4 }, (_, i) => <TableRow key={i}>{Array.from({ length: 6 }, (_, j) => <TableCell key={j}><Skeleton className="h-5 w-full"/></TableCell>)}</TableRow>) : !data?.content.length ? <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">등록된 이메일 캠페인이 없습니다.</TableCell></TableRow> : data.content.map((campaign) => <TableRow key={campaign.id} className="cursor-pointer" onClick={() => router.push(`/admin/email-campaigns/${campaign.id}`)}><TableCell className="font-medium">{campaign.subject}</TableCell><TableCell><Badge variant={statusMap[campaign.status].variant}>{statusMap[campaign.status].label}</Badge></TableCell><TableCell className="text-right">{campaign.recipientCount.toLocaleString()}</TableCell><TableCell className="text-right">{campaign.sentCount.toLocaleString()}</TableCell><TableCell className="text-right">{campaign.failedCount.toLocaleString()}</TableCell><TableCell>{formatDateTime(campaign.createdAt)}</TableCell></TableRow>)}
      </TableBody></Table></div>
      {data && data.totalPages > 1 && <div className="mt-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">총 {data.totalElements.toLocaleString()}건</p><div className="flex gap-2"><Button variant="outline" disabled={!data.hasPrev} onClick={() => navigate(page - 1)}>이전</Button><Button variant="outline" disabled={!data.hasNext} onClick={() => navigate(page + 1)}>다음</Button></div></div>}
    </CardContent></Card></div>
}

export default function EmailCampaignsPage() { return <SystemAdminGuard><Suspense fallback={<div className="p-6"><Skeleton className="h-64 w-full"/></div>}><CampaignList/></Suspense></SystemAdminGuard> }
