"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  useAdmissionDetail,
  useApproveAdmission,
  useRejectAdmission,
} from "@/hooks/useAdmissions"
import { AdmissionProfileCard } from "@/components/admission/AdmissionProfileCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/layout/PageHeader"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { FormDialog } from "@/components/ui/form-dialog"
import { CheckCircle, X } from "lucide-react"

export default function AdmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const admissionId = params.id as string

  const { data: admission, isLoading, error } = useAdmissionDetail(admissionId)
  const approveAdmission = useApproveAdmission()
  const rejectAdmission = useRejectAdmission()

  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const handleApprove = () => {
    approveAdmission.mutate(admissionId, {
      onSuccess: () => {
        setApproveDialogOpen(false)
        router.push("/users/pending")
      },
    })
  }

  const handleReject = () => {
    if (!rejectReason.trim()) return
    rejectAdmission.mutate(
      { admissionId, data: { rejectReason: rejectReason.trim() } },
      {
        onSuccess: () => {
          setRejectDialogOpen(false)
          setRejectReason("")
          router.push("/users/pending")
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (error || !admission) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-destructive mb-4">
          신청 정보를 불러올 수 없습니다.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/users/pending")}
        >
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const isPending = admission.userState === "AWAIT"

  return (
    <div className="space-y-6">
      <PageHeader
        title="재학인증 신청 상세"
        description="신청자의 상세 정보를 확인하고 승인 또는 거절할 수 있습니다."
        backHref="/users/pending"
        backLabel="승인 대기 요청"
        breadcrumbs={[{ label: admission.userName }]}
      />

      <AdmissionProfileCard admission={admission} />

      {isPending && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button
            variant="destructive"
            onClick={() => setRejectDialogOpen(true)}
            disabled={approveAdmission.isPending || rejectAdmission.isPending}
          >
            <X className="mr-2 h-4 w-4" />
            거절
          </Button>
          <Button
            onClick={() => setApproveDialogOpen(true)}
            disabled={approveAdmission.isPending || rejectAdmission.isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            승인
          </Button>
        </div>
      )}

      <AlertDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="재학인증 신청 승인"
        description={`"${admission.userName}"님의 인증 신청을 승인하시겠습니까?`}
        confirmText="승인"
        cancelText="취소"
        onConfirm={handleApprove}
      />

      <FormDialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          setRejectDialogOpen(open)
          if (!open) setRejectReason("")
        }}
        title="재학인증 신청 거절"
        description="거절 사유를 입력하세요."
        confirmText="거절"
        cancelText="취소"
        onConfirm={handleReject}
        isLoading={rejectAdmission.isPending}
      >
        <div className="space-y-2">
          <Label htmlFor="reject-reason">거절 사유 *</Label>
          <Input
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="거절 사유를 입력하세요"
          />
        </div>
      </FormDialog>
    </div>
  )
}
