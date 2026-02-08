"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  useAcademicRecordApplicationDetail,
  useApproveAcademicRecord,
  useRejectAcademicRecord,
} from "@/hooks/useAcademicRecords"
import { ACADEMIC_REQUEST_STATUS_CONFIG } from "@/types/academic-record"
import { DEPARTMENT_CONFIG, ACADEMIC_STATUS_CONFIG } from "@/types/user"
import { PageHeader } from "@/components/layout/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

export default function AcademicRecordDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string

  const { data: detail, isLoading, error } = useAcademicRecordApplicationDetail(applicationId)
  const approveMutation = useApproveAcademicRecord()
  const rejectMutation = useRejectAcademicRecord()

  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
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

  if (error || !detail) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-destructive mb-4">요청 정보를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push("/users/academic-records")}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const statusConfig = ACADEMIC_REQUEST_STATUS_CONFIG[detail.requestStatus] ?? {
    label: detail.requestStatus,
    variant: "neutral" as const,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="학적 상태 변경 요청 상세"
        description="학적 상태 변경 요청의 상세 내용을 확인합니다."
        backHref="/users/academic-records"
        backLabel="학적 상태 변경"
        breadcrumbs={[{ label: "요청 상세" }]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* 요청자 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">요청자 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="이름" value={detail.userName} />
            <InfoRow label="학번" value={detail.studentId} />
            <InfoRow
              label="학과"
              value={DEPARTMENT_CONFIG[detail.department] ?? detail.department}
            />
            <InfoRow label="요청일시" value={formatDateTime(detail.createdAt)} />
            <InfoRow label="수정일시" value={formatDateTime(detail.updatedAt)} />
          </CardContent>
        </Card>

        {/* 학적 변경 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">학적 변경 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label="변경 전 학적 상태"
              value={ACADEMIC_STATUS_CONFIG[detail.currentAcademicStatus] ?? detail.currentAcademicStatus}
            />
            <InfoRow
              label="변경 요청 학적"
              value={ACADEMIC_STATUS_CONFIG[detail.targetAcademicStatus] ?? detail.targetAcademicStatus}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">처리 상태</span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 유저 작성 특이사항 */}
      {detail.note && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">유저 작성 특이사항</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{detail.note}</p>
          </CardContent>
        </Card>
      )}

      {/* 반려 사유 */}
      {detail.requestStatus === "REJECT" && detail.rejectMessage && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">반려 사유</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{detail.rejectMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* 첨부 이미지 */}
      {detail.attachImageUrls && detail.attachImageUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">첨부 서류</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {detail.attachImageUrls.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPreviewImage(url)}
                  className="group relative overflow-hidden rounded-lg border cursor-pointer text-left"
                >
                  <img
                    src={url}
                    alt={`첨부 서류 ${index + 1}`}
                    className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white bg-black/50 rounded-full px-3 py-1 text-sm">
                      크게 보기
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 이미지 미리보기 오버레이 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
            aria-label="닫기"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewImage}
            alt="첨부 서류 미리보기"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Separator />

      {/* 하단 액션 */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/users/academic-records")}>
          목록으로
        </Button>
        {detail.requestStatus === "AWAIT" && (
          <>
            <Button
              variant="destructive"
              onClick={() => setRejectDialogOpen(true)}
              disabled={rejectMutation.isPending}
            >
              거절
            </Button>
            <Button
              onClick={() => setApproveDialogOpen(true)}
              disabled={approveMutation.isPending}
            >
              승인
            </Button>
          </>
        )}
      </div>

      {/* 승인 확인 다이얼로그 */}
      <AlertDialogRoot open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>승인 확인</AlertDialogTitle>
            <AlertDialogDescription>
              이 학적 상태 변경 요청을 승인하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                approveMutation.mutate(applicationId)
                setApproveDialogOpen(false)
              }}
            >
              승인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>

      {/* 거절 사유 입력 다이얼로그 */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>거절 사유 입력</DialogTitle>
            <DialogDescription>
              거절 사유를 입력해 주세요. 사유는 요청자에게 전달됩니다.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="거절 사유를 입력하세요"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => {
                rejectMutation.mutate(
                  { applicationId, rejectReason: rejectReason.trim() },
                  {
                    onSuccess: () => {
                      setRejectDialogOpen(false)
                      setRejectReason("")
                    },
                  }
                )
              }}
            >
              {rejectMutation.isPending ? "처리 중..." : "거절"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** 정보 표시용 행 컴포넌트 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
