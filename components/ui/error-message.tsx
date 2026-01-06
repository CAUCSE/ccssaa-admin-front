"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  retryText?: string
  className?: string
}

/**
 * 에러 메시지 표시 컴포넌트
 * API 에러나 기타 오류 상황에서 사용자에게 에러 정보를 표시합니다.
 */
export function ErrorMessage({
  title = "오류가 발생했습니다",
  message,
  onRetry,
  retryText = "다시 시도",
  className,
}: ErrorMessageProps) {
  return (
    <Card className={cn("border-destructive", className)}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-6 text-muted-foreground">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            {retryText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

