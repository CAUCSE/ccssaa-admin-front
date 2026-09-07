"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { SystemAdminGuard } from "@/components/auth/SystemAdminGuard"
import { PageHeader } from "@/components/layout/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDeleteEmailCampaign, useEmailCampaign, useEmailCampaignRecipients, useSendEmailCampaign } from "@/hooks/useEmailCampaigns"
import { formatDateTime } from "@/lib/utils/datetime"
import { isCampaignInProgress } from "@/lib/utils/email-campaign"
import type { EmailCampaignRecipientStatus } from "@/types/email-campaign"

export default function EmailCampaignDetailPage({ params }: { params: { campaignId: string } }) {
  return <SystemAdminGuard><CampaignDetail id={params.campaignId}/></SystemAdminGuard>
}

function CampaignDetail({ id }: { id: string }) {
  const router = useRouter()
  const { data: campaign, isLoading } = useEmailCampaign(id)
  const [page, setPage] = useState(1); const [status, setStatus] = useState<EmailCampaignRecipientStatus | undefined>(); const [confirmOpen, setConfirmOpen] = useState(false); const [deleteOpen, setDeleteOpen] = useState(false); const [confirmedSubject, setConfirmedSubject] = useState(""); const [confirmedCount, setConfirmedCount] = useState("")
  const recipients = useEmailCampaignRecipients(id, { status, page: page - 1, size: 20 }, !!campaign, campaign ? isCampaignInProgress(campaign.status) : false)
  const send = useSendEmailCampaign(id)
  const remove = useDeleteEmailCampaign(id)
  if (isLoading) return <Skeleton className="h-96 w-full"/>
  if (!campaign) return <p className="py-16 text-center text-muted-foreground">캠페인을 찾을 수 없습니다.</p>
  const canSend = campaign.status === "DRAFT" && campaign.recipientCount > 0
  const confirmMatches = confirmedSubject === campaign.subject && Number(confirmedCount) === campaign.recipientCount
  return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><PageHeader title={campaign.subject} description="서버 정제본과 수신자별 발송 결과를 확인합니다." breadcrumbs={[{ label: "이메일 캠페인", href: "/admin/email-campaigns" }, { label: "상세" }]}/><div className="flex flex-wrap gap-2">{canSend && <><Button variant="outline" asChild><Link href={`/admin/email-campaigns/${id}/edit`}><Pencil className="mr-2 h-4 w-4"/>수정</Link></Button><Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4"/>삭제</Button></>}<Button disabled={!canSend} onClick={() => { setConfirmedSubject(""); setConfirmedCount(""); setConfirmOpen(true) }}>발송 요청</Button></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[["상태", campaign.status], ["전체", campaign.recipientCount], ["대기", campaign.pendingCount], ["성공", campaign.sentCount], ["실패/제외", campaign.failedCount + campaign.skippedCount]].map(([label, value]) => <Card key={label}><CardContent className="pt-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{typeof value === "number" ? value.toLocaleString() : <Badge>{value}</Badge>}</p></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>정제된 이메일 본문</CardTitle></CardHeader><CardContent><div className="email-content rounded-md border bg-white p-6 text-slate-950" dangerouslySetInnerHTML={{ __html: campaign.sanitizedHtml ?? "" }}/><p className="mt-4 text-xs text-muted-foreground">생성 {formatDateTime(campaign.createdAt)}{campaign.completedAt ? ` · 완료 ${formatDateTime(campaign.completedAt)}` : ""}</p></CardContent></Card>
    <Card><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>수신자 결과</CardTitle><Select value={status ?? "ALL"} onValueChange={(value) => { setStatus(value === "ALL" ? undefined : value as EmailCampaignRecipientStatus); setPage(1) }}><SelectTrigger className="w-40"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="ALL">전체 상태</SelectItem>{["PENDING", "SENDING", "SENT", "FAILED", "SKIPPED"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div></CardHeader><CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>이메일</TableHead><TableHead>상태</TableHead><TableHead className="text-right">시도</TableHead><TableHead>최근 시도</TableHead><TableHead>오류 코드</TableHead></TableRow></TableHeader><TableBody>{recipients.isLoading ? <TableRow><TableCell colSpan={5}>불러오는 중...</TableCell></TableRow> : !recipients.data?.content.length ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">수신자가 없습니다.</TableCell></TableRow> : recipients.data.content.map((item) => <TableRow key={item.id}><TableCell>{item.maskedEmail}</TableCell><TableCell><Badge variant={item.status === "FAILED" ? "destructive" : "outline"}>{item.status}</Badge></TableCell><TableCell className="text-right">{item.attemptCount}</TableCell><TableCell>{item.lastAttemptAt ? formatDateTime(item.lastAttemptAt) : "-"}</TableCell><TableCell>{item.lastErrorCode ?? "-"}</TableCell></TableRow>)}</TableBody></Table></div>{recipients.data && <div className="mt-4 flex justify-end gap-2"><Button variant="outline" disabled={!recipients.data.hasPrev} onClick={() => setPage((value) => value - 1)}>이전</Button><Button variant="outline" disabled={!recipients.data.hasNext} onClick={() => setPage((value) => value + 1)}>다음</Button></div>}</CardContent></Card>
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent><DialogHeader><DialogTitle>이메일 발송 최종 확인</DialogTitle><DialogDescription>오발송 방지를 위해 저장된 제목과 수신자 수를 그대로 입력해 주세요. 요청 후에는 취소할 수 없습니다.</DialogDescription></DialogHeader><div className="space-y-4"><div><p className="mb-1 text-sm text-muted-foreground">제목: {campaign.subject}</p><Input value={confirmedSubject} onChange={(e) => setConfirmedSubject(e.target.value)} placeholder="제목을 정확히 입력"/></div><div><p className="mb-1 text-sm text-muted-foreground">수신자 수: {campaign.recipientCount.toLocaleString()}명</p><Input type="number" min={1} value={confirmedCount} onChange={(e) => setConfirmedCount(e.target.value)} placeholder="수신자 수 입력"/></div></div><DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>취소</Button><Button disabled={!confirmMatches || send.isPending} onClick={() => send.mutate({ confirmedSubject, confirmedRecipientCount: Number(confirmedCount) }, { onSuccess: () => setConfirmOpen(false) })}>{send.isPending ? "요청 중..." : "발송 요청"}</Button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="이메일 캠페인 초안 삭제" description="초안과 저장된 수신자 목록이 모두 삭제되며 복구할 수 없습니다." confirmText={remove.isPending ? "삭제 중..." : "삭제"} variant="destructive" onConfirm={() => remove.mutate(undefined, { onSuccess: () => router.replace("/admin/email-campaigns") })}/>
  </div>
}
