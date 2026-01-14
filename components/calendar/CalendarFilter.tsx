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
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import type { CalendarScope, CalendarActionType } from "@/types/calendar"

export function CalendarFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  )
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")
  const [scope, setScope] = useState<CalendarScope | "ALL">(
    (searchParams.get("scope") as CalendarScope | "ALL") || "ALL"
  )
  const [actionType, setActionType] = useState<CalendarActionType | "ALL">(
    (searchParams.get("actionType") as CalendarActionType | "ALL") || "ALL"
  )
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (startDate) {
      params.set("startDate", startDate)
    }
    if (endDate) {
      params.set("endDate", endDate)
    }
    if (scope && scope !== "ALL") {
      params.set("scope", scope)
    }
    if (actionType && actionType !== "ALL") {
      params.set("actionType", actionType)
    }
    if (keyword.trim()) {
      params.set("keyword", keyword.trim())
    }

    router.push(`/calendar?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="date"
                placeholder="시작일"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                placeholder="종료일"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Select
              value={scope}
              onValueChange={(value) => setScope(value as CalendarScope | "ALL")}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="스코프" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="STUDENT">재학생</SelectItem>
                <SelectItem value="ALUMNI">졸업생</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={actionType}
              onValueChange={(value) =>
                setActionType(value as CalendarActionType | "ALL")
              }
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="액션 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="Notice">일반</SelectItem>
                <SelectItem value="Service">서비스연결</SelectItem>
                <SelectItem value="Link">외부링크</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="키워드 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
