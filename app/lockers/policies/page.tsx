"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLockerPolicies, useActivateLockerPolicy } from "@/hooks/useLockerPolicies"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorMessage } from "@/components/ui/error-message"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getStatusBadge } from "@/lib/utils/status-badge"
import type { LockerPolicy, LockerPolicyStatus } from "@/types/locker-policy"
import { Plus, Pencil, CheckCircle } from "lucide-react"
import { toast } from "sonner"

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, "0")
  const D = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${y}.${M}.${D} ${h}:${m}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
}

function statusLabel(s: LockerPolicyStatus): string {
  return s === "ACTIVE" ? "활성" : "비활성"
}

export default function LockerPoliciesPage() {
  const router = useRouter()
  const { data, isLoading, error } = useLockerPolicies()
  const activateMutation = useActivateLockerPolicy()

  const handleActivate = (policy: LockerPolicy) => {
    if (policy.status === "ACTIVE") return
    if (
      !confirm(
        `정책 "${policy.version}"(을)를 활성 정책으로 설정하시겠습니까?\n\n` +
          "기존 활성 정책은 비활성으로 전환되며, 이미 완료된 배정에는 영향을 주지 않습니다."
      )
    ) {
      return
    }
    activateMutation.mutate(policy.id, {
      onSuccess: () => {},
    })
  }

  if (error) {
    return <ErrorMessage message="데이터를 불러오는 중 오류가 발생했습니다." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">사물함 정책 관리</h1>
          <p className="text-muted-foreground mt-1">
            학기/기간별 사물함 신청·연장 정책을 관리합니다.
          </p>
        </div>
        <Link
          href="/lockers/policies/new"
          className={buttonVariants({ variant: "default", className: "shrink-0 whitespace-nowrap inline-flex items-center" })}
        >
          <Plus className="mr-2 h-4 w-4 shrink-0" />
          정책 등록
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 10 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="rounded-md border p-12 text-center text-muted-foreground">
          등록된 정책이 없습니다. 정책 등록 버튼으로 새 정책을 추가해주세요.
        </div>
      ) : (
        <>
          {data.content.every((row) => row.status !== "ACTIVE") && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              현재 활성화된 신청 정책이 없습니다. 정책을 활성화해도 기존 배정에는 영향을 주지 않습니다.
            </div>
          )}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[140px]">정책명</TableHead>
                  <TableHead className="text-center w-[220px]">신청기간</TableHead>
                  <TableHead className="text-center w-[220px]">연장기간</TableHead>
                  <TableHead className="text-center w-[140px]">만료일</TableHead>
                  <TableHead className="text-center w-[100px]">상태</TableHead>
                  <TableHead className="text-center w-[160px]">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.map((row) => {
                  const badge = getStatusBadge(row.status)
                  const isActive = row.status === "ACTIVE"
                  const applyPeriod = `${formatDateTime(row.applyStartAt)} ~ ${formatDateTime(
                    row.applyEndAt
                  )}`
                  const extendPeriod =
                    row.extendStartAt && row.extendEndAt
                      ? `${formatDateTime(row.extendStartAt)} ~ ${formatDateTime(row.extendEndAt)}`
                      : "-"
                  return (
                    <TableRow
                      key={row.id}
                      className={isActive ? "bg-green-50/50 dark:bg-green-950/20" : undefined}
                    >
                      <TableCell className="text-center font-medium">{row.version}</TableCell>
                      <TableCell className="text-center text-sm whitespace-nowrap">
                        {applyPeriod}
                      </TableCell>
                      <TableCell className="text-center text-sm whitespace-nowrap">
                        {extendPeriod}
                      </TableCell>
                      <TableCell className="text-center text-sm whitespace-nowrap">
                        {formatDate(row.applyExpiredAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={badge.variant}>{statusLabel(row.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/lockers/policies/${row.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={row.status === "ACTIVE"}
                            onClick={() => handleActivate(row)}
                            title={
                              row.status === "ACTIVE"
                                ? "이미 활성 정책입니다"
                                : "정책을 활성화합니다 (기존 배정에는 영향을 주지 않습니다)"
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
