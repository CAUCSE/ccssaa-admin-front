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

  const [location, setLocation] = useState<"ALL" | LockerNameV2>(
    (searchParams.get("location") as "ALL" | LockerNameV2) || "ALL"
  )
  const [isActive, setIsActive] = useState(searchParams.get("isActive") ?? "")
  const [isOccupied, setIsOccupied] = useState(searchParams.get("isOccupied") ?? "")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location && location !== "ALL") params.set("location", location)
    if (isActive === "true" || isActive === "false") params.set("isActive", isActive)
    if (isOccupied === "true" || isOccupied === "false") params.set("isOccupied", isOccupied)
    router.push(`/lockers?${params.toString()}`)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={location}
            onValueChange={(v) => setLocation(v as "" | LockerNameV2)}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="위치" />
            </SelectTrigger>
            <SelectContent>
              {LOCATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={isActive || "all"} onValueChange={(v) => setIsActive(v === "all" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="활성 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="true">활성</SelectItem>
              <SelectItem value="false">비활성</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isOccupied || "all"} onValueChange={(v) => setIsOccupied(v === "all" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="사용중 여부" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="true">사용중</SelectItem>
              <SelectItem value="false">비어있음</SelectItem>
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
