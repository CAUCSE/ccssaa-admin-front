"use client"

import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useEventDetail, useApproveEvent } from "@/hooks/useEvents"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { FormDialog } from "@/components/ui/form-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { X, CheckCircle, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = parseInt(params.id as string, 10)

  const { data: event, isLoading } = useEventDetail(eventId)
  const approveEvent = useApproveEvent()

  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleApprove = () => {
    if (!event) return
    approveEvent.mutate(
      { eventId: event.id, data: { approved: true } },
      {
        onSuccess: () => {
          setApproveDialogOpen(false)
        },
      }
    )
  }

  const handleReject = () => {
    if (!event) return
    approveEvent.mutate(
      { eventId: event.id, data: { approved: false, rejectionReason } },
      {
        onSuccess: () => {
          setRejectDialogOpen(false)
          setRejectionReason("")
        },
      }
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "MARRIAGE":
        return "결혼"
      case "FUNERAL":
        return "부고"
      case "BIRTH":
        return "출산"
      case "OTHER":
        return "기타"
      default:
        return type
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning"
      case "APPROVED":
        return "success"
      case "REJECTED":
        return "danger"
      default:
        return "neutral"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "대기"
      case "APPROVED":
        return "승인"
      case "REJECTED":
        return "거부"
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-destructive mb-4">경조사를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push("/events")}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="경조사 상세"
        description="경조사 신청 정보를 확인하고 승인/거부할 수 있습니다."
        backHref="/events"
        backLabel="Events"
        breadcrumbs={[{ label: "경조사 상세" }]}
      />

      {/* 정보 영역 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 좌측: 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>신청 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">신청자</Label>
              <p className="font-medium">
                {event.applicantName} ({event.applicantStudentNo})
              </p>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">종류</Label>
              <p className="font-medium">{getEventTypeLabel(event.type)}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">경조사일</Label>
              <p className="font-medium">{formatDate(event.eventDate)}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">상태</Label>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
              </div>
            </div>
            {event.description && (
              <>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">설명</Label>
                  <p className="mt-1">{event.description}</p>
                </div>
              </>
            )}
            {event.rejectionReason && (
              <>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">거부 사유</Label>
                  <p className="mt-1 text-destructive">{event.rejectionReason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 우측: 증빙 서류 및 계좌 정보 */}
        <div className="space-y-6">
          {/* 증빙 서류 */}
          <Card>
            <CardHeader>
              <CardTitle>증빙 서류</CardTitle>
            </CardHeader>
            <CardContent>
              {event.evidenceFiles && event.evidenceFiles.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {event.evidenceFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative aspect-square border rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedImage(file)}
                    >
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                        {file}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  증빙 서류가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 계좌 정보 */}
          {event.accountNumber && (
            <Card>
              <CardHeader>
                <CardTitle>계좌 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">은행</Label>
                  <p className="font-medium">{event.accountBank || "-"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">계좌번호</Label>
                  <p className="font-medium">{event.accountNumber}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">예금주</Label>
                  <p className="font-medium">{event.accountHolder || "-"}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      {event.status === "PENDING" && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Button
            variant="destructive"
            onClick={() => setRejectDialogOpen(true)}
            disabled={approveEvent.isPending}
          >
            <X className="mr-2 h-4 w-4" />
            거부
          </Button>
          <Button
            onClick={() => setApproveDialogOpen(true)}
            disabled={approveEvent.isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            승인
          </Button>
        </div>
      )}

      {/* 승인 확인 모달 */}
      <AlertDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="경조사 승인"
        description={`"${event.applicantName}"님의 경조사를 승인하시겠습니까?`}
        confirmText="승인"
        cancelText="취소"
        onConfirm={handleApprove}
      />

      {/* 거부 사유 입력 모달 */}
      <FormDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="경조사 거부"
        description="거부 사유를 입력하세요."
        confirmText="거부"
        cancelText="취소"
        onConfirm={handleReject}
        isLoading={approveEvent.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">거부 사유 *</Label>
            <Input
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="거부 사유를 입력하세요"
            />
          </div>
        </div>
      </FormDialog>

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="w-full h-full bg-muted flex items-center justify-center rounded">
              <ImageIcon className="h-32 w-32 text-muted-foreground" />
            </div>
            <p className="text-white text-center mt-2">{selectedImage}</p>
          </div>
        </div>
      )}
    </div>
  )
}

