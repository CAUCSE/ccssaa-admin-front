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
import { Search, RotateCcw } from "lucide-react"

const USER_STATE_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "AWAIT", label: "대기" },
  { value: "REJECT", label: "거부" },
] as const

export function AdmissionFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")
  const [userState, setUserState] = useState(
    searchParams.get("userState") || "ALL"
  )

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (keyword.trim()) {
      params.set("keyword", keyword.trim())
    }
    if (userState && userState !== "ALL") {
      params.set("userState", userState)
    }

    router.push(`/users/pending?${params.toString()}`)
  }

  const handleReset = () => {
    setKeyword("")
    setUserState("ALL")
    router.push("/users/pending")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium" htmlFor="admission-keyword">
              검색
            </label>
            <Input
              id="admission-keyword"
              placeholder="이름 또는 학번으로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="space-y-2 sm:w-[150px]">
            <label className="text-sm font-medium">상태</label>
            <Select value={userState} onValueChange={setUserState}>
              <SelectTrigger>
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                {USER_STATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 sm:pb-0">
            <Button onClick={handleSearch} className="flex-1 sm:flex-none">
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 sm:flex-none"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
