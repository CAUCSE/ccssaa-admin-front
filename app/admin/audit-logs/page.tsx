"use client"

import { Suspense, useCallback, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, FileText, RotateCcw, Search } from "lucide-react"
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs"
import type {
  AdminAuditLog,
  AdminAuditLogActionType,
  AdminAuditLogCategory,
} from "@/types/admin-audit-log"
import { formatDateTime, fromDatetimeLocal } from "@/lib/utils/datetime"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ErrorMessage } from "@/components/ui/error-message"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ACTION_OPTIONS: Array<{
  value: "" | AdminAuditLogActionType
  label: string
  category?: AdminAuditLogCategory
  variant: "default" | "secondary" | "outline" | "destructive"
}> = [
  { value: "", label: "전체 액션", variant: "outline" },
  { value: "DROP", label: "유저 추방", category: "USER", variant: "destructive" },
  { value: "RESTORE", label: "추방 유저 복구", category: "USER", variant: "secondary" },
  { value: "ROLE_CHANGE", label: "유저 역할 변경", category: "USER", variant: "outline" },
  { value: "ASSIGN", label: "사물함 배정", category: "LOCKER", variant: "default" },
  { value: "EXTEND", label: "사물함 연장", category: "LOCKER", variant: "secondary" },
  { value: "RELEASE", label: "사물함 회수", category: "LOCKER", variant: "outline" },
  { value: "ENABLE", label: "사물함 활성화", category: "LOCKER", variant: "secondary" },
  { value: "DISABLE", label: "사물함 비활성화", category: "LOCKER", variant: "destructive" },
  { value: "RELEASE_EXPIRED", label: "만료 사물함 회수", category: "LOCKER", variant: "outline" },
  { value: "ADMISSION_ACCEPT", label: "재학 인증 승인", category: "ACADEMIC", variant: "default" },
  { value: "ADMISSION_REJECT", label: "재학 인증 거절", category: "ACADEMIC", variant: "destructive" },
  { value: "ACADEMIC_RECORD_ACCEPT", label: "학적 변경 승인", category: "ACADEMIC", variant: "default" },
  { value: "ACADEMIC_RECORD_REJECT", label: "학적 변경 거절", category: "ACADEMIC", variant: "destructive" },
]

const CATEGORY_OPTIONS: Array<{
  value: "" | AdminAuditLogCategory
  label: string
}> = [
  { value: "", label: "전체 카테고리" },
  { value: "USER", label: "사용자" },
  { value: "LOCKER", label: "사물함" },
  { value: "ACADEMIC", label: "학적" },
]

const ACTION_LABEL: Record<string, string> = {
  DROP: "유저 추방",
  RESTORE: "추방 유저 복구",
  ROLE_CHANGE: "유저 역할 변경",
  ASSIGN: "사물함 배정",
  EXTEND: "사물함 연장",
  RELEASE: "사물함 회수",
  ENABLE: "사물함 활성화",
  DISABLE: "사물함 비활성화",
  RELEASE_EXPIRED: "만료 사물함 회수",
  ADMISSION_ACCEPT: "재학 인증 승인",
  ADMISSION_REJECT: "재학 인증 거절",
  ACADEMIC_RECORD_ACCEPT: "학적 변경 승인",
  ACADEMIC_RECORD_REJECT: "학적 변경 거절",
}

const CATEGORY_LABEL: Record<string, string> = {
  USER: "사용자",
  LOCKER: "사물함",
  ACADEMIC: "학적",
}

const ACTION_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DROP: "destructive",
  RESTORE: "secondary",
  ROLE_CHANGE: "outline",
  ASSIGN: "default",
  EXTEND: "secondary",
  RELEASE: "outline",
  ENABLE: "secondary",
  DISABLE: "destructive",
  RELEASE_EXPIRED: "outline",
  ADMISSION_ACCEPT: "default",
  ADMISSION_REJECT: "destructive",
  ACADEMIC_RECORD_ACCEPT: "default",
  ACADEMIC_RECORD_REJECT: "destructive",
}

