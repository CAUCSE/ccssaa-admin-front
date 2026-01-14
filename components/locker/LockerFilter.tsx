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
import type { LockerStatus } from "@/types/locker"

export function LockerFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [number, setNumber] = useState(searchParams.get("number") || "")
  const [status, setStatus] = useState<LockerStatus | "ALL">(
    (searchParams.get("status") as LockerStatus | "ALL") || "ALL"
  )
  const [userKeyword, setUserKeyword] = useState(
    searchParams.get("userKeyword") || ""
  )

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (number.trim()) {
      params.set("number", number.trim())
    }
    if (status && status !== "ALL") {
      params.set("status", status)
    }
    if (userKeyword.trim()) {
      params.set("userKeyword", userKeyword.trim())
    }

    router.push(`/lockers?${params.toString()}`)
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
              placeholder="사물함 번호 검색"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as LockerStatus | "ALL")}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="AVAILABLE">사용가능</SelectItem>
              <SelectItem value="OCCUPIED">사용중</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1">
            <Input
              placeholder="사용자 검색 (이름, 학번)"
              value={userKeyword}
              onChange={(e) => setUserKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <Button onClick={handleSearch} className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            검색
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
