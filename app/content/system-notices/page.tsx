"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogRoot, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useCreateSystemNotice, useDeleteSystemNotice, useSystemNotices, useUpdateSystemNotice } from "@/hooks/useSystemNotices"
import type { SystemNotice, SystemNoticeRequest } from "@/types/system-notice"

const emptyForm: SystemNoticeRequest = { title: "", content: "" }

export default function SystemNoticesPage() {
  const { data: notices = [], isLoading, isError, refetch } = useSystemNotices()
  const createNotice = useCreateSystemNotice()
  const updateNotice = useUpdateSystemNotice()
  const deleteNotice = useDeleteSystemNotice()
  const [form, setForm] = useState<SystemNoticeRequest>(emptyForm)
  const [editingNotice, setEditingNotice] = useState<SystemNotice | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SystemNotice | null>(null)

  const isSubmitting = createNotice.isPending || updateNotice.isPending
  const isValid = form.title.trim().length > 0 && form.title.trim().length <= 255 && form.content.trim().length > 0
  const openCreate = () => { setEditingNotice(null); setForm(emptyForm); setFormOpen(true) }
  const openEdit = (notice: SystemNotice) => { setEditingNotice(notice); setForm({ title: notice.title, content: notice.content }); setFormOpen(true) }
  const handleSave = () => {
    if (!isValid) return
    const data = { title: form.title.trim(), content: form.content.trim() }
    if (editingNotice) updateNotice.mutate({ id: editingNotice.id, data }, { onSuccess: () => setFormOpen(false) })
    else createNotice.mutate(data, { onSuccess: () => setFormOpen(false) })
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <PageHeader title="시스템 공지 관리" description="모든 사용자에게 표시되는 시스템 공지를 관리합니다." breadcrumbs={[{ label: "게시판 관리", href: "/content/boards" }, { label: "시스템 공지" }]} />
      <Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" />공지 등록</Button>
    </div>
    <Card><CardContent className="p-0">
      {isLoading ? <div className="space-y-3 p-6">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-10 animate-pulse rounded bg-muted" />)}</div>
      : isError ? <div className="p-12 text-center"><p className="mb-4 text-destructive">시스템 공지를 불러오지 못했습니다.</p><Button variant="outline" onClick={() => refetch()}>다시 시도</Button></div>
      : notices.length === 0 ? <div className="p-12 text-center text-muted-foreground">등록된 시스템 공지가 없습니다.</div>
      : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>제목</TableHead><TableHead>작성자</TableHead><TableHead>등록일</TableHead><TableHead className="w-[180px] text-right">관리</TableHead></TableRow></TableHeader><TableBody>
        {notices.map((notice) => <TableRow key={notice.id}><TableCell className="min-w-64"><p className="font-medium">{notice.title}</p><p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{notice.content}</p></TableCell><TableCell>{notice.authorName}</TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{format(new Date(notice.createdAt), "yyyy년 M월 d일 HH:mm", { locale: ko })}</TableCell><TableCell><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => openEdit(notice)}><Pencil className="mr-1 h-4 w-4" />수정</Button><Button variant="destructive" size="sm" onClick={() => setDeleteTarget(notice)}><Trash2 className="mr-1 h-4 w-4" />삭제</Button></div></TableCell></TableRow>)}
      </TableBody></Table></div>}
    </CardContent></Card>
    <FormDialog open={formOpen} onOpenChange={setFormOpen} title={editingNotice ? "시스템 공지 수정" : "시스템 공지 등록"} description={editingNotice ? "수정해도 알림은 다시 발송되지 않습니다." : "등록 시 알림 설정을 만족하는 사용자에게 알림이 발송됩니다."} confirmText={editingNotice ? "수정" : "등록"} onConfirm={handleSave} isLoading={isSubmitting} confirmDisabled={!isValid}>
      <div className="space-y-2"><Label htmlFor="system-notice-title">제목 <span className="text-destructive">*</span></Label><Input id="system-notice-title" value={form.title} maxLength={255} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="공지 제목을 입력하세요" /><p className="text-right text-xs text-muted-foreground">{form.title.length}/255</p></div>
      <div className="space-y-2"><Label htmlFor="system-notice-content">내용 <span className="text-destructive">*</span></Label><Textarea id="system-notice-content" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="공지 내용을 입력하세요" className="min-h-48" /></div>
    </FormDialog>
    <AlertDialogRoot open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>시스템 공지를 삭제할까요?</AlertDialogTitle><AlertDialogDescription>삭제된 공지는 복구할 수 없습니다.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><Button variant="destructive" disabled={deleteNotice.isPending} onClick={() => deleteTarget && deleteNotice.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}>{deleteNotice.isPending ? "삭제 중..." : "삭제"}</Button></AlertDialogFooter></AlertDialogContent></AlertDialogRoot>
  </div>
}
