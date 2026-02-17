"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { LockerFilter } from "@/components/locker/LockerFilter"
import { LockerTable } from "@/components/locker/LockerTable"
import { LockerLogsModal } from "@/components/locker/LockerLogsModal"
import {
  useLockers,
  useAssignLocker,
  useExtendLocker,
  useReleaseLocker,
  useEnableLocker,
  useDisableLocker,
  useReleaseAllExpiredLockers,
} from "@/hooks/useLockers"
import { useAdminUsersV2 } from "@/hooks/useUsers"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorMessage } from "@/components/ui/error-message"
import { FormDialog } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { LockerListParams, LockerNameV2, Locker } from "@/types/locker"
import type { AdminUserItemV2 } from "@/types/user"
import { toast } from "sonner"
import { X } from "lucide-react"

const ASSIGN_SEARCH_DEBOUNCE_MS = 300

/** datetime-local value 기본값: 오늘 기준 90일 후 */
function defaultExpiredAtDatetimeLocal(): string {
  const d = new Date()
  d.setDate(d.getDate() + 90)
  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, "0")
  const D = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${y}-${M}-${D}T${h}:${m}`
}

import {
  AlertDialogRoot,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function LockersPageContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [extendDialogOpen, setExtendDialogOpen] = useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [logsModalOpen, setLogsModalOpen] = useState(false)
  const [bulkReleaseDialogOpen, setBulkReleaseDialogOpen] = useState(false)
  const [bulkReleaseConfirmText, setBulkReleaseConfirmText] = useState("")
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null)
  const [selectedLockerForLogs, setSelectedLockerForLogs] = useState<Locker | null>(null)
  const [assignSearchKeyword, setAssignSearchKeyword] = useState("")
  const [assignDebouncedKeyword, setAssignDebouncedKeyword] = useState("")
  const [assignSelectedUser, setAssignSelectedUser] = useState<AdminUserItemV2 | null>(null)
  const [assignExpiredAt, setAssignExpiredAt] = useState("")
  const [extendExpiredAt, setExtendExpiredAt] = useState("")

  useEffect(() => {
    if (!assignDialogOpen) return
    const t = setTimeout(
      () => setAssignDebouncedKeyword(assignSearchKeyword.trim()),
      ASSIGN_SEARCH_DEBOUNCE_MS
    )
    return () => clearTimeout(t)
  }, [assignDialogOpen, assignSearchKeyword])

  const userKeywordParam = searchParams.get("userKeyword")
  const locationParam = searchParams.get("location")
  const isActiveParam = searchParams.get("isActive")
  const isOccupiedParam = searchParams.get("isOccupied")
  const isExpiredParam = searchParams.get("isExpired")

  const params: LockerListParams = {
    page: page - 1, // API는 0-based
    size: 10,
    userKeyword: userKeywordParam?.trim() || undefined,
    locationV2:
      locationParam === "SECOND" || locationParam === "THIRD" || locationParam === "FOURTH"
        ? (locationParam as LockerNameV2)
        : undefined,
    isActive:
      isActiveParam === "true" ? true : isActiveParam === "false" ? false : undefined,
    isOccupied:
      isOccupiedParam === "true" ? true : isOccupiedParam === "false" ? false : undefined,
    isExpired:
      isExpiredParam === "true" ? true : isExpiredParam === "false" ? false : undefined,
  }

  const { data, isLoading, error } = useLockers(params)
  const assignMutation = useAssignLocker()
  const extendMutation = useExtendLocker()
  const releaseMutation = useReleaseLocker()
  const enableMutation = useEnableLocker()
  const disableMutation = useDisableLocker()
  const releaseAllExpiredMutation = useReleaseAllExpiredLockers()

  const { data: assignSearchUsers = [] } = useAdminUsersV2(
    assignDialogOpen
      ? { keyword: assignDebouncedKeyword || undefined, userState: "ACTIVE" }
      : undefined
  )

  const assignUserDisplayLabel = (user: AdminUserItemV2) => {
    const name = user.adminName?.trim() || "이름 없음"
    return user.adminEmail?.trim() ? `${name} (${user.adminEmail})` : name
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openAssignDialog = (locker: Locker) => {
    setSelectedLocker(locker)
    setAssignSearchKeyword("")
    setAssignDebouncedKeyword("")
    setAssignSelectedUser(null)
    setAssignExpiredAt(defaultExpiredAtDatetimeLocal())
    setAssignDialogOpen(true)
  }

  const openExtendDialog = (locker: Locker) => {
    setSelectedLocker(locker)
    setExtendExpiredAt(locker.expiredAt ? locker.expiredAt.slice(0, 16) : "")
    setExtendDialogOpen(true)
  }

  const openRevokeDialog = (locker: Locker) => {
    setSelectedLocker(locker)
    setRevokeDialogOpen(true)
  }

  const openCleanupDialog = (locker: Locker) => {
    setSelectedLocker(locker)
    setCleanupDialogOpen(true)
  }

  const openLogsModal = (locker: Locker) => {
    setSelectedLockerForLogs(locker)
    setLogsModalOpen(true)
  }

  const openDisableDialog = (locker: Locker) => {
    setSelectedLocker(locker)
    setDisableDialogOpen(true)
  }

  const handleEnable = (locker: Locker) => {
    if (locker.id == null || locker.id === "") return
    enableMutation.mutate(locker.id)
  }

  const handleDisableConfirm = () => {
    if (!selectedLocker || selectedLocker.id == null || selectedLocker.id === "") return
    disableMutation.mutate(selectedLocker.id, {
      onSuccess: () => {
        setDisableDialogOpen(false)
        setSelectedLocker(null)
      },
    })
  }

  const handleAssign = () => {
    if (!selectedLocker) {
      toast.error("사물함을 선택해 주세요.")
      return
    }
    if (selectedLocker.id === undefined || selectedLocker.id === null || selectedLocker.id === "") {
      toast.error(
        "이 사물함은 배정할 수 없습니다. 목록 API에서 사물함 ID(id)를 반환하는지 확인해 주세요."
      )
      return
    }
    if (!assignSelectedUser) {
      toast.error("배정할 사용자를 검색 후 선택해 주세요.")
      return
    }
    if (!assignExpiredAt.trim()) {
      toast.error("만료일을 입력해 주세요.")
      return
    }

    assignMutation.mutate(
      {
        lockerId: selectedLocker.id,
        data: {
          userId: assignSelectedUser.id,
          expiredAt: new Date(assignExpiredAt).toISOString(),
        },
      },
      {
        onSuccess: () => {
          setAssignDialogOpen(false)
          setAssignSearchKeyword("")
          setAssignDebouncedKeyword("")
          setAssignSelectedUser(null)
          setAssignExpiredAt("")
          setSelectedLocker(null)
        },
      }
    )
  }

  const handleExtend = () => {
    if (!selectedLocker || !extendExpiredAt) return

    const iso = new Date(extendExpiredAt).toISOString()
    extendMutation.mutate(
      {
        lockerId: selectedLocker.id,
        data: { expiredAt: iso },
      },
      {
        onSuccess: () => {
          setExtendDialogOpen(false)
          setSelectedLocker(null)
        },
      }
    )
  }

  const handleRevoke = () => {
    if (!selectedLocker) return
    const lockerId = selectedLocker.id
    releaseMutation.mutate(lockerId, {
      onSuccess: () => {
        setRevokeDialogOpen(false)
        setSelectedLocker(null)
      },
    })
  }

  const handleCleanup = () => {
    // 만료 정리도 회수 API를 사용 (만료 상태에 한정)
    handleRevoke()
    setCleanupDialogOpen(false)
  }

  const handleOpenBulkReleaseDialog = () => {
    setBulkReleaseConfirmText("")
    setBulkReleaseDialogOpen(true)
  }

  const handleConfirmBulkRelease = () => {
    if (bulkReleaseConfirmText.trim() !== "일괄회수하겠습니다.") {
      toast.error("정확히 '일괄회수하겠습니다.' 를 입력해 주세요.")
      return
    }
    releaseAllExpiredMutation.mutate(undefined, {
      onSuccess: () => {
        setBulkReleaseDialogOpen(false)
        setBulkReleaseConfirmText("")
      },
    })
  }

  useEffect(() => {
    setPage(1) // 필터 변경 시 첫 페이지로
  }, [searchParams])

  if (error) {
    return <ErrorMessage message="데이터를 불러오는 중 오류가 발생했습니다." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">사물함 현황</h1>
          <p className="text-muted-foreground">
            위치별 사물함 현황을 조회하고, 배정·연장·회수·정리 작업을 수행합니다.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="whitespace-nowrap"
          onClick={handleOpenBulkReleaseDialog}
          disabled={releaseAllExpiredMutation.isPending}
        >
          만료 사물함 일괄 회수
        </Button>
      </div>

      <LockerFilter />

      {data && (
        <LockerTable
          data={data.content}
          currentPage={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={data.size}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          onAssignClick={openAssignDialog}
          onExtendClick={openExtendDialog}
          onRevokeClick={openRevokeDialog}
          onCleanupClick={openCleanupDialog}
          onLogsClick={openLogsModal}
          onEnableClick={handleEnable}
          onDisableClick={openDisableDialog}
        />
      )}

      {/* 배정 모달 — 사용자 검색: GET /api/v2/admin/users/search (게시판 관리자 검색과 동일) */}
      <FormDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        title="사물함 배정"
        description="선택한 사물함에 사용자를 배정합니다. 이름 또는 이메일로 검색 후 선택하세요."
        confirmText="배정 확정"
        cancelText="취소"
        onConfirm={handleAssign}
        isLoading={assignMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">사물함</Label>
            <p className="font-medium">
              {selectedLocker ? `${selectedLocker.location ?? ""} ${selectedLocker.number}` : "-"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>사용자 검색</Label>
            {assignSelectedUser ? (
              <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <span className="min-w-0 truncate">
                  {assignUserDisplayLabel(assignSelectedUser)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setAssignSelectedUser(null)}
                  aria-label="선택 해제"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
                  ) : (
                    <>
                      <Input
                        placeholder="이름 또는 이메일로 검색"
                        value={assignSearchKeyword}
                        onChange={(e) => setAssignSearchKeyword(e.target.value)}
                        className="rounded-b-none border-b-0"
                      />
                      <ul className="max-h-40 overflow-y-auto rounded-b-md border border-t-0 divide-y bg-muted/30">
                        {!assignDebouncedKeyword ? (
                          <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                            검색어를 입력하세요.
                          </li>
                        ) : assignSearchUsers.length === 0 ? (
                          <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                            검색 결과가 없습니다.
                          </li>
                        ) : (
                          assignSearchUsers.map((user) => (
                            <li
                              key={user.id}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-muted/50"
                              onClick={() => setAssignSelectedUser(user)}
                            >
                              {assignUserDisplayLabel(user)}
                            </li>
                          ))
                        )}
                      </ul>
                    </>
                  )}
                </div>
                <div>
                  <Label htmlFor="assignExpiredAt">만료일 *</Label>
                  <Input
                    id="assignExpiredAt"
                    type="datetime-local"
                    value={assignExpiredAt}
                    onChange={(e) => setAssignExpiredAt(e.target.value)}
                  />
                </div>
              </div>
            </FormDialog>

      {/* 연장 모달 */}
      <FormDialog
        open={extendDialogOpen}
        onOpenChange={setExtendDialogOpen}
        title="만료일 연장"
        description="현재 만료일을 기준으로 연장 후 만료일을 설정합니다."
        confirmText="연장"
        cancelText="취소"
        onConfirm={handleExtend}
        isLoading={extendMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">사물함</Label>
            <p className="font-medium">
              {selectedLocker ? `${selectedLocker.location ?? ""} ${selectedLocker.number}` : "-"}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">현재 만료일</Label>
            <p>
              {selectedLocker?.expiredAt
                ? new Date(selectedLocker.expiredAt).toLocaleString()
                : "-"}
            </p>
          </div>
          <div>
            <Label htmlFor="extendExpiredAt">연장 후 만료일</Label>
            <Input
              id="extendExpiredAt"
              type="datetime-local"
              value={extendExpiredAt}
              onChange={(e) => setExtendExpiredAt(e.target.value)}
            />
          </div>
        </div>
      </FormDialog>

      {/* 회수 확인 모달 */}
      <AlertDialogRoot open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사물함 회수</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 사물함을 회수하시겠습니까? 회수 시 현재 배정은 종료되며, 사용자는 더 이상 사물함을 사용할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              회수
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>

      {/* 비활성화 확인 모달 */}
      <AlertDialogRoot open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사물함 비활성화</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedLocker?.currentUserName
                ? "선택한 사물함을 비활성화하면 현재 배정된 사용자도 함께 해제됩니다. 계속하시겠습니까?"
                : "선택한 사물함을 비활성화하시겠습니까? 비활성화된 사물함은 배정·연장·회수 대상에서 제외됩니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              비활성화
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>

      {/* 만료 정리 확인 모달 */}
      <AlertDialogRoot open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>만료 사물함 정리</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 사물함의 만료된 배정을 정리하시겠습니까? 정리 시 해당 배정은 회수 처리됩니다. 기존 로그는 유지됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCleanup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              정리
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>

      {/* 만료 사물함 일괄 회수 모달 */}
      <FormDialog
        open={bulkReleaseDialogOpen}
        onOpenChange={setBulkReleaseDialogOpen}
        title="만료 사물함 일괄 회수"
        description="만료 상태인 사물함을 모두 회수합니다. 진행 후에는 개별 되돌리기가 어렵습니다."
        confirmText="일괄 회수 실행"
        cancelText="취소"
        onConfirm={handleConfirmBulkRelease}
        isLoading={releaseAllExpiredMutation.isPending}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            아래 문구를 정확히 입력하면 일괄 회수 요청이 전송됩니다.
          </p>
          <div className="rounded-md bg-muted px-3 py-2 text-sm font-mono">
            일괄회수하겠습니다.
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulkReleaseConfirm">확인 문구 입력</Label>
            <Input
              id="bulkReleaseConfirm"
              value={bulkReleaseConfirmText}
              onChange={(e) => setBulkReleaseConfirmText(e.target.value)}
              placeholder="일괄회수하겠습니다."
            />
          </div>
        </div>
      </FormDialog>

      {/* 관련 로그 모달 */}
      <LockerLogsModal
        open={logsModalOpen}
        onOpenChange={setLogsModalOpen}
        locker={selectedLockerForLogs}
      />
    </div>
  )
}

/**
 * 사물함 현황 페이지
 * 위치/상태/사용자/만료일 기준으로 사물함을 통합 관리하는 화면입니다.
 * 
 * 기능:
 * - 위치/상태/사용자/만료일 필터
 * - 사물함 현황 테이블
 * - 페이지네이션
 * - 상태별 액션(배정/연장/회수/정리)
 */
export default function LockersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <LockersPageContent />
    </Suspense>
  )
}
