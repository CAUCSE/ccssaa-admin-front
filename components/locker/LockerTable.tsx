"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Locker, LockerUsageStatus } from "@/types/locker"
import { FileText, HelpCircle } from "lucide-react"
import { getStatusBadge } from "@/lib/utils/status-badge"

/** 액션별 정책 설명 (도움말용) */
const ACTION_GUIDE: { label: string; description: string }[] = [
  { label: "배정", description: "비어 있는 사물함에 사용자를 배정합니다. 만료일을 설정합니다." },
  { label: "연장", description: "사용 중인 사물함의 만료일을 연장합니다." },
  { label: "회수", description: "배정을 해제하여 사물함을 비웁니다. 사용자는 더 이상 사용할 수 없습니다." },
  { label: "정리", description: "만료된 배정을 회수 처리합니다." },
  { label: "활성화", description: "비활성화된 사물함을 다시 사용 가능하게 합니다." },
  { label: "비활성화", description: "사물함을 비활성화합니다. 사용 중이면 배정이 함께 해제됩니다." },
  { label: "로그 보기", description: "해당 사물함의 배정·반납·연장·회수 이력을 조회합니다." },
]

interface LockerTableProps {
  data: Locker[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  onAssignClick?: (locker: Locker) => void
  onExtendClick?: (locker: Locker) => void
  onRevokeClick?: (locker: Locker) => void
  onCleanupClick?: (locker: Locker) => void
  onLogsClick?: (locker: Locker) => void
  onEnableClick?: (locker: Locker) => void
  onDisableClick?: (locker: Locker) => void
}

/**
 * LockerTable 컴포넌트
 * 사물함 목록을 테이블 형태로 표시하는 컴포넌트입니다.
 */
export function LockerTable({
  data,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading,
  onAssignClick,
  onExtendClick,
  onRevokeClick,
  onCleanupClick,
  onLogsClick,
  onEnableClick,
  onDisableClick,
}: LockerTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const getUsageStatus = (locker: Locker): LockerUsageStatus => {
    if (locker.status === "DISABLED") return "EMPTY" // 비활성은 액션 없음으로만 구분
    if (!locker.currentUserId) return "EMPTY"
    if (locker.expiredAt) {
      const t = new Date(locker.expiredAt).getTime()
      if (!Number.isNaN(t) && t < Date.now()) return "EXPIRED"
    }
    return "IN_USE"
  }

  const startIndex = (currentPage - 1) * pageSize

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-12 text-center text-gray-500">
          사물함 데이터가 없습니다.
        </div>
      </div>
    )
  }

  const cellClass = "px-4 py-3 text-center align-middle"
  const headClass = "px-4 py-3 text-center align-middle font-semibold"

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <div className="flex items-center justify-end gap-2 px-4 py-2 border-b bg-muted/30">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-8 gap-1.5"
              >
                <HelpCircle className="h-4 w-4" />
                <span>액션 안내</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  사물함 액션 안내
                </DialogTitle>
              </DialogHeader>
              <ul className="space-y-3 pt-1">
                {ACTION_GUIDE.map((item) => (
                  <li key={item.label} className="flex gap-3">
                    <Badge variant="secondary" className="shrink-0 h-fit font-normal">
                      {item.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground pt-0.5">
                      {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
        </div>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className={headClass} style={{ width: "10%" }}>위치</TableHead>
              <TableHead className={headClass} style={{ width: "6%" }}>번호</TableHead>
              <TableHead className={headClass} style={{ width: "10%" }}>상태</TableHead>
              <TableHead className={headClass} style={{ width: "18%" }}>사용자</TableHead>
              <TableHead className={headClass} style={{ width: "11%" }}>만료일</TableHead>
              <TableHead className={headClass} style={{ width: "18%" }}>액션</TableHead>
              <TableHead className={headClass} style={{ width: "12%" }}>활성</TableHead>
              <TableHead className={headClass} style={{ width: "10%" }}>로그</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((locker) => {
              const isDisabled = locker.status === "DISABLED"
              const usageStatus = getUsageStatus(locker)
              const statusBadge = isDisabled
                ? getStatusBadge("DISABLED")
                : usageStatus === "EMPTY"
                  ? getStatusBadge("AVAILABLE")
                  : usageStatus === "IN_USE"
                    ? getStatusBadge("IN_USE")
                    : getStatusBadge("INACTIVE")
              const statusLabel = isDisabled
                ? "비활성"
                : usageStatus === "EMPTY"
                  ? "비어있음"
                  : usageStatus === "IN_USE"
                    ? "사용중"
                    : "만료됨"
              const isActive = locker.status !== "DISABLED"
              return (
                <TableRow key={locker.id ?? `${locker.location ?? ""}-${locker.number}`}>
                  <TableCell className={cellClass}>
                    <span className="whitespace-nowrap">{locker.location || "-"}</span>
                  </TableCell>
                  <TableCell className={cellClass}>
                    <span className="font-medium tabular-nums">{locker.number}</span>
                  </TableCell>
                  <TableCell className={cellClass}>
                    <Badge variant={statusBadge.variant}>
                      {statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className={cellClass}>
                    {locker.currentUserName ? (
                      <span className="inline-block max-w-full truncate" title={locker.currentUserName}>
                        {locker.currentUserStudentNo
                          ? `${locker.currentUserName} (${locker.currentUserStudentNo})`
                          : locker.currentUserName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className={cellClass}>
                    <span className="whitespace-nowrap tabular-nums">
                      {locker.expiredAt ? formatDate(locker.expiredAt) : "—"}
                    </span>
                  </TableCell>
                  <TableCell className={cellClass}>
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {!isDisabled && usageStatus === "EMPTY" && (
                        <Button
                          variant="outline"
                          size="sm" className="min-w-[40px] min-h-[40px]"
                          onClick={() => onAssignClick?.(locker)}
                        >
                          배정
                        </Button>
                      )}
                      {!isDisabled && usageStatus === "IN_USE" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm" className="min-w-[40px] min-h-[40px]"
                            onClick={() => onExtendClick?.(locker)}
                          >
                            연장
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm" className="min-w-[40px] min-h-[40px]"
                            onClick={() => onRevokeClick?.(locker)}
                          >
                            회수
                          </Button>
                        </>
                      )}
                      {!isDisabled && usageStatus === "EXPIRED" && (
                        <Button
                          variant="outline"
                          size="sm" className="min-w-[40px] min-h-[40px]"
                          onClick={() => onCleanupClick?.(locker)}
                        >
                          정리
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={cellClass}>
                    {locker.id != null && locker.id !== "" ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className="w-fit text-xs font-normal"
                        >
                          {isActive ? "사용 가능" : "중지"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            isActive
                              ? onDisableClick?.(locker)
                              : onEnableClick?.(locker)
                          }
                        >
                          {isActive ? "비활성화" : "활성화"}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className={cellClass}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => onLogsClick?.(locker)}
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      보기
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-sm text-muted-foreground">
          총 {totalElements}개 중 {startIndex + 1}-{Math.min(startIndex + pageSize, totalElements)}개 표시
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm" className="min-w-[40px] min-h-[40px]"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm" className="min-w-[40px] min-h-[40px]"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm" className="min-w-[40px] min-h-[40px]"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}
