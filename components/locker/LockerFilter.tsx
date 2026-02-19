"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Search, RotateCcw } from "lucide-react"
import type { LockerNameV2 } from "@/types/locker"

const LOCATION_OPTIONS: { value: "ALL" | LockerNameV2; label: string }[] = [
  { value: "ALL", label: "전체 위치" },
  { value: "SECOND", label: "2층" },
  { value: "THIRD", label: "3층" },
  { value: "FOURTH", label: "4층" },
]

export function LockerFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [userKeyword, setUserKeyword] = useState(searchParams.get("userKeyword") ?? "")
  const [location, setLocation] = useState<"ALL" | LockerNameV2>(
    (searchParams.get("location") as "ALL" | LockerNameV2) || "ALL"
  )
  const [isActive, setIsActive] = useState(searchParams.get("isActive") ?? "")
  const [isOccupied, setIsOccupied] = useState(searchParams.get("isOccupied") ?? "")
  const [isExpired, setIsExpired] = useState(searchParams.get("isExpired") ?? "")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (userKeyword.trim()) params.set("userKeyword", userKeyword.trim())
    if (location && location !== "ALL") params.set("location", location)
    if (isActive === "true" || isActive === "false") params.set("isActive", isActive)
    if (isOccupied === "true" || isOccupied === "false") params.set("isOccupied", isOccupied)
    if (isExpired === "true" || isExpired === "false") params.set("isExpired", isExpired)
    router.push(`/lockers?${params.toString()}`)
  }

  const hasActiveFilters = !!(
    userKeyword.trim() ||
    (location && location !== "ALL") ||
    (isActive === "true" || isActive === "false") ||
    (isOccupied === "true" || isOccupied === "false") ||
    (isExpired === "true" || isExpired === "false")
  )

  const handleReset = () => {
    setUserKeyword("")
    setLocation("ALL")
    setIsActive("")
    setIsOccupied("")
    setIsExpired("")
    router.push("/lockers")
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">검색 조건</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              초기화
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[180px] space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              이름·이메일·학번
            </Label>
            <Input
              placeholder="검색어 입력"
              value={userKeyword}
              onChange={(e) => setUserKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="w-full sm:w-[120px] space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">위치</Label>
            <Select
              value={location}
              onValueChange={(v) => setLocation((v || "ALL") as "ALL" | LockerNameV2)}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[110px] space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">활성 상태</Label>
            <Select value={isActive || "all"} onValueChange={(v) => setIsActive(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="true">활성</SelectItem>
                <SelectItem value="false">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[110px] space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">사용중 여부</Label>
            <Select
              value={isOccupied || "all"}
              onValueChange={(v) => setIsOccupied(v === "all" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="true">사용중</SelectItem>
                <SelectItem value="false">비어있음</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[110px] space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">만료 여부</Label>
            <Select value={isExpired || "all"} onValueChange={(v) => setIsExpired(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="true">만료됨</SelectItem>
                <SelectItem value="false">만료 아님</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} className="gap-2 shrink-0">
            <Search className="h-4 w-4" />
            검색
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
