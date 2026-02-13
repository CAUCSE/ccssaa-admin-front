"use client"

import { useParams, useRouter } from "next/navigation"
import { useLockerDetail, useAssignLocker, useReleaseLocker } from "@/hooks/useLockers"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ErrorMessage } from "@/components/ui/error-message"
import { FormDialog } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getStatusBadge } from "@/lib/utils/status-badge"
import { useState } from "react"
import { AlertDialogRoot, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function LockerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lockerId = parseInt(params.id as string, 10)

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState("")

  const { data: locker, isLoading, error } = useLockerDetail(lockerId)
  const assignMutation = useAssignLocker()
  const releaseMutation = useReleaseLocker()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const handleAssign = () => {
    if (!assignUserId.trim()) {
      return
    }

    assignMutation.mutate(
      {
        lockerId,
        data: { userId: parseInt(assignUserId, 10) },
      },
      {
        onSuccess: () => {
          setIsAssignDialogOpen(false)
          setAssignUserId("")
        },
      }
    )
  }

  const handleRelease = () => {
    releaseMutation.mutate(lockerId, {
      onSuccess: () => {
        setIsReleaseDialogOpen(false)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (error || !locker) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="사물함 상세"
          description="사물함 정보를 확인하고 관리할 수 있습니다."
          backHref="/lockers"
          backLabel="Lockers"
          breadcrumbs={[{ label: "사물함 상세" }]}
        />
        <ErrorMessage message="사물함 정보를 불러올 수 없습니다." />
      </div>
    )
  }

  const statusBadge = getStatusBadge(locker.status)

  return (
    <div className="space-y-6">
      <PageHeader
        title="사물함 상세"
        description="사물함 정보를 확인하고 관리할 수 있습니다."
        backHref="/lockers"
        backLabel="Lockers"
        breadcrumbs={[{ label: "사물함 상세" }]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* 사물함 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>사물함 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">사물함 번호</Label>
              <p className="text-lg font-semibold">{locker.number}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">상태</Label>
              <div>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 현재 사용자 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>현재 사용자</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {locker.currentUserName ? (
              <>
                <div>
                  <Label className="text-muted-foreground">이름</Label>
                  <p>{locker.currentUserName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">학번</Label>
                  <p>{locker.currentUserStudentNo}</p>
                </div>
                {locker.currentUserPhone && (
                  <div>
                    <Label className="text-muted-foreground">연락처</Label>
                    <p>{locker.currentUserPhone}</p>
                  </div>
                )}
                {locker.assignedAt && (
                  <div>
                    <Label className="text-muted-foreground">배정일</Label>
                    <p>{formatDate(locker.assignedAt)}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">사용자가 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 이전 사용자 정보 */}
      {locker.previousUserName && (
        <Card>
          <CardHeader>
            <CardTitle>이전 사용자</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">이름</Label>
              <p>{locker.previousUserName}</p>
            </div>
            {locker.previousUserStudentNo && (
              <div>
                <Label className="text-muted-foreground">학번</Label>
                <p>{locker.previousUserStudentNo}</p>
              </div>
            )}
            {locker.releasedAt && (
              <div>
                <Label className="text-muted-foreground">회수일</Label>
                <p>{formatDate(locker.releasedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 관리자 액션 버튼 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setIsAssignDialogOpen(true)}
        >
          수동 배정
        </Button>
        {locker.status === "IN_USE" && (
          <Button
            variant="destructive"
            onClick={() => setIsReleaseDialogOpen(true)}
          >
            회수
          </Button>
        )}
      </div>

      {/* 수동 배정 모달 */}
      <FormDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        title="수동 배정"
        description="특정 유저를 이 사물함에 배정합니다."
        confirmText="배정"
        cancelText="취소"
        onConfirm={handleAssign}
        isLoading={assignMutation.isPending}
      >
        <div>
          <Label htmlFor="assignUserId">유저 ID *</Label>
          <Input
            id="assignUserId"
            type="number"
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
            placeholder="유저 ID를 입력하세요"
          />
        </div>
      </FormDialog>

      {/* 회수 확인 모달 */}
      <AlertDialogRoot open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사물함 회수 확인</AlertDialogTitle>
            <AlertDialogDescription>
              이 사물함을 회수하시겠습니까? 회수 시 현재 사용자에게 알림이 발송됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRelease}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              회수
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>
    </div>
  )
}
