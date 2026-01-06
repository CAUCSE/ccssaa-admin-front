"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  badge?: {
    label: string
    variant?: "default" | "secondary" | "success" | "warning" | "danger" | "neutral"
  }
  onClick?: () => void
  href?: string
  className?: string
}

/**
 * StatCard 컴포넌트
 * 대시보드의 KPI 카드를 표시하는 컴포넌트입니다.
 * 
 * @param title - 카드 제목
 * @param value - 표시할 값 (숫자 또는 문자열)
 * @param icon - 카드 아이콘 (선택사항)
 * @param badge - 뱃지 정보 (선택사항)
 * @param onClick - 클릭 이벤트 핸들러 (선택사항)
 * @param href - 클릭 시 이동할 경로 (선택사항)
 * @param className - 추가 CSS 클래스 (선택사항)
 */
export function StatCard({
  title,
  value,
  icon,
  badge,
  onClick,
  href,
  className,
}: StatCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else if (onClick) {
      onClick()
    }
  }

  const isClickable = !!href || !!onClick

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        isClickable && "cursor-pointer hover:border-primary",
        className
      )}
      onClick={isClickable ? handleClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {badge && (
            <Badge variant={badge.variant || "secondary"}>{badge.label}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

