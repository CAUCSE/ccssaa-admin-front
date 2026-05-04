"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RotateCcw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  ACADEMIC_STATUS_CONFIG,
  DEPARTMENT_CONFIG,
  isAcademicStatus,
  type AcademicStatus,
  type DeletedUserListSortBy,
} from "@/types/user"

const SORT_OPTIONS: { value: DeletedUserListSortBy; label: string }[] = [
  { value: "DELETED_AT_DESC", label: "삭제일 최신순" },
  { value: "DELETED_AT_ASC", label: "삭제일 오래된순" },
  { value: "NAME_ASC", label: "이름 오름차순" },
]

export function DeletedUserFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [keyword, setKeyword] = useState("")
  const [department, setDepartment] = useState("ALL")
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus | "ALL">("ALL")
  const [admissionYearFrom, setAdmissionYearFrom] = useState("")
  const [admissionYearTo, setAdmissionYearTo] = useState("")
  const [sortBy, setSortBy] = useState<DeletedUserListSortBy>("DELETED_AT_DESC")

  useEffect(() => {
    setKeyword(searchParams.get("keyword") || "")
    setDepartment(searchParams.get("department") || "ALL")

    const nextAcademicStatus = searchParams.get("academicStatus")
    setAcademicStatus(
      nextAcademicStatus && isAcademicStatus(nextAcademicStatus)
        ? nextAcademicStatus
        : "ALL"
    )

    setAdmissionYearFrom(searchParams.get("admissionYearFrom") || "")
    setAdmissionYearTo(searchParams.get("admissionYearTo") || "")

    const nextSortBy = searchParams.get("sortBy")
    setSortBy(
      SORT_OPTIONS.some((option) => option.value === nextSortBy)
        ? (nextSortBy as DeletedUserListSortBy)
        : "DELETED_AT_DESC"
    )
  }, [searchParams])

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (keyword.trim()) {
      params.set("keyword", keyword.trim())
    }
    if (department !== "ALL") {
      params.set("department", department)
    }
    if (academicStatus !== "ALL") {
      params.set("academicStatus", academicStatus)
    }
    if (admissionYearFrom.trim()) {
      params.set("admissionYearFrom", admissionYearFrom.trim())
    }
    if (admissionYearTo.trim()) {
      params.set("admissionYearTo", admissionYearTo.trim())
    }
    if (sortBy !== "DELETED_AT_DESC") {
      params.set("sortBy", sortBy)
    }

    const query = params.toString()
    router.push(query ? `/users/deleted?${query}` : "/users/deleted")
  }

  const handleReset = () => {
    setKeyword("")
    setDepartment("ALL")
    setAcademicStatus("ALL")
    setAdmissionYearFrom("")
    setAdmissionYearTo("")
    setSortBy("DELETED_AT_DESC")
    router.push("/users/deleted")
  }

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
            <div className="space-y-2">
              <Label htmlFor="deleted-user-keyword">검색</Label>
              <Input
                id="deleted-user-keyword"
                placeholder="학번, 이름, 이메일 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
              />
            </div>

            <div className="space-y-2">
              <Label>학과</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 학과" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체 학과</SelectItem>
                  {Object.entries(DEPARTMENT_CONFIG).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label>정렬</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as DeletedUserListSortBy)}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <Label>입학년도</Label>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:max-w-md">
                <Input
                  inputMode="numeric"
                  placeholder="예: 2020"
                  value={admissionYearFrom}
                  onChange={(e) => setAdmissionYearFrom(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
                <span className="text-sm text-muted-foreground">~</span>
                <Input
                  inputMode="numeric"
                  placeholder="예: 2023"
                  value={admissionYearTo}
                  onChange={(e) => setAdmissionYearTo(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                초기화
              </Button>
              <Button type="button" onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                검색
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