function toDatetimeLocal(value: string | null): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, "0")
  const D = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${y}-${M}-${D}T${h}:${m}`
}

function getActionLabel(actionType: string, fallback?: string): string {
  return ACTION_LABEL[actionType] ?? fallback ?? actionType
}

function getActionVariant(
  actionType: string
): "default" | "secondary" | "outline" | "destructive" {
  return ACTION_BADGE_VARIANT[actionType] ?? "outline"
}

function formatMetadataValue(
  value: string | number | boolean | string[] | null | undefined
): string {
  if (value == null || value === "") return "-"
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "-"
  if (typeof value === "string") {
    return value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .join(", ") || "-"
  }
  return String(value)
}

function getPersonLabel(person: { email: string | null; name?: string | null; studentId?: string | null }): string {
  if (person.name && person.studentId) return `${person.name} (${person.studentId})`
  if (person.name) return person.name
  return person.email ?? "-"
}

function buildKoreanSummary(log: AdminAuditLog): string {
  if (log.summary) return log.summary
  const action = getActionLabel(log.actionType, log.actionDescription)
  return `${getPersonLabel(log.actor)} 관리자가 ${getPersonLabel(log.target)} 대상의 ${action} 작업을 수행했습니다.`
}

function getCategoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? category
}

const ACTION_METADATA_KEYS: Record<string, string[]> = {
  DROP: ["beforeState", "afterState", "beforeRoles", "afterRoles", "reason"],
  RESTORE: ["beforeState", "afterState", "beforeRoles", "afterRoles", "reason"],
  ROLE_CHANGE: ["beforeState", "afterState", "beforeRoles", "afterRoles", "reason"],
  ASSIGN: ["lockerLocationName", "lockerNumber", "expireDate", "expiredAt", "lockerId"],
  EXTEND: ["lockerLocationName", "lockerNumber", "expireDate", "expiredAt", "lockerId"],
  RELEASE: ["lockerLocationName", "lockerNumber", "expireDate", "lockerId"],
  ENABLE: ["lockerLocationName", "lockerNumber", "expireDate", "lockerId"],
  DISABLE: ["lockerLocationName", "lockerNumber", "expireDate", "releasedUserId", "lockerId"],
  RELEASE_EXPIRED: ["lockerLocationName", "lockerNumber", "expireDate", "lockerId"],
  ADMISSION_ACCEPT: [
    "admissionId",
    "requestedAcademicStatus",
    "requestedStudentId",
    "requestedAdmissionYear",
    "requestedDepartment",
    "requestedGraduationYear",
    "rejectReason",
  ],
  ADMISSION_REJECT: [
    "admissionId",
    "requestedAcademicStatus",
    "requestedStudentId",
    "requestedAdmissionYear",
    "requestedDepartment",
    "requestedGraduationYear",
    "rejectReason",
  ],
  ACADEMIC_RECORD_ACCEPT: [
    "applicationId",
    "beforeAcademicStatus",
    "targetAcademicStatus",
    "note",
    "rejectReason",
  ],
  ACADEMIC_RECORD_REJECT: [
    "applicationId",
    "beforeAcademicStatus",
    "targetAcademicStatus",
    "note",
    "rejectReason",
  ],
}

function getMetadataRows(log: AdminAuditLog) {
  const preferredKeys = ACTION_METADATA_KEYS[log.actionType] ?? []
  const unknownKeys = Object.keys(log.metadata).filter((key) => !preferredKeys.includes(key))

  return [...preferredKeys, ...unknownKeys]
    .filter((key) => log.metadata[key] != null && log.metadata[key] !== "")
    .map((key) => ({
      key,
      label: key,
      value: formatMetadataValue(log.metadata[key]),
    }))
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

function AuditLogDetailDialog({
  log,
  open,
  onOpenChange,
}: {
  log: AdminAuditLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!log) return null

  const actionLabel = getActionLabel(log.actionType, log.actionDescription)
  const summary = buildKoreanSummary(log)
  const metadataRows = getMetadataRows(log)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>감사 로그 상세</DialogTitle>
          <DialogDescription>
            {formatDateTime(log.createdAt ?? "")}에 기록된 관리자 작업입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={getActionVariant(log.actionType)} className="font-normal">
                {actionLabel}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {getCategoryLabel(log.category)}
              </Badge>
              <span className="text-xs text-muted-foreground">ID: {log.id}</span>
            </div>
            <p className="text-sm leading-6">{summary}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="mb-3 text-sm font-medium">수행자</p>
              <div className="space-y-3">
                <DetailItem label="이메일" value={log.actor.email} />
                <DetailItem label="이름" value={log.actor.name ?? "-"} />
                <DetailItem label="학번" value={log.actor.studentId ?? "-"} />
                <DetailItem label="사용자 ID" value={log.actor.userId} />
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="mb-3 text-sm font-medium">대상</p>
              <div className="space-y-3">
                <DetailItem
                  label="대상"
                  value={
                    log.target.type === "USER" && log.target.email ? (
                      <Link href={`/users/${log.target.id}`} className="text-primary hover:underline">
                        {getPersonLabel(log.target)}
                      </Link>
                    ) : (
                      getPersonLabel(log.target)
                    )
                  }
                />
                <DetailItem label="이메일" value={log.target.email ?? "-"} />
                <DetailItem label="이름" value={log.target.name ?? "-"} />
                <DetailItem label="학번" value={log.target.studentId ?? "-"} />
                <DetailItem label="대상 ID" value={log.target.id} />
                <DetailItem label="대상 유형" value={getCategoryLabel(log.target.type)} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium">변경 내용</p>
            </div>
            {metadataRows.length > 0 ? (
              <div className="divide-y">
                {metadataRows.map((row) => (
                  <div
                    key={row.key}
                    className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
                  >
                    <p className="text-sm text-muted-foreground">{row.label}</p>
                    <p className="whitespace-pre-wrap break-words text-sm">{row.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-4 py-5 text-sm text-muted-foreground">표시할 변경 내용이 없습니다.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AuditLogsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialPage = Number(searchParams.get("page") ?? "1")
  const [page, setPage] = useState(Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1)
  const [from, setFrom] = useState(toDatetimeLocal(searchParams.get("from")))
  const [to, setTo] = useState(toDatetimeLocal(searchParams.get("to")))
  const [category, setCategory] = useState<"" | AdminAuditLogCategory>(
    (searchParams.get("category") as "" | AdminAuditLogCategory) ?? ""
  )
  const [actionType, setActionType] = useState<"" | AdminAuditLogActionType>(
    (searchParams.get("actionType") as "" | AdminAuditLogActionType) ?? ""
  )
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "")
  const [validationMessage, setValidationMessage] = useState("")
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null)

  const actionOptions = useMemo(
    () =>
      ACTION_OPTIONS.filter((option) => !option.category || !category || option.category === category),
    [category]
  )
  const effectiveActionType = useMemo(() => {
    if (!actionType) return ""
    const selectedOption = ACTION_OPTIONS.find((option) => option.value === actionType)
    if (!selectedOption?.category || !category || selectedOption.category === category) {
      return actionType
    }
    return ""
  }, [actionType, category])

  const queryParams = useMemo(
    () => ({
      from: from ? fromDatetimeLocal(from).replace("Z", "") : undefined,
      to: to ? fromDatetimeLocal(to).replace("Z", "") : undefined,
      category: category || undefined,
      actionType: effectiveActionType || undefined,
      keyword: keyword.trim() || undefined,
      page: page - 1,
      size: 10,
    }),
    [category, effectiveActionType, from, keyword, page, to]
  )

  const { data, isLoading, error, refetch } = useAdminAuditLogs(queryParams)

  const hasActiveFilters = !!(from || to || category || actionType || keyword.trim())

  const syncUrl = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams()
      if (from) params.set("from", fromDatetimeLocal(from).replace("Z", ""))
      if (to) params.set("to", fromDatetimeLocal(to).replace("Z", ""))
      if (category) params.set("category", category)
      if (effectiveActionType) params.set("actionType", effectiveActionType)
      if (keyword.trim()) params.set("keyword", keyword.trim())
      if (nextPage > 1) params.set("page", String(nextPage))
      const query = params.toString()
      router.push(query ? `/admin/audit-logs?${query}` : "/admin/audit-logs")
    },
    [category, effectiveActionType, from, keyword, router, to]
  )

  const validateRange = useCallback(() => {
    if (from && to && new Date(from).getTime() > new Date(to).getTime()) {
      setValidationMessage("조회 시작 시각은 종료 시각보다 늦을 수 없습니다.")
      return false
    }
    setValidationMessage("")
    return true
  }, [from, to])

  const handleSearch = useCallback(() => {
    if (!validateRange()) return
    setPage(1)
    syncUrl(1)
  }, [syncUrl, validateRange])

  const handleReset = useCallback(() => {
    setFrom("")
    setTo("")
    setCategory("")
    setActionType("")
    setKeyword("")
    setValidationMessage("")
    setPage(1)
    router.push("/admin/audit-logs")
  }, [router])

  const handleCategoryChange = useCallback((value: string) => {
    const nextCategory = value === "all" ? "" : (value as AdminAuditLogCategory)
    setCategory(nextCategory)

    const selectedOption = ACTION_OPTIONS.find((option) => option.value === actionType)
    if (selectedOption?.category && nextCategory && selectedOption.category !== nextCategory) {
      setActionType("")
    }
  }, [actionType])

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
    syncUrl(nextPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (error) {
    return (
      <ErrorMessage
        message="감사 로그를 불러오는 중 오류가 발생했습니다. 권한 또는 검색 조건을 확인해 주세요."
        onRetry={() => refetch()}
      />
    )
  }

  const headClass = "px-4 py-3 text-left align-middle font-semibold bg-muted/50 text-muted-foreground"
  const cellClass = "px-4 py-3 text-sm align-top text-left"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">감사 로그</h1>
        <p className="mt-1 text-muted-foreground">
          사용자, 사물함, 학적 승인 등 관리자 작업 이력을 조회합니다.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">검색 조건</span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                초기화
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_160px_180px_minmax(180px,1fr)_auto] md:items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">시작 시각</label>
              <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">종료 시각</label>
              <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">카테고리</label>
              <Select value={category || "all"} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value || "all"} value={option.value || "all"}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">액션</label>
              <Select
                value={actionType || "all"}
                onValueChange={(value) =>
                  setActionType(value === "all" ? "" : (value as AdminAuditLogActionType))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value || "all"} value={option.value || "all"}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">키워드</label>
              <Input
                placeholder="이메일, 이름, 학번"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              검색
            </Button>
          </div>
          {validationMessage && (
            <p className="text-sm font-medium text-destructive">{validationMessage}</p>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {["시간", "액션", "수행자", "대상", "변경 내용"].map((label) => (
                  <TableHead key={label} className={headClass}>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 5 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex} className={cellClass}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !data || data.content.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">조건에 맞는 감사 로그가 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              검색 조건을 바꾸거나 초기화 후 다시 조회해 보세요.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
              검색 초기화
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            총 <span className="font-medium text-foreground">{data.totalElements}</span>건
            {data.totalElements > 0 && (
              <> · {data.currentPage * data.size + 1}-{Math.min((data.currentPage + 1) * data.size, data.totalElements)}번째 표시</>
            )}
          </p>

          <div className="block space-y-3 md:hidden">
            {data.content.map((log) => (
              <div key={log.id} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium tabular-nums">{formatDateTime(log.createdAt ?? "")}</p>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant="outline" className="font-normal">
                      {getCategoryLabel(log.category)}
                    </Badge>
                    <Badge variant={getActionVariant(log.actionType)} className="font-normal">
                      {getActionLabel(log.actionType, log.actionDescription)}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
                  <span className="text-muted-foreground">수행자</span>
                  <span className="truncate">{getPersonLabel(log.actor)}</span>
                  <span className="text-muted-foreground">대상</span>
                  {log.target.type === "USER" && log.target.email ? (
                    <Link href={`/users/${log.target.id}`} className="truncate text-primary hover:underline">
                      {getPersonLabel(log.target)}
                    </Link>
                  ) : (
                    <span className="truncate">{getPersonLabel(log.target)}</span>
                  )}
                  <span className="text-muted-foreground">변경 내용</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-fit gap-1.5"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    상세보기
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className={headClass} style={{ width: "14%" }}>시간</TableHead>
                  <TableHead className={headClass} style={{ width: "16%" }}>구분</TableHead>
                  <TableHead className={headClass} style={{ width: "24%" }}>수행자</TableHead>
                  <TableHead className={headClass} style={{ width: "24%" }}>대상</TableHead>
                  <TableHead className={headClass} style={{ width: "22%" }}>변경 내용</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className={`${cellClass} whitespace-nowrap tabular-nums text-muted-foreground`}>
                      {formatDateTime(log.createdAt ?? "")}
                    </TableCell>
                    <TableCell className={cellClass}>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="font-normal">
                          {getCategoryLabel(log.category)}
                        </Badge>
                        <Badge variant={getActionVariant(log.actionType)} className="font-normal">
                          {getActionLabel(log.actionType, log.actionDescription)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{getPersonLabel(log.actor)}</p>
                        <p className="truncate text-xs text-muted-foreground">{log.actor.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <div className="min-w-0">
                        {log.target.type === "USER" && log.target.email ? (
                          <Link href={`/users/${log.target.id}`} className="truncate font-medium text-primary hover:underline">
                            {getPersonLabel(log.target)}
                          </Link>
                        ) : (
                          <p className="truncate font-medium">{getPersonLabel(log.target)}</p>
                        )}
                        <p className="truncate text-xs text-muted-foreground">{log.target.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 whitespace-nowrap"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        상세보기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || !data.hasPrev}
            >
              이전
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {page} / {Math.max(1, data.totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={!data.hasNext}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      <AuditLogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null)
        }}
      />
    </div>
  )
}

export default function AdminAuditLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <AuditLogsPageContent />
    </Suspense>
  )
}
