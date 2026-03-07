"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useEventDetail } from "@/hooks/useEvents"
import { Label } from "@/components/ui/label"
import type { CeremonyState } from "@/types/event"
import { Check, ExternalLink, X } from "lucide-react"
import { toast } from "sonner"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string | undefined

  const { data: event, isLoading } = useEventDetail(eventId)

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

  const handlePendingAction = (action: "approve" | "reject") => {
    const label = action === "approve" ? "승인" : "거부"
    toast.info(`${label} API 연동 후 동작합니다.`)
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
                        <a
                          key={imageUrl}
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative h-32 overflow-hidden rounded-md border bg-muted"
                        >
                          <div
                            className="h-full w-full bg-cover bg-center transition-transform duration-200 group-hover:scale-105"
                            style={{ backgroundImage: `url("${imageUrl}")` }}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1">
                            <p className="truncate text-[10px] text-white">{getImageFileName(imageUrl)}</p>
                          </div>
                        </a>
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
                      onClick={() => handlePendingAction("reject")}
                    >
                      <X className="mr-1 h-4 w-4" />
                      거부
                    </Button>
                    <Button
                      className="w-full bg-black text-white hover:bg-black/85"
                      onClick={() => handlePendingAction("approve")}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      승인
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

