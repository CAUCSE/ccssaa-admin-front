"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Menu, ChevronRight, Home } from "lucide-react"
import { signOut } from "@/lib/api/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMeOptional } from "@/context/MeContext"
import { NotificationCenter } from "./NotificationCenter"

const pageTitles: Record<string, string> = {
  "/dashboard": "대시보드",
  "/users": "회원 관리",
  "/users/pending": "승인 대기 요청",
  "/users/deleted": "탈퇴/추방 회원",
  "/content": "게시판 관리",
  "/content/boards": "게시판 관리",
  "/reports": "신고 관리",
  "/lockers": "사물함 현황",
  "/lockers/policies": "신청 정책 관리",
  "/lockers/policies/new": "정책 등록",
  "/lockers/logs": "로그 조회",
  "/users/push": "알림 발송",
  "/admin/audit-logs": "감사 로그",
  "/settings": "시스템 설정",
  "/settings/roles": "권한 및 역할 관리",
  "/settings/design": "디자인 / 배너 관리",
}

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith("/users/") && pathname !== "/users" && pathname !== "/users/pending") {
    return "회원 상세"
  }
  if (pathname.startsWith("/content/") && pathname !== "/content" && pathname !== "/content/boards") {
    return "게시글 상세"
  }
  if (pathname.startsWith("/reports/") && pathname !== "/reports") {
    return "신고 상세"
  }
  if (pathname.match(/^\/lockers\/policies\/\d+\/edit$/)) {
    return "정책 수정"
  }
  return pageTitles[pathname] || "관리자 페이지"
}

const breadcrumbMap: Record<string, { label: string; href: string }[]> = {
  "/dashboard": [{ label: "대시보드", href: "/dashboard" }],
  "/users": [{ label: "회원 관리", href: "/users" }],
  "/users/pending": [
    { label: "회원 관리", href: "/users" },
    { label: "승인 대기 요청", href: "/users/pending" },
  ],
  "/users/deleted": [
    { label: "회원 관리", href: "/users" },
    { label: "탈퇴/추방 회원", href: "/users/deleted" },
  ],
  "/content": [{ label: "게시판 관리", href: "/content" }],
  "/content/boards": [
    { label: "게시판 관리", href: "/content" },
    { label: "게시판 목록", href: "/content/boards" },
  ],
  "/reports": [{ label: "신고 관리", href: "/reports" }],
  "/lockers": [{ label: "사물함 현황", href: "/lockers" }],
  "/lockers/policies": [
    { label: "사물함 관리", href: "/lockers" },
    { label: "신청 정책 관리", href: "/lockers/policies" },
  ],
  "/lockers/policies/new": [
    { label: "신청 정책 관리", href: "/lockers/policies" },
    { label: "정책 등록", href: "/lockers/policies/new" },
  ],
  "/lockers/logs": [
    { label: "사물함 관리", href: "/lockers" },
    { label: "로그 조회", href: "/lockers/logs" },
  ],
  "/users/push": [{ label: "알림 발송", href: "/users/push" }],
  "/admin/audit-logs": [{ label: "감사 로그", href: "/admin/audit-logs" }],
  "/settings": [{ label: "시스템 설정", href: "/settings" }],
  "/settings/roles": [
    { label: "시스템 설정", href: "/settings" },
    { label: "권한 및 역할 관리", href: "/settings/roles" },
  ],
  "/settings/design": [
    { label: "시스템 설정", href: "/settings" },
    { label: "디자인 / 배너 관리", href: "/settings/design" },
  ],
}

const getBreadcrumbForPath = (pathname: string): { label: string; href: string }[] => {
  if (pathname.startsWith("/users/") && pathname !== "/users" && pathname !== "/users/pending") {
    return [
      { label: "회원 관리", href: "/users" },
      { label: "회원 상세", href: pathname },
    ]
  }
  if (pathname.startsWith("/content/") && pathname !== "/content" && pathname !== "/content/boards") {
    return [
      { label: "게시판 관리", href: "/content" },
      { label: "게시글 상세", href: pathname },
    ]
  }
  if (pathname.startsWith("/reports/") && pathname !== "/reports") {
    return [
      { label: "신고 관리", href: "/reports" },
      { label: "신고 상세", href: pathname },
    ]
  }
  const policyEditMatch = pathname.match(/^(\/lockers\/policies\/(\d+)\/edit)$/)
  if (policyEditMatch) {
    return [
      { label: "신청 정책 관리", href: "/lockers/policies" },
      { label: "정책 수정", href: pathname },
    ]
  }
  return breadcrumbMap[pathname] || []
}

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const meContext = useMeOptional()

  const currentPageTitle = getPageTitle(pathname)
  const breadcrumbs = getBreadcrumbForPath(pathname)
  const displayName = meContext?.me?.name ?? "관리자"

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="flex h-14 items-center border-b bg-card px-4 lg:px-6">
      <div className="flex flex-1 items-center justify-between gap-4">
        {/* Left: hamburger + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMenuClick}
            className="shrink-0 rounded-md p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_hsl(var(--focus-ring-soft))] lg:hidden"
            aria-label="메뉴 열기"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* PC: breadcrumb */}
          {breadcrumbs.length > 0 ? (
            <nav className="hidden lg:flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
              <Link
                href="/dashboard"
                className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_hsl(var(--focus-ring-soft))]"
              >
                <Home className="h-4 w-4" />
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <span key={`${index}-${crumb.href}`} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-foreground">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_hsl(var(--focus-ring-soft))]"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          ) : (
            <span className="hidden lg:block text-sm font-medium">{currentPageTitle}</span>
          )}

          {/* Mobile: title only */}
          <span className="lg:hidden text-sm font-semibold truncate">{currentPageTitle}</span>
        </div>

        {/* Right: user info + logout */}
        <div className="flex items-center gap-1 shrink-0">
          <NotificationCenter />
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground mr-2">
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate max-w-[120px]">{displayName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">로그아웃</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
