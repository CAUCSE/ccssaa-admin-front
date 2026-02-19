"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { getStatusBadge } from "@/lib/utils/status-badge"
import { DEPARTMENT_CONFIG, ACADEMIC_STATUS_CONFIG } from "@/types/user"
import type { AdmissionDetail } from "@/types/admission"

interface AdmissionProfileCardProps {
  admission: AdmissionDetail
}

export function AdmissionProfileCard({ admission }: AdmissionProfileCardProps) {
  const statusBadge = getStatusBadge(admission.userState)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>신청자 정보</CardTitle>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="이름" value={admission.userName} />
            <InfoRow label="이메일" value={admission.userEmail} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>신청 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="학번" value={admission.requestedStudentId} mono />
            <InfoRow
              label="학과"
              value={
                DEPARTMENT_CONFIG[admission.requestedDepartment] ??
                admission.requestedDepartment
              }
            />
            <InfoRow
              label="입학년도"
              value={String(admission.requestedAdmissionYear)}
            />
            <InfoRow
              label="학적 상태"
              value={
                ACADEMIC_STATUS_CONFIG[admission.requestedAcademicStatus] ??
                admission.requestedAcademicStatus
              }
            />
            <InfoRow label="신청일" value={formatDateTime(admission.createdAt)} />
            <InfoRow label="수정일" value={formatDateTime(admission.updatedAt)} />
          </div>
        </CardContent>
      </Card>

      {(admission.description || admission.attachImageUrls.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>증빙서류</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {admission.description && (
              <p className="text-sm whitespace-pre-wrap">{admission.description}</p>
            )}
            {admission.attachImageUrls.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {admission.attachImageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(url)}
                    className="block overflow-hidden rounded-md border hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <img
                      src={url}
                      alt={`첨부 이미지 ${idx + 1}`}
                      className="w-full h-auto object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={selectedImage}
            alt="첨부 이미지 확대"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  )
}
