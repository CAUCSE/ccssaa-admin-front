"use client"

import { useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useApproveEvent, useEventDetail, useRejectEvent } from "@/hooks/useEvents"
import { Label } from "@/components/ui/label"
import type { CeremonyState } from "@/types/event"
import { Check, ExternalLink, X } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
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

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string | undefined

  const { data: event, isLoading } = useEventDetail(eventId)
  const approveEventMutation = useApproveEvent()
  const rejectEventMutation = useRejectEvent()
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("경조사 신청 요건에 부합하지 않습니다.")
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  const getCeremonyTypeLabel = (type: string) => {
    return type
  }

  const getStatusBadgeVariant = (status: CeremonyState) => {
    switch (status) {
      case "AWAIT":
        return "warning"
      case "ACCEPT":
        return "success"
      case "REJECT":
        return "danger"
      case "CLOSE":
        return "neutral"
      default:
        return "neutral"
    }
  }

  const getStatusLabel = (status: CeremonyState) => {
    switch (status) {
      case "AWAIT":
        return "대기"
      case "ACCEPT":
        return "수락"
      case "REJECT":
        return "거부"
      case "CLOSE":
        return "종료"
      default:
        return status
    }
  }

  const getTypeBadgeClassName = (type: string) => {
    if (type === "경사") {
      return "bg-neutral-900 text-white border-transparent hover:bg-neutral-800"
    }
    if (type === "조사") {
      return "bg-indigo-700 text-white border-transparent hover:bg-indigo-600"
    }
    return "bg-slate-600 text-white border-transparent hover:bg-slate-500"
  }

  const getAdmissionYearText = () => {
    if (!event) return "-"
    if (event.isSetAll) return "전체"
    if (event.targetAdmissionYears.length === 0) return "-"
    return event.targetAdmissionYears.map((year) => `${year}학번`)
  }

  const getImageFileName = (url: string) => {
    const pureUrl = url.split("?")[0]
    const tokens = pureUrl.split("/")
    return tokens[tokens.length - 1] || "image"
  }

  const handleApprove = () => {
    if (!eventId) return
    approveEventMutation.mutate(eventId, {
      onSuccess: () => {
        setApproveDialogOpen(false)
      },
    })
  }

  const openRejectDialog = () => {
    setRejectReason("경조사 신청 요건에 부합하지 않습니다.")
    setRejectDialogOpen(true)
  }

  const handleReject = () => {
    if (!eventId) return
    const trimmedReason = rejectReason.trim()
    if (!trimmedReason) {
      toast.error("거절 사유를 입력해주세요.")
      return
    }

    rejectEventMutation.mutate(
      { eventId, rejectReason: trimmedReason },
      {
        onSuccess: () => {
          setRejectDialogOpen(false)
          setRejectReason("경조사 신청 요건에 부합하지 않습니다.")
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

  const admissionYearText = getAdmissionYearText()

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex items-center justify-between rounded-xl border bg-card px-5 py-4">
        <div>
          <h1 className="text-2xl font-bold">경조사 상세</h1>
          <p className="mt-1 text-sm text-muted-foreground">신청 정보를 확인하고 처리할 수 있습니다.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/events")}>
          목록으로
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20 py-4">
              <CardTitle className="text-base">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">신청자</Label>
                <p className="mt-1 text-sm font-medium">{event.applicant || "-"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">경조사 대상자</Label>
                <p className="mt-1 text-sm font-medium">{event.subject || "-"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">분류</Label>
                <div className="mt-2">
                  <Badge className={getTypeBadgeClassName(getCeremonyTypeLabel(event.type))}>
                    {getCeremonyTypeLabel(event.type)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">상세 분류</Label>
                <p className="mt-1 text-sm font-medium">{event.category || "-"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">경조사 기간</Label>
                <p className="mt-1 text-sm font-medium">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20 py-4">
              <CardTitle className="text-base">상세 내용</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div>
                <Label className="text-xs text-muted-foreground">주소</Label>
                <p className="mt-1 text-sm font-medium">
                  {[event.address, event.detailedAddress].filter(Boolean).join(" ") || "-"}
                </p>
                {event.postalAddress && (
                  <p className="mt-1 text-xs text-muted-foreground">우편번호: {event.postalAddress}</p>
                )}
              </div>
              <Separator />
              <div>
                <Label className="block text-xs text-muted-foreground">관련 링크</Label>
                {event.link ? (
                  <a
                    href={event.link.startsWith("http") ? event.link : `https://${event.link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex w-fit items-center gap-1 text-sm font-medium text-foreground hover:underline"
                  >
                    {event.link}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium">-</p>
                )}
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">문의</Label>
                <p className="mt-1 text-sm font-medium">{event.contact || "-"}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">내용</Label>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{event.content || "-"}</p>
                {event.attachedImageUrlList?.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-xs text-muted-foreground">첨부 사진</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {event.attachedImageUrlList.map((imageUrl) => (
                        <button
                          type="button"
                          key={imageUrl}
                          className="group relative h-32 overflow-hidden rounded-md border bg-muted"
                          onClick={() => setPreviewImageUrl(imageUrl)}
                        >
                          <div
                            className="h-full w-full bg-cover bg-center transition-transform duration-200 group-hover:scale-105"
                            style={{ backgroundImage: `url("${imageUrl}")` }}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1">
                            <p className="truncate text-[10px] text-white">{getImageFileName(imageUrl)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {event.note && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">비고</Label>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-destructive">{event.note}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="border-b bg-muted/20 py-4">
              <CardTitle className="text-base">처리 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div>
                <Label className="text-xs text-muted-foreground">상태</Label>
                <div className="mt-2">
                  <Badge variant={getStatusBadgeVariant(event.state)}>{getStatusLabel(event.state)}</Badge>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">알림 보낼 학번</Label>
                {Array.isArray(admissionYearText) ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {admissionYearText.map((year) => (
                      <Badge key={year} variant="secondary" className="rounded-md px-2 py-0.5 font-medium">
                        {year}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-sm font-medium">{admissionYearText}</p>
                )}
              </div>

              {event.state === "AWAIT" && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={openRejectDialog}
                      disabled={approveEventMutation.isPending || rejectEventMutation.isPending}
                    >
                      <X className="mr-1 h-4 w-4" />
                      {rejectEventMutation.isPending ? "거부 처리 중..." : "거부"}
                    </Button>
                    <Button
                      className="w-full bg-black text-white hover:bg-black/85"
                      onClick={() => setApproveDialogOpen(true)}
                      disabled={approveEventMutation.isPending || rejectEventMutation.isPending}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      {approveEventMutation.isPending ? "승인 처리 중..." : "승인"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialogRoot open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>경조사 승인 확인</AlertDialogTitle>
            <AlertDialogDescription>이 경조사 신청을 승인하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleApprove()
              }}
            >
              승인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>

      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          setRejectDialogOpen(open)
          if (!open) {
            setRejectReason("경조사 신청 요건에 부합하지 않습니다.")
          }
        }}
      >
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>거절 사유 입력</DialogTitle>
            <DialogDescription>
              거절 사유를 입력해 주세요. 입력한 내용은 신청자 안내에 사용됩니다.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="거절 사유를 입력하세요"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectReason("경조사 신청 요건에 부합하지 않습니다.")
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                approveEventMutation.isPending ||
                rejectEventMutation.isPending ||
                !rejectReason.trim()
              }
            >
              {rejectEventMutation.isPending ? "거절 처리 중..." : "거절"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70"
          onClick={() => setPreviewImageUrl(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md bg-black/50 p-2 text-white hover:bg-black/70"
            onClick={(e) => {
              e.stopPropagation()
              setPreviewImageUrl(null)
            }}
            aria-label="이미지 닫기"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex h-full w-full items-center justify-center p-6 pt-16">
            <div
              className="relative h-full w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={previewImageUrl}
                alt="첨부 이미지 미리보기"
                fill
                unoptimized
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
