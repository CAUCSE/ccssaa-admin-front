"use client"

import { useState } from "react"
import { StorageImage } from "@/components/ui/storage-image"
import { useParams, useRouter } from "next/navigation"
import {
  useAcademicRecordApplicationDetail,
  useApproveAcademicRecord,
  useRejectAcademicRecord,
} from "@/hooks/useAcademicRecords"
import { ACADEMIC_REQUEST_STATUS_CONFIG } from "@/types/academic-record"
import type { AcademicRequestStatus } from "@/types/academic-record"
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
import { X, ArrowRight, Clock, CheckCircle2, XCircle, Ban } from "lucide-react"
import { cn } from "@/lib/utils"

/** 상태별 배너 설정 */
const STATUS_BANNER_CONFIG: Record<
  AcademicRequestStatus,
  { bg: string; icon: React.ReactNode; message: (name: string, sid: string) => string }
> = {
  AWAIT: {
    bg: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200",
    icon: <Clock className="h-5 w-5 shrink-0" />,
    message: (name, sid) => `${name}(${sid})님의 요청이 처리 대기 중입니다.`,
  },
  ACCEPT: {
    bg: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
    icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
    message: () => "승인 완료된 요청입니다.",
  },
  REJECT: {
    bg: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
    icon: <XCircle className="h-5 w-5 shrink-0" />,
    message: () => "거절된 요청입니다.",
  },
  CLOSE: {
    bg: "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300",
    icon: <Ban className="h-5 w-5 shrink-0" />,
    message: () => "종료된 요청입니다.",
  },
}

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
        <div className="h-12 bg-muted animate-pulse rounded" />
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

  const bannerConfig = STATUS_BANNER_CONFIG[detail.requestStatus] ?? STATUS_BANNER_CONFIG.CLOSE

  return (
    <div className="space-y-6">
      <PageHeader
        title="학적 상태 변경 요청 상세"
        description="학적 상태 변경 요청의 상세 내용을 확인합니다."
        backHref="/users/academic-records"
        backLabel="학적 상태 변경"
        breadcrumbs={[{ label: "요청 상세" }]}
      />

      {/* 1. 상태 요약 배너 */}
      <div className={cn("flex items-center gap-3 rounded-lg border px-4 py-3", bannerConfig.bg)}>
        {bannerConfig.icon}
        <span className="text-sm font-medium">
          {bannerConfig.message(detail.userName, detail.studentId)}
        </span>
        <Badge variant={statusConfig.variant} className="ml-auto">
          {statusConfig.label}
        </Badge>
      </div>

      {/* 2+3. 요청 정보 통합 카드 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 좌측: 요청자 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                요청자 정보
              </h3>
              <InfoRow label="이름" value={detail.userName} />
              <InfoRow label="학번" value={detail.studentId} />
              <InfoRow
                label="학과"
                value={DEPARTMENT_CONFIG[detail.department] ?? detail.department}
              />
            </div>

            {/* 우측: 학적 변경 정보 */}
            <div className="space-y-4 md:border-l md:pl-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                학적 변경 내용
              </h3>
              {/* 화살표 시각화 */}
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">현재</span>
                  <span className="rounded-md border bg-muted px-4 py-2 text-sm font-semibold">
                    {ACADEMIC_STATUS_CONFIG[detail.currentAcademicStatus] ?? detail.currentAcademicStatus}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-4" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">변경 요청</span>
                  <span className="rounded-md border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    {ACADEMIC_STATUS_CONFIG[detail.targetAcademicStatus] ?? detail.targetAcademicStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 일시 정보 (카드 푸터) */}
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>요청일시: {formatDateTime(detail.createdAt)}</span>
            <span>수정일시: {formatDateTime(detail.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>

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

      {/* 5. 첨부 이미지 (개수 표시) */}
      {detail.attachImageUrls && detail.attachImageUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              첨부 서류
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({detail.attachImageUrls.length})
              </span>
            </CardTitle>
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
                  <div className="relative h-48 w-full">
                    <StorageImage
                      src={url}
                      alt={`첨부 서류 ${index + 1}`}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
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
          <div
            className="relative h-[90vh] w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <StorageImage
              src={previewImage}
              alt="첨부 서류 미리보기"
              fill
              unoptimized
              sizes="90vw"
              className="rounded-lg object-contain"
            />
          </div>
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
