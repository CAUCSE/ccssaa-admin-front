"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  backHref?: string
  backLabel?: string
  className?: string
}

/**
 * PageHeader 컴포넌트
 * 상세 페이지의 헤더 영역 (네비게이션 + 제목 + 설명)
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  backLabel,
  className,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  // backHref가 있으면 breadcrumbs의 첫 번째 항목으로 통합
  const allBreadcrumbs = backHref
    ? [{ label: backLabel || "뒤로가기", href: backHref }, ...(breadcrumbs || [])]
    : breadcrumbs || []

  return (
    <div className={cn("space-y-2", className)}>
      {/* 네비게이션 영역 (Breadcrumb) */}
      {allBreadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            {allBreadcrumbs.map((crumb, index) => (
              <li key={crumb.href || index} className="flex items-center gap-2">
                {index === 0 && backHref && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    {crumb.label}
                  </Button>
                )}
                {!(index === 0 && backHref) && (
                  <>
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_hsl(var(--focus-ring-soft))]"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground font-medium">{crumb.label}</span>
                    )}
                  </>
                )}
                {index < allBreadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* 제목 및 설명 영역 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

