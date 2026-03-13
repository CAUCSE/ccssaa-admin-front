"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import type { ScheduleType } from "@/types/schedule"

const SCHEDULE_TYPES: { value: ScheduleType; label: string }[] = [
  { value: "ACADEMIC", label: "학사" },
  { value: "DEPARTMENT", label: "학부" },
  { value: "CCSSAA", label: "CCSSAA" },
  { value: "STUDENT_COUNCIL", label: "학생회" },
  { value: "HOLIDAY", label: "공휴일" },
]

const getTypeColor = (type: ScheduleType): string => {
  switch (type) {
    case "ACADEMIC":
      return "#9CA3AF"
    case "DEPARTMENT":
      return "#60A5FA"
    case "CCSSAA":
      return "#7DD3FC"
    case "STUDENT_COUNCIL":
      return "#FB923C"
    case "HOLIDAY":
      return "#F87171"
    default:
      return "#6B7280"
  }
}

interface ScheduleFilterProps {
  hideDateFilter?: boolean
  hideSearchButton?: boolean
  onTypeChange?: (types: ScheduleType[]) => void
}

export function ScheduleFilter({ hideDateFilter = false, hideSearchButton = false, onTypeChange }: ScheduleFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [from, setFrom] = useState(searchParams.get("from") || "")
  const [to, setTo] = useState(searchParams.get("to") || "")
  const [selectedTypes, setSelectedTypes] = useState<ScheduleType[]>(() => {
    const types = searchParams.get("types")
    return types ? types.split(",") as ScheduleType[] : []
  })

  const handleTypeToggle = (type: ScheduleType) => {
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

    router.push(`/schedule?${params.toString()}`)
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
            <Label className="text-sm font-medium mb-2 block">스케줄 타입</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SCHEDULE_TYPES.map((type) => (
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
