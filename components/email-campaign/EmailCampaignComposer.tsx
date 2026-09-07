"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Save } from "lucide-react"
import { EmailHtmlEditor } from "./EmailHtmlEditor"
import { useCreateEmailCampaign, usePreviewEmailCampaignTargets } from "@/hooks/useEmailCampaigns"
import { getCampaignDraftErrors, type CampaignDraftErrors } from "@/lib/utils/email-campaign"
import type { EmailCampaignAcademicStatus, EmailCampaignDepartment, EmailCampaignFilter } from "@/types/email-campaign"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const departments: Array<[EmailCampaignDepartment, string]> = [["DEPT_OF_AI", "AI학과"], ["SCHOOL_OF_SW", "소프트웨어학부"], ["SCHOOL_OF_CSE", "컴퓨터공학부"], ["DEPT_OF_CSE", "컴퓨터공학과"], ["DEPT_OF_CS", "컴퓨터과학과"]]
const statuses: Array<[EmailCampaignAcademicStatus, string]> = [["ENROLLED", "재학"], ["GRADUATED", "졸업"], ["UNDETERMINED", "미정"]]

export function EmailCampaignComposer() {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [html, setHtml] = useState("")
  const [htmlText, setHtmlText] = useState("")
  const [yearInput, setYearInput] = useState("")
  const [years, setYears] = useState<number[]>([])
  const [selectedDepartments, setDepartments] = useState<EmailCampaignDepartment[]>([])
  const [selectedStatuses, setStatuses] = useState<EmailCampaignAcademicStatus[]>([])
  const [errors, setErrors] = useState<CampaignDraftErrors>({})
  const preview = usePreviewEmailCampaignTargets()
  const create = useCreateEmailCampaign()
  const filter = useMemo<EmailCampaignFilter>(() => ({ admissionYears: years, departments: selectedDepartments, academicStatuses: selectedStatuses }), [selectedDepartments, selectedStatuses, years])
  const toggle = <T,>(value: T, values: T[], setValues: (next: T[]) => void) => setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  const addYear = () => { const value = Number(yearInput); if (Number.isInteger(value) && value >= 1900 && value <= 2100) { setYears((current) => [...new Set([...current, value])].sort((a, b) => b - a)); setYearInput(""); setErrors((current) => ({ ...current, admissionYears: undefined })) } else setErrors((current) => ({ ...current, admissionYears: "입학연도는 1900년부터 2100년까지 입력할 수 있습니다." })) }
  const handleCreate = () => { const next = getCampaignDraftErrors({ subject, htmlText, admissionYears: years }); setErrors(next); if (Object.keys(next).length) return; create.mutate({ subject: subject.trim(), html, filter }, { onSuccess: (campaign) => router.push(`/admin/email-campaigns/${campaign.id}`) }) }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
    <Card><CardHeader><CardTitle>이메일 작성</CardTitle><CardDescription>저장 시 서버가 HTML을 정제하며, 상세 화면의 정제본이 실제 발송 기준입니다.</CardDescription></CardHeader><CardContent className="space-y-5">
      <div className="space-y-2"><Label htmlFor="subject">제목 *</Label><Input id="subject" maxLength={255} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="이메일 제목" aria-invalid={!!errors.subject}/>{errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}<p className="text-right text-xs text-muted-foreground">{subject.length}/255</p></div>
      <div className="space-y-2"><Label>본문 *</Label><EmailHtmlEditor value={html} onChange={(nextHtml, text) => { setHtml(nextHtml); setHtmlText(text) }} error={errors.html}/>{errors.html && <p className="text-sm text-destructive">{errors.html}</p>}</div>
    </CardContent></Card>
    <div className="space-y-6"><Card><CardHeader><CardTitle>발송 대상</CardTitle><CardDescription>선택하지 않은 항목은 제한 없이 포함됩니다.</CardDescription></CardHeader><CardContent className="space-y-5">
      <div className="space-y-2"><Label>입학연도</Label><div className="flex gap-2"><Input type="number" min={1900} max={2100} value={yearInput} onChange={(e) => setYearInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addYear() } }} placeholder="예: 2024"/><Button type="button" variant="outline" onClick={addYear}>추가</Button></div>{errors.admissionYears && <p className="text-sm text-destructive">{errors.admissionYears}</p>}<div className="flex flex-wrap gap-2">{years.map((year) => <button type="button" key={year} onClick={() => setYears(years.filter((item) => item !== year))} className="rounded-full bg-secondary px-3 py-1 text-xs">{year} ×</button>)}</div></div>
      <CheckGroup label="학과" options={departments} values={selectedDepartments} onToggle={(value) => toggle(value, selectedDepartments, setDepartments)}/>
      <CheckGroup label="학적 상태" options={statuses} values={selectedStatuses} onToggle={(value) => toggle(value, selectedStatuses, setStatuses)}/>
      <Button type="button" variant="outline" className="w-full" onClick={() => preview.mutate(filter)} disabled={preview.isPending}><Eye className="mr-2 h-4 w-4"/>{preview.isPending ? "조회 중..." : "대상 미리보기"}</Button>
      {preview.data && <div className="rounded-lg border bg-muted/30 p-4"><p className="text-sm text-muted-foreground">현재 조건 예상 수신자</p><p className="mt-1 text-3xl font-bold">{preview.data.recipientCount.toLocaleString()}명</p><p className="mt-2 text-xs text-muted-foreground">초안 생성 시점에 대상이 다시 확정되어 인원이 달라질 수 있습니다.</p></div>}
    </CardContent></Card><Button className="w-full" size="lg" onClick={handleCreate} disabled={create.isPending || !preview.data}><Save className="mr-2 h-4 w-4"/>{create.isPending ? "초안 생성 중..." : "초안 생성"}</Button>{!preview.data && <p className="text-center text-xs text-muted-foreground">대상 미리보기 후 초안을 생성할 수 있습니다.</p>}</div>
  </div>
}

function CheckGroup<T extends string>({ label, options, values, onToggle }: { label: string; options: Array<[T, string]>; values: T[]; onToggle: (value: T) => void }) {
  return <fieldset className="space-y-2"><legend className="text-sm font-medium">{label}</legend><div className="grid gap-2">{options.map(([value, text]) => <label key={value} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={values.includes(value)} onCheckedChange={() => onToggle(value)}/>{text}</label>)}</div></fieldset>
}
