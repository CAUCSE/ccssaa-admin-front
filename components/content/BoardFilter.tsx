"use client"

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
import { READ_SCOPES, WRITE_SCOPES } from "@/lib/constants/board-v2-form"
import type { BoardReadScope, BoardWriteScope } from "@/types/board-v2"

export type BoardFilterValues = {
  nameKeyword: string
  readScope: BoardReadScope | "ALL"
  writeScope: BoardWriteScope | "ALL"
  isAnonymous: "ALL" | "Y" | "N"
  isNotice: "ALL" | "Y" | "N"
}

const defaultFilter: BoardFilterValues = {
  nameKeyword: "",
  readScope: "ALL",
  writeScope: "ALL",
  isAnonymous: "ALL",
  isNotice: "ALL",
}

interface BoardFilterProps {
  value: BoardFilterValues
  onChange: (value: BoardFilterValues) => void
}

export function BoardFilter({ value, onChange }: BoardFilterProps) {
  const handleChange = (patch: Partial<BoardFilterValues>) => {
    onChange({ ...value, ...patch })
  }

  const handleReset = () => {
    onChange(defaultFilter)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="게시판 이름 검색"
                value={value.nameKeyword}
                onChange={(e) => handleChange({ nameKeyword: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                className="h-9 py-1.5"
              />
            </div>
            <Select
              value={value.readScope}
              onValueChange={(v) => handleChange({ readScope: v as BoardReadScope | "ALL" })}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-9">
                <SelectValue placeholder="읽기 권한" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">읽기 권한 전체</SelectItem>
                {READ_SCOPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={value.writeScope}
              onValueChange={(v) => handleChange({ writeScope: v as BoardWriteScope | "ALL" })}
            >
              <SelectTrigger className="w-full sm:w-[200px] h-9">
                <SelectValue placeholder="쓰기 권한" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">쓰기 권한 전체</SelectItem>
                {WRITE_SCOPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={value.isAnonymous}
              onValueChange={(v) => handleChange({ isAnonymous: v as "ALL" | "Y" | "N" })}
            >
              <SelectTrigger className="w-full sm:w-[120px] h-9">
                <SelectValue placeholder="익명 여부" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">익명 전체</SelectItem>
                <SelectItem value="Y">익명</SelectItem>
                <SelectItem value="N">실명</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={value.isNotice}
              onValueChange={(v) => handleChange({ isNotice: v as "ALL" | "Y" | "N" })}
            >
              <SelectTrigger className="w-full sm:w-[120px] h-9">
                <SelectValue placeholder="알림 여부" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">알림 전체</SelectItem>
                <SelectItem value="Y">알림 가능</SelectItem>
                <SelectItem value="N">알림 불가</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleReset}
                className="h-9"
              >
                초기화
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
