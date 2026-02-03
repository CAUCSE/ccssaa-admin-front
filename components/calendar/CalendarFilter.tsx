"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import type { CalendarType } from "@/types/calendar"

const CALENDAR_TYPES: { value: CalendarType; label: string }[] = [
  { value: "ACADEMIC", label: "학사" },
  { value: "DEPARTMENT", label: "학부" },
  { value: "CCSSAA", label: "CCSSAA" },
  { value: "STUDENT_COUNCIL", label: "학생회" },
  { value: "COMPETITION", label: "대회" },
  { value: "HOLIDAY", label: "공휴일" },
]

const getTypeColor = (type: CalendarType): string => {
  switch (type) {
    case "ACADEMIC":
      return "#6B7280"
    case "DEPARTMENT":
      return "#10B981"
    case "CCSSAA":
      return "#F59E0B"
    case "STUDENT_COUNCIL":
      return "#2563EB"
    case "COMPETITION":
      return "#EF4444"
    case "HOLIDAY":
      return "#7C3AED"
    default:
      return "#6B7280"
  }
}

interface CalendarFilterProps {
  hideDateFilter?: boolean
  hideSearchButton?: boolean
  onTypeChange?: (types: CalendarType[]) => void
}

export function CalendarFilter({ hideDateFilter = false, hideSearchButton = false, onTypeChange }: CalendarFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [from, setFrom] = useState(searchParams.get("from") || "")
  const [to, setTo] = useState(searchParams.get("to") || "")
  const [selectedTypes, setSelectedTypes] = useState<CalendarType[]>(() => {
    const types = searchParams.get("types")
    return types ? types.split(",") as CalendarType[] : []
  })

  const handleTypeToggle = (type: CalendarType) => {
    setSelectedTypes((prev) => {
      const newTypes = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
      
      // 달력 뷰일 때는 즉시 콜백 호출
      if (onTypeChange) {
        onTypeChange(newTypes)
      }
      
      return newTypes
    })
  }

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (from) {
      params.set("from", from)
    }
    if (to) {
      params.set("to", to)
    }
    if (selectedTypes.length > 0) {
      params.set("types", selectedTypes.join(","))
    }

    router.push(`/calendar?${params.toString()}`)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {!hideDateFilter && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="date"
                  placeholder="시작일"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  placeholder="종료일"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium mb-2 block">일정 타입</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CALENDAR_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={selectedTypes.includes(type.value)}
                    onCheckedChange={() => handleTypeToggle(type.value)}
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: getTypeColor(type.value) }}
                    aria-hidden="true"
                  />
                  <Label
                    htmlFor={type.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {!hideSearchButton && (
            <div className="flex justify-end">
              <Button onClick={handleSearch} className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                검색
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
