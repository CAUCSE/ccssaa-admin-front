"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Save } from "lucide-react"
import { EmailHtmlEditor } from "./EmailHtmlEditor"
import { useCreateEmailCampaign, usePreviewEmailCampaignTargets, useUpdateEmailCampaign } from "@/hooks/useEmailCampaigns"
import { getCampaignDraftErrors, normalizeRecipientEmails, type CampaignDraftErrors } from "@/lib/utils/email-campaign"
import { getApiErrorStatus } from "@/lib/api-error"
import type { EmailCampaign, EmailCampaignAcademicStatus, EmailCampaignDepartment, EmailCampaignFilter } from "@/types/email-campaign"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type TargetMode = "FILTER" | "EMAILS"
const departments: Array<[EmailCampaignDepartment, string]> = [["DEPT_OF_AI", "AI학과"], ["SCHOOL_OF_SW", "소프트웨어학부"], ["SCHOOL_OF_CSE", "컴퓨터공학부"], ["DEPT_OF_CSE", "컴퓨터공학과"], ["DEPT_OF_CS", "컴퓨터과학과"]]
const statuses: Array<[EmailCampaignAcademicStatus, string]> = [["ENROLLED", "재학"], ["GRADUATED", "졸업"], ["UNDETERMINED", "미정"]]
const emptyFilter: EmailCampaignFilter = { admissionYears: [], departments: [], academicStatuses: [] }

function parseFilter(campaign?: EmailCampaign): EmailCampaignFilter {
  if (!campaign?.filterJson) return emptyFilter
  try { return { ...emptyFilter, ...JSON.parse(campaign.filterJson) as EmailCampaignFilter } } catch { return emptyFilter }
}

