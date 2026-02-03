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
import { DEPARTMENTS } from "@/lib/constants"
import type { UserStatus, AcademicStatus } from "@/types/user"

export function UserFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")
  const [department, setDepartment] = useState(
    searchParams.get("department") || "전체"
  )
  const [status, setStatus] = useState<UserStatus | "ALL">(
    (searchParams.get("status") as UserStatus | "ALL") || "ALL"
  )
  const [academicStatus, setAcademicStatus] = useState<AcademicStatus | "ALL">(
    (searchParams.get("academicStatus") as AcademicStatus | "ALL") || "ALL"
  )

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    if (keyword.trim()) {
      params.set("keyword", keyword.trim())
    }
    if (department && department !== "전체") {
      params.set("department", department)
    }
    if (status && status !== "ALL") {
      params.set("status", status)
    }
    if (academicStatus && academicStatus !== "ALL") {
      params.set("academicStatus", academicStatus)
    }
    
    router.push(`/users?${params.toString()}`)
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
              placeholder="학번 또는 이름 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="학과" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(value) => setStatus(value as UserStatus | "ALL")}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="AWAIT">대기</SelectItem>
              <SelectItem value="ACTIVE">활성</SelectItem>
              <SelectItem value="DROP">추방</SelectItem>
              <SelectItem value="INACTIVE">탈퇴</SelectItem>
              <SelectItem value="REJECT">거부</SelectItem>
            </SelectContent>
          </Select>

          <Select value={academicStatus} onValueChange={(value) => setAcademicStatus(value as AcademicStatus | "ALL")}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="학적 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ENROLLED">재적</SelectItem>
              <SelectItem value="GRADUATED">졸업</SelectItem>
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

