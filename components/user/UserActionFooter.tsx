"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { FormDialog } from "@/components/ui/form-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useBanUser, useRestoreUser } from "@/hooks/useUsers"
import type { UserDetail } from "@/types/user"

interface UserActionFooterProps {
  user: UserDetail
  isMaster: boolean
}

export function UserActionFooter({ user, isMaster }: UserActionFooterProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: "ban" | "restore" | null
  }>({ open: false, action: null })
  const [dropReason, setDropReason] = useState("")

  const banUser = useBanUser()
  const restoreUser = useRestoreUser()

  const handleAction = () => {
    if (!confirmDialog.action) return

    switch (confirmDialog.action) {
      case "ban":
        if (!dropReason.trim()) return
        banUser.mutate({ userId: user.id, dropReason: dropReason.trim() }, {
          onSuccess: () => {
            setDropReason("")
            setConfirmDialog({ open: false, action: null })
          },
        })
        break
      case "restore":
        restoreUser.mutate(user.id, {
          onSuccess: () => {
            setConfirmDialog({ open: false, action: null })
          },
        })
        break
    }
  }

  const getDialogContent = () => {
    switch (confirmDialog.action) {
      case "ban":
        return {
          title: "회원 추방",
          description: `${user.name}님을 추방하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
        }
      case "restore":
        return {
          title: "복구",
          description: `${user.name}님을 활성 상태로 복구하시겠습니까?`,
        }
      default:
        return { title: "", description: "" }
    }
  }

  const dialogContent = getDialogContent()

  // AWAIT 상태: 회원관리 페이지에서는 승인/거부 불가 (승인 대기 페이지에서만 처리)
  if (user.state === "AWAIT") {
    return null
  }

  // ACTIVE 상태
  if (user.state === "ACTIVE") {
    if (!isMaster) {
      return null // Master만 추방 가능
    }

    return (
      <>
        <div className="flex gap-4 justify-end pt-6 border-t">
          <Button
            variant="destructive"
            onClick={() => {
              setDropReason("")
              setConfirmDialog({ open: true, action: "ban" })
            }}
            disabled={banUser.isPending}
          >
            강제 추방
          </Button>
        </div>

        <FormDialog
          open={confirmDialog.open}
          onOpenChange={(open) => {
            setConfirmDialog({ open, action: open ? "ban" : null })
            if (!open) setDropReason("")
          }}
          title="회원 추방"
          description={`${user.name}님을 추방합니다. 추방 사유를 입력해주세요.`}
          confirmText="추방"
          cancelText="취소"
          onConfirm={handleAction}
          onCancel={() => {
            setDropReason("")
            setConfirmDialog({ open: false, action: null })
          }}
          isLoading={banUser.isPending}
          confirmDisabled={!dropReason.trim()}
        >
          <div className="space-y-2">
            <p className="text-sm font-medium">추방 사유</p>
            <Textarea
              value={dropReason}
              onChange={(e) => setDropReason(e.target.value)}
              placeholder="추방 사유를 입력하세요."
              maxLength={200}
            />
          </div>
        </FormDialog>
      </>
    )
  }

  // REJECT: 액션 없음
  if (user.state === "REJECT") {
    return null
  }

  // DROP: 복구
  if (user.state === "DROP") {
    return (
      <>
        <div className="flex gap-4 justify-end pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({ open: true, action: "restore" })}
            disabled={restoreUser.isPending}
          >
            복구
          </Button>
        </div>

        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ open, action: confirmDialog.action })
          }
          title={dialogContent.title}
          description={dialogContent.description}
          variant="default"
          confirmText="확인"
          cancelText="취소"
          onConfirm={handleAction}
          onCancel={() => setConfirmDialog({ open: false, action: null })}
        />
      </>
    )
  }

  // GUEST: 액션 없음
  if (user.state === "GUEST") {
    return null
  }

  return null
}

