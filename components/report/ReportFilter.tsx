"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RotateCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ACADEMIC_STATUS_CONFIG,
  isAcademicStatus,
  type AcademicStatus,
} from "@/types/user"

export function ReportFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [keyword, setKeyword] = useState("")
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus | "ALL">("ALL")

  useEffect(() => {
    setKeyword(searchParams.get("keyword") || "")

    const nextAcademicStatus = searchParams.get("academicStatus")
    setAcademicStatus(
      nextAcademicStatus && isAcademicStatus(nextAcademicStatus)
        ? nextAcademicStatus
        : "ALL"
    )
  }, [searchParams])

  const pushSearch = () => {
    const params = new URLSearchParams()

    if (keyword.trim()) {
      params.set("keyword", keyword.trim())
    }

    if (academicStatus !== "ALL") {
      params.set("academicStatus", academicStatus)
    }

    const query = params.toString()
    router.push(query ? `/reports?${query}` : "/reports")
  }

  const handleReset = () => {
    setKeyword("")
    setAcademicStatus("ALL")
    router.push("/reports")
  }

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      pushSearch()
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(240px,1.1fr)]">
            <div className="space-y-2">
              <Label htmlFor="report-keyword">검색</Label>
              <Input
                id="report-keyword"
                placeholder="이름 또는 학번 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
              />
            </div>

            <div className="space-y-2">
              <Label>학적 상태</Label>
              <Select
                value={academicStatus}
                onValueChange={(value) => setAcademicStatus(value as AcademicStatus | "ALL")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체 학적 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체 학적 상태</SelectItem>
                  {Object.entries(ACADEMIC_STATUS_CONFIG).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border bg-muted/30 px-4 py-3">
              <p className="text-sm font-medium">회원 상태</p>
              <p className="mt-1 text-sm text-muted-foreground">
                신고 회원 조회는 현재 <span className="font-medium text-foreground">ACTIVE</span>
                {" "}회원만 대상으로 합니다.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Button type="button" onClick={pushSearch}>
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
