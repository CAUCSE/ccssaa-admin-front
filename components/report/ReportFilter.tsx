"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import type { ReportTargetType, ReportStatus } from "@/types/report"

export function ReportFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [targetType, setTargetType] = useState<ReportTargetType | "ALL">(
    (searchParams.get("targetType") as ReportTargetType | "ALL") || "ALL"
  )
  const [status, setStatus] = useState<ReportStatus | "ALL">(
    (searchParams.get("status") as ReportStatus | "ALL") || "ALL"
  )

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (targetType && targetType !== "ALL") {
      params.set("targetType", targetType)
    }
    if (status && status !== "ALL") {
      params.set("status", status)
    }

    router.push(`/reports?${params.toString()}`)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={targetType}
            onValueChange={(value) => setTargetType(value as ReportTargetType | "ALL")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="대상 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="POST">게시글</SelectItem>
              <SelectItem value="COMMENT">댓글</SelectItem>
              <SelectItem value="USER">유저</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as ReportStatus | "ALL")}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="처리 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="UNRESOLVED">미처리</SelectItem>
              <SelectItem value="RESOLVED">완료</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            검색
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

