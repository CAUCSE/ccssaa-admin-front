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
import type { PaymentStatus } from "@/types/finance"

export function FinanceFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "")
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")
  const [status, setStatus] = useState<PaymentStatus | "ALL">(
    (searchParams.get("status") as PaymentStatus | "ALL") || "ALL"
  )

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (keyword.trim()) {
      params.set("keyword", keyword.trim())
    }
    if (startDate) {
      params.set("startDate", startDate)
    }
    if (endDate) {
      params.set("endDate", endDate)
    }
    if (status && status !== "ALL") {
      params.set("status", status)
    }

    router.push(`/finance?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="이름 또는 학번 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

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

          <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus | "ALL")}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="PAID">납부완료</SelectItem>
              <SelectItem value="PENDING">대기</SelectItem>
              <SelectItem value="OVERDUE">연체</SelectItem>
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

