"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertDialog } from "@/components/ui/alert-dialog"
import {
  useApproveUser,
  useRejectUser,
  useBanUser,
  useDeleteUser,
  useRestoreUser,
} from "@/hooks/useUsers"
import type { UserDetail } from "@/types/user"

interface UserActionFooterProps {
  user: UserDetail
  isMaster: boolean
}

export function UserActionFooter({ user, isMaster }: UserActionFooterProps) {
  const router = useRouter()
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: "approve" | "reject" | "ban" | "delete" | "restore" | null
  }>({ open: false, action: null })

  const approveUser = useApproveUser()
  const rejectUser = useRejectUser()
  const banUser = useBanUser()
  const deleteUser = useDeleteUser()
  const restoreUser = useRestoreUser()

  const handleAction = () => {
    if (!confirmDialog.action) return

    switch (confirmDialog.action) {
      case "approve":
        approveUser.mutate(user.id, {
          onSuccess: () => {
            setConfirmDialog({ open: false, action: null })
          },
        })
        break
      case "reject":
        rejectUser.mutate(user.id, {
          onSuccess: () => {
            setConfirmDialog({ open: false, action: null })
          },
        })
        break
      case "ban":
        banUser.mutate(user.id, {
          onSuccess: () => {
            setConfirmDialog({ open: false, action: null })
          },
        })
        break
      case "delete":
        deleteUser.mutate(user.id, {
          onSuccess: () => {
            setConfirmDialog({ open: false, action: null })
            router.push("/users")
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
      case "approve":
        return {
          title: "회원 승인",
          description: `${user.name}님의 가입을 승인하시겠습니까?`,
        }
      case "reject":
        return {
          title: "회원 거부",
          description: `${user.name}님의 가입을 거부하시겠습니까?`,
        }
      case "ban":
        return {
          title: "회원 추방",
          description: `${user.name}님을 추방하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
        }
      case "delete":
        return {
          title: "목록에서 삭제",
          description: `${user.name}님을 목록에서 삭제하시겠습니까?`,
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

  // AWAIT 상태
  if (user.state === "AWAIT") {
    return (
      <>
        <div className="flex gap-4 justify-end pt-6 border-t">
          <Button
            variant="destructive"
            onClick={() => setConfirmDialog({ open: true, action: "reject" })}
            disabled={rejectUser.isPending}
          >
            거부
          </Button>
          <Button
            onClick={() => setConfirmDialog({ open: true, action: "approve" })}
            disabled={approveUser.isPending}
          >
            승인
          </Button>
        </div>

        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ open, action: confirmDialog.action })
          }
          title={dialogContent.title}
          description={dialogContent.description}
          variant={confirmDialog.action === "ban" ? "destructive" : "default"}
          confirmText="확인"
          cancelText="취소"
          onConfirm={handleAction}
          onCancel={() => setConfirmDialog({ open: false, action: null })}
        />
      </>
    )
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
            onClick={() => setConfirmDialog({ open: true, action: "ban" })}
            disabled={banUser.isPending}
          >
            강제 추방
          </Button>
        </div>

        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ open, action: confirmDialog.action })
          }
          title={dialogContent.title}
          description={dialogContent.description}
          variant="destructive"
          confirmText="확인"
          cancelText="취소"
          onConfirm={handleAction}
          onCancel={() => setConfirmDialog({ open: false, action: null })}
        />
      </>
    )
  }

  // REJECT: 목록에서 삭제
  if (user.state === "REJECT") {
    return (
      <>
        <div className="flex gap-4 justify-end pt-6 border-t">
          <Button
            variant="destructive"
            onClick={() => setConfirmDialog({ open: true, action: "delete" })}
            disabled={deleteUser.isPending}
          >
            목록에서 삭제
          </Button>
        </div>

        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ open, action: confirmDialog.action })
          }
          title={dialogContent.title}
          description={dialogContent.description}
          variant="destructive"
          confirmText="확인"
          cancelText="취소"
          onConfirm={handleAction}
          onCancel={() => setConfirmDialog({ open: false, action: null })}
        />
      </>
    )
  }

  // DROP: 목록에서 삭제, 복구
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
          <Button
            variant="destructive"
            onClick={() => setConfirmDialog({ open: true, action: "delete" })}
            disabled={deleteUser.isPending}
          >
            목록에서 삭제
          </Button>
        </div>

        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ open, action: confirmDialog.action })
          }
          title={dialogContent.title}
          description={dialogContent.description}
          variant={confirmDialog.action === "delete" ? "destructive" : "default"}
          confirmText="확인"
          cancelText="취소"
          onConfirm={handleAction}
          onCancel={() => setConfirmDialog({ open: false, action: null })}
        />
      </>
    )
  }

  // INACTIVE: 목록에서 삭제
  if (user.state === "INACTIVE") {
    return (
      <>
        <div className="flex gap-4 justify-end pt-6 border-t">
          <Button
            variant="destructive"
            onClick={() => setConfirmDialog({ open: true, action: "delete" })}
            disabled={deleteUser.isPending}
          >
            목록에서 삭제
          </Button>
        </div>

        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog({ open, action: confirmDialog.action })
          }
          title={dialogContent.title}
          description={dialogContent.description}
          variant="destructive"
          confirmText="확인"
          cancelText="취소"
          onConfirm={handleAction}
          onCancel={() => setConfirmDialog({ open: false, action: null })}
        />
      </>
    )
  }

  return null
}

