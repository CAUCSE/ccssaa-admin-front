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
import type { CalendarType } from "@/types/calendar"

export function CalendarFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  )
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")
  const [type, setType] = useState<CalendarType | "">(
    (searchParams.get("type") as CalendarType) || ""
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
    if (type) {
      params.set("type", type)
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
              value={type}
              onValueChange={(value) => setType(value as CalendarType | "")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="일정 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                <SelectItem value="ACADEMIC">학사일정</SelectItem>
                <SelectItem value="DEPARTMENT">학부행사</SelectItem>
                <SelectItem value="CCSSAA">CCSSAA</SelectItem>
                <SelectItem value="STUDENT_COUNCIL">학생회</SelectItem>
                <SelectItem value="COMPETITION">대회</SelectItem>
                <SelectItem value="HOLIDAY">공휴일</SelectItem>
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
