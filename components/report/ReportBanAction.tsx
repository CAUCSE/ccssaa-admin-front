"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/ui/form-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useBanUser } from "@/hooks/useUsers"

interface ReportBanActionProps {
  userId: string
  userName: string
  buttonLabel?: string
  buttonVariant?: "default" | "destructive" | "outline" | "ghost"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  className?: string
  onSuccess?: () => void
}

export function ReportBanAction({
  userId,
  userName,
  buttonLabel = "추방",
  buttonVariant = "destructive",
  buttonSize = "sm",
  className,
  onSuccess,
}: ReportBanActionProps) {
  const [open, setOpen] = useState(false)
  const [dropReason, setDropReason] = useState("")
  const banUser = useBanUser()

  const handleClose = () => {
    setOpen(false)
    setDropReason("")
  }

  const handleConfirm = () => {
    if (!dropReason.trim()) return

    banUser.mutate(
      {
        userId,
        dropReason: dropReason.trim(),
      },
      {
        onSuccess: () => {
          handleClose()
          onSuccess?.()
        },
      }
    )
  }

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={className}
        onClick={() => setOpen(true)}
        disabled={banUser.isPending}
      >
        {buttonLabel}
      </Button>

      <FormDialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) {
            setDropReason("")
          }
        }}
        title="회원 추방"
        description={`${userName}님을 추방합니다. 추방 사유를 입력해주세요.`}
        confirmText="추방"
        cancelText="취소"
        onConfirm={handleConfirm}
        onCancel={handleClose}
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