export function EmailCampaignComposer({ campaign }: { campaign?: EmailCampaign }) {
  const router = useRouter()
  const initialFilter = useMemo(() => parseFilter(campaign), [campaign])
  const hasStoredFilter = !!(initialFilter.admissionYears?.length || initialFilter.departments?.length || initialFilter.academicStatuses?.length)
  const [targetMode, setTargetMode] = useState<TargetMode | null>(campaign && !hasStoredFilter ? null : "FILTER")
  const [subject, setSubject] = useState(campaign?.subject ?? "")
  const [html, setHtml] = useState(campaign?.sanitizedHtml ?? "")
  const [htmlText, setHtmlText] = useState(campaign?.sanitizedHtml?.replace(/<[^>]*>/g, " ") ?? "")
  const [yearInput, setYearInput] = useState("")
  const [years, setYears] = useState<number[]>(initialFilter.admissionYears ?? [])
  const [selectedDepartments, setDepartments] = useState<EmailCampaignDepartment[]>(initialFilter.departments ?? [])
  const [selectedStatuses, setStatuses] = useState<EmailCampaignAcademicStatus[]>(initialFilter.academicStatuses ?? [])
  const [emailInput, setEmailInput] = useState("")
  const [errors, setErrors] = useState<CampaignDraftErrors>({})
  const preview = usePreviewEmailCampaignTargets()
  const create = useCreateEmailCampaign()
  const update = useUpdateEmailCampaign(campaign?.id ?? "")
  const filter = useMemo<EmailCampaignFilter>(() => ({ admissionYears: years, departments: selectedDepartments, academicStatuses: selectedStatuses }), [selectedDepartments, selectedStatuses, years])
  const recipientEmails = useMemo(() => normalizeRecipientEmails(emailInput), [emailInput])
  const requestTarget = targetMode === "EMAILS" ? { filter: emptyFilter, recipientEmails } : { filter, recipientEmails: null }
  const isSaving = create.isPending || update.isPending
  const toggle = <T,>(value: T, values: T[], setValues: (next: T[]) => void) => setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  const addYear = () => { const value = Number(yearInput); if (Number.isInteger(value) && value >= 1900 && value <= 2100) { setYears((current) => [...new Set([...current, value])].sort((a, b) => b - a)); setYearInput(""); setErrors((current) => ({ ...current, admissionYears: undefined })) } else setErrors((current) => ({ ...current, admissionYears: "입학연도는 1900년부터 2100년까지 입력할 수 있습니다." })) }
  const handleSave = () => {
    if (!targetMode) { setErrors((current) => ({ ...current, recipientEmails: "수정할 대상 방식을 선택해 주세요." })); return }
    const next = getCampaignDraftErrors({ subject, htmlText, admissionYears: years, targetMode, recipientEmails })
    setErrors(next)
    if (Object.keys(next).length) return
    const payload = { subject: subject.trim(), html, ...requestTarget }
    const onSuccess = (saved: EmailCampaign) => router.push(`/admin/email-campaigns/${saved.id}`)
    if (campaign) update.mutate(payload, { onSuccess, onError: (error) => { if (getApiErrorStatus(error) === 409) router.replace(`/admin/email-campaigns/${campaign.id}`) } })
    else create.mutate(payload, { onSuccess })
  }
  const selectMode = (mode: TargetMode) => { setTargetMode(mode); preview.reset(); setErrors((current) => ({ ...current, recipientEmails: undefined })) }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
    <Card><CardHeader><CardTitle>이메일 작성</CardTitle><CardDescription>저장 시 서버가 HTML을 정제하며, 상세 화면의 정제본이 실제 발송 기준입니다.</CardDescription></CardHeader><CardContent className="space-y-5">
      <div className="space-y-2"><Label htmlFor="subject">제목 *</Label><Input id="subject" maxLength={255} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="이메일 제목" aria-invalid={!!errors.subject}/>{errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}<p className="text-right text-xs text-muted-foreground">{subject.length}/255</p></div>
      <div className="space-y-2"><Label>본문 *</Label><EmailHtmlEditor value={html} onChange={(nextHtml, text) => { setHtml(nextHtml); setHtmlText(text) }} error={errors.html}/>{errors.html && <p className="text-sm text-destructive">{errors.html}</p>}</div>
    </CardContent></Card>
    <div className="space-y-6"><Card><CardHeader><CardTitle>발송 대상</CardTitle><CardDescription>{campaign && !hasStoredFilter ? "기존 특정 이메일 목록은 API에서 제공되지 않습니다. 대상을 다시 선택해 주세요." : "조건 필터 또는 특정 회원 이메일 중 하나를 선택합니다."}</CardDescription></CardHeader><CardContent className="space-y-5">
      <div className="grid grid-cols-2 gap-2"><Button type="button" variant={targetMode === "FILTER" ? "default" : "outline"} onClick={() => selectMode("FILTER")}>조건 필터</Button><Button type="button" variant={targetMode === "EMAILS" ? "default" : "outline"} onClick={() => selectMode("EMAILS")}>특정 이메일</Button></div>
      {targetMode === "EMAILS" ? <div className="space-y-2"><Label htmlFor="recipientEmails">회원 이메일 *</Label><Textarea id="recipientEmails" rows={8} value={emailInput} onChange={(event) => setEmailInput(event.target.value)} placeholder={"tester1@example.com\ntester2@example.com"}/><p className="text-xs text-muted-foreground">쉼표 또는 줄바꿈으로 구분합니다. 등록된 활성 회원이 아닌 이메일이 하나라도 있으면 요청 전체가 실패합니다.</p><p className="text-sm font-medium">중복 제거 후 {recipientEmails.length.toLocaleString()}개</p>{errors.recipientEmails && <p className="text-sm text-destructive">{errors.recipientEmails}</p>}</div> : targetMode === "FILTER" ? <>
        <div className="space-y-2"><Label>입학연도</Label><div className="flex gap-2"><Input type="number" min={1900} max={2100} value={yearInput} onChange={(e) => setYearInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addYear() } }} placeholder="예: 2024"/><Button type="button" variant="outline" onClick={addYear}>추가</Button></div>{errors.admissionYears && <p className="text-sm text-destructive">{errors.admissionYears}</p>}<div className="flex flex-wrap gap-2">{years.map((year) => <button type="button" key={year} onClick={() => setYears(years.filter((item) => item !== year))} className="rounded-full bg-secondary px-3 py-1 text-xs">{year} ×</button>)}</div></div>
        <CheckGroup label="학과" options={departments} values={selectedDepartments} onToggle={(value) => toggle(value, selectedDepartments, setDepartments)}/><CheckGroup label="학적 상태" options={statuses} values={selectedStatuses} onToggle={(value) => toggle(value, selectedStatuses, setStatuses)}/>
      </> : <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">대상 방식을 선택해야 수정할 수 있습니다.</p>}
      <Button type="button" variant="outline" className="w-full" onClick={() => targetMode && preview.mutate(requestTarget)} disabled={preview.isPending || !targetMode}><Eye className="mr-2 h-4 w-4"/>{preview.isPending ? "조회 중..." : "대상 미리보기"}</Button>
      {preview.data && <div className="rounded-lg border bg-muted/30 p-4"><p className="text-sm text-muted-foreground">현재 조건 예상 수신자</p><p className="mt-1 text-3xl font-bold">{preview.data.recipientCount.toLocaleString()}명</p><p className="mt-2 text-xs text-muted-foreground">저장 시점에 대상이 다시 확정되어 인원이 달라질 수 있습니다.</p></div>}
    </CardContent></Card><Button className="w-full" size="lg" onClick={handleSave} disabled={isSaving || !preview.data}><Save className="mr-2 h-4 w-4"/>{isSaving ? "저장 중..." : campaign ? "초안 수정" : "초안 생성"}</Button>{!preview.data && <p className="text-center text-xs text-muted-foreground">대상 미리보기 후 저장할 수 있습니다.</p>}</div>
  </div>
}

function CheckGroup<T extends string>({ label, options, values, onToggle }: { label: string; options: Array<[T, string]>; values: T[]; onToggle: (value: T) => void }) {
  return <fieldset className="space-y-2"><legend className="text-sm font-medium">{label}</legend><div className="grid gap-2">{options.map(([value, text]) => <label key={value} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={values.includes(value)} onCheckedChange={() => onToggle(value)}/>{text}</label>)}</div></fieldset>
}
