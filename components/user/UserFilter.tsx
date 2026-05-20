"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, RotateCcw } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  ACADEMIC_STATUS_CONFIG,
  DEPARTMENT_CONFIG,
  isAcademicStatus,
  isUserStatus,
  type UserListSortBy,
  type UserStatus,
  type AcademicStatus,
} from "@/types/user"

const USER_STATE_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "ACTIVE", label: "활성" },
  { value: "AWAIT", label: "대기" },
  { value: "DROP", label: "추방" },
  { value: "REJECT", label: "거부" },
  { value: "GUEST", label: "게스트" },
]

const SORT_OPTIONS: { value: UserListSortBy; label: string }[] = [
  { value: "CREATED_AT_DESC", label: "가입일 최신순" },
  { value: "CREATED_AT_ASC", label: "가입일 오래된순" },
  { value: "NAME_ASC", label: "이름 오름차순" },
  { value: "NAME_DSC", label: "이름 내림차순" },
  { value: "STUDENT_ID_ASC", label: "학번 오름차순" },
]

const DEFAULT_STATES: UserStatus[] = ["ACTIVE"]

function parseStates(value: string | null): UserStatus[] {
  const states = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(isUserStatus)

  return states?.length ? states : DEFAULT_STATES
}

export function UserFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [keyword, setKeyword] = useState("")
  const [department, setDepartment] = useState("ALL")
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus | "ALL">("ALL")
  const [admissionYearFrom, setAdmissionYearFrom] = useState("")
  const [admissionYearTo, setAdmissionYearTo] = useState("")
  const [sortBy, setSortBy] = useState<UserListSortBy>("CREATED_AT_DESC")
  const [states, setStates] = useState<UserStatus[]>(DEFAULT_STATES)

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
        ? (nextSortBy as UserListSortBy)
        : "CREATED_AT_DESC"
    )

    setStates(parseStates(searchParams.get("states")))
  }, [searchParams])

  const pushSearch = (nextStates: UserStatus[]) => {
    const params = new URLSearchParams()

    if (keyword.trim()) {
      params.set("keyword", keyword.trim())
    }
    if (department !== "ALL") {
      params.set("department", department)
    }
    if (nextStates.length) {
      params.set("states", nextStates.join(","))
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
    if (sortBy !== "CREATED_AT_DESC") {
      params.set("sortBy", sortBy)
    }

    const query = params.toString()
    router.push(query ? `/users?${query}` : "/users")
  }

  const handleSearch = () => {
    pushSearch(states.length ? states : DEFAULT_STATES)
  }

  const handleReset = () => {
    setKeyword("")
    setDepartment("ALL")
    setStates(DEFAULT_STATES)
    setAcademicStatus("ALL")
    setAdmissionYearFrom("")
    setAdmissionYearTo("")
    setSortBy("CREATED_AT_DESC")
    router.push("/users")
  }

  const handleStateToggle = (target: UserStatus, checked: boolean) => {
    const nextStates = checked
      ? Array.from(new Set([...states, target]))
      : states.filter((state) => state !== target)

    setStates(nextStates)
  }

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
            <div className="space-y-2">
              <Label htmlFor="user-keyword">검색</Label>
              <Input
                id="user-keyword"
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
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as UserListSortBy)}>
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

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-end">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-2">
                <Label>회원 상태</Label>
                <div className="flex flex-wrap gap-x-4 gap-y-3 rounded-md border bg-muted/20 px-3 py-3">
                  {USER_STATE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 rounded-md text-sm text-foreground"
                    >
                      <Checkbox
                        checked={states.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleStateToggle(option.value, checked)
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>입학년도</Label>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
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
