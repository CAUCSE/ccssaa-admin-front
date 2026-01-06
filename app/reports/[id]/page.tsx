"use client"

import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useReportDetail, useProcessReport } from "@/hooks/useReports"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = parseInt(params.id as string, 10)

  const { data: report, isLoading } = useReportDetail(reportId)
  const processReport = useProcessReport()

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: "REJECT" | "APPROVE" | null
  }>({ open: false, action: null })

  const handleReject = () => {
    if (!report) return
    processReport.mutate(
      { reportId: report.id, action: "REJECT" },
      {
        onSuccess: () => {
          setConfirmDialog({ open: false, action: null })
        },
      }
    )
  }

  const handleApprove = () => {
    if (!report) return
    processReport.mutate(
      {
        reportId: report.id,
        action: "APPROVE",
        targetId: report.targetType === "USER" ? report.targetId : undefined,
      },
      {
        onSuccess: () => {
          setConfirmDialog({ open: false, action: null })
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

  if (!report) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-destructive mb-4">신고를 불러올 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push("/reports")}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const getTargetTypeLabel = (type: typeof report.targetType) => {
    switch (type) {
      case "POST":
        return "게시글"
      case "COMMENT":
        return "댓글"
      case "USER":
        return "유저"
      default:
        return type
    }
  }

  const getStatusBadgeVariant = (status: typeof report.status) => {
    return status === "UNRESOLVED" ? "warning" : "success"
  }

  const getStatusLabel = (status: typeof report.status) => {
    return status === "UNRESOLVED" ? "미처리" : "완료"
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="신고 상세"
        description="신고 내용을 확인하고 처리할 수 있습니다."
        backHref="/reports"
        backLabel="신고 관리"
        breadcrumbs={[{ label: "신고 상세" }]}
      />

      {/* 신고 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>신고 정보</CardTitle>
            <Badge variant={getStatusBadgeVariant(report.status)}>
              {getStatusLabel(report.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">대상 유형</p>
              <p>{getTargetTypeLabel(report.targetType)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">신고자</p>
              <p>{report.reporter === "익명" ? "익명" : report.reporter}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">접수일</p>
              <p>{new Date(report.createdAt).toLocaleString("ko-KR")}</p>
            </div>
            {report.resolvedAt && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground">처리일</p>
                <p>{new Date(report.resolvedAt).toLocaleString("ko-KR")}</p>
              </div>
            )}
          </div>
          <Separator />
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">신고 사유</p>
            <p className="text-base">{report.reason}</p>
          </div>
        </CardContent>
      </Card>

      {/* 신고 대상 원문 */}
      <Card>
        <CardHeader>
          <CardTitle>신고 대상 원문</CardTitle>
        </CardHeader>
        <CardContent>
          {report.targetDeleted ? (
            <div className="p-6 bg-muted rounded-lg border-2 border-dashed">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground font-semibold">삭제된 {getTargetTypeLabel(report.targetType)}</p>
                <p className="text-sm text-muted-foreground">
                  이 {getTargetTypeLabel(report.targetType)}는 이미 삭제되었지만, 관리자는 원문을 확인할 수 있습니다.
                </p>
              </div>
            </div>
          ) : null}
          <div
            className={cn(
              "p-4 rounded-lg border",
              report.targetDeleted && "bg-muted/50 opacity-75"
            )}
          >
            {report.targetTitle && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-muted-foreground mb-1">제목</p>
                <p className="text-lg font-semibold">{report.targetTitle}</p>
              </div>
            )}
            {report.targetAuthor && (
              <div className="mb-3">
                <p className="text-sm font-semibold text-muted-foreground mb-1">작성자</p>
                <p>{report.targetAuthor}</p>
              </div>
            )}
            {report.targetContent && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">내용</p>
                <div className="prose max-w-none whitespace-pre-wrap bg-background p-4 rounded border">
                  {report.targetContent}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 처리 액션 버튼 (미처리 상태일 때만) */}
      {report.status === "UNRESOLVED" && (
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({ open: true, action: "REJECT" })}
            disabled={processReport.isPending}
          >
            <X className="mr-2 h-4 w-4" />
            반려(기각)
          </Button>
          <Button
            variant="destructive"
            onClick={() => setConfirmDialog({ open: true, action: "APPROVE" })}
            disabled={processReport.isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            승인(제재)
          </Button>
        </div>
      )}

      {/* 처리 결과 (완료 상태일 때) */}
      {report.status === "RESOLVED" && report.action && (
        <Card>
          <CardHeader>
            <CardTitle>처리 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">처리 액션</p>
              <Badge variant={report.action === "APPROVE" ? "danger" : "neutral"}>
                {report.action === "APPROVE" ? "승인(제재)" : "반려(기각)"}
              </Badge>
              {report.resolvedBy && (
                <>
                  <p className="text-sm font-semibold text-muted-foreground mt-4">처리자</p>
                  <p>{report.resolvedBy}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Dialogs */}
      <AlertDialog
        open={confirmDialog.open && confirmDialog.action === "REJECT"}
        onOpenChange={(open) =>
          setConfirmDialog({ open, action: confirmDialog.action })
        }
        title="신고 반려"
        description="이 신고를 반려(기각)하시겠습니까? 상태만 '완료'로 변경됩니다."
        variant="default"
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleReject}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
      />

      <AlertDialog
        open={confirmDialog.open && confirmDialog.action === "APPROVE"}
        onOpenChange={(open) =>
          setConfirmDialog({ open, action: confirmDialog.action })
        }
        title="신고 승인"
        description={
          report.targetType === "POST" || report.targetType === "COMMENT"
            ? "이 신고를 승인하시겠습니까? 해당 게시글이 삭제됩니다."
            : "이 신고를 승인하시겠습니까? 해당 유저가 제재 처리됩니다."
        }
        variant="destructive"
        confirmText="승인"
        cancelText="취소"
        onConfirm={handleApprove}
        onCancel={() => setConfirmDialog({ open: false, action: null })}
      />
    </div>
  )
}

