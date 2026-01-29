"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Menu, ChevronRight, Home } from "lucide-react"
import { signOut } from "@/lib/api/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMeOptional } from "@/context/MeContext"

const pageTitles: Record<string, string> = {
  "/dashboard": "대시보드",
  "/users": "회원 관리",
  "/users/pending": "가입 승인 대기",
  "/users/reported": "신고된 회원",
  "/content": "게시판 관리",
  "/content/boards": "게시판 관리",
  "/reports": "신고 관리",
  "/settings": "시스템 설정",
  "/settings/roles": "권한 및 역할 관리",
  "/settings/design": "디자인 / 배너 관리",
}

// 동적 경로 패턴 매칭을 위한 헬퍼 함수
const getPageTitle = (pathname: string): string => {
  // /users/[id] 패턴
  if (pathname.startsWith("/users/") && pathname !== "/users" && pathname !== "/users/pending" && pathname !== "/users/reported") {
    return "회원 상세"
  }
  // /content/[id] 패턴
  if (pathname.startsWith("/content/") && pathname !== "/content" && pathname !== "/content/boards") {
    return "게시글 상세"
  }
  // /reports/[id] 패턴
  if (pathname.startsWith("/reports/") && pathname !== "/reports") {
    return "신고 상세"
  }
  // 기본 pageTitles에서 찾기
  return pageTitles[pathname] || "관리자 페이지"
}

const breadcrumbMap: Record<string, { label: string; href: string }[]> = {
  "/dashboard": [{ label: "대시보드", href: "/dashboard" }],
  "/users": [{ label: "회원 관리", href: "/users" }],
  "/users/pending": [
    { label: "회원 관리", href: "/users" },
    { label: "가입 승인 대기", href: "/users/pending" },
  ],
  "/users/reported": [
    { label: "회원 관리", href: "/users" },
    { label: "신고된 회원", href: "/users/reported" },
  ],
  "/content": [{ label: "게시판 관리", href: "/content" }],
  "/content/boards": [
    { label: "게시판 관리", href: "/content" },
    { label: "게시판 목록", href: "/content/boards" },
  ],
  "/reports": [{ label: "신고 관리", href: "/reports" }],
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

// 동적 경로 패턴 매칭을 위한 헬퍼 함수
const getBreadcrumbForPath = (pathname: string): { label: string; href: string }[] => {
  // /users/[id] 패턴
  if (pathname.startsWith("/users/") && pathname !== "/users" && pathname !== "/users/pending" && pathname !== "/users/reported") {
    return [
      { label: "회원 관리", href: "/users" },
      { label: "회원 상세", href: pathname },
    ]
  }
  // /content/[id] 패턴
  if (pathname.startsWith("/content/") && pathname !== "/content" && pathname !== "/content/boards") {
    return [
      { label: "게시판 관리", href: "/content" },
      { label: "게시글 상세", href: pathname },
    ]
  }
  // /reports/[id] 패턴
  if (pathname.startsWith("/reports/") && pathname !== "/reports") {
    return [
      { label: "신고 관리", href: "/reports" },
      { label: "신고 상세", href: pathname },
    ]
  }
  // 기본 breadcrumbMap에서 찾기
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
    <header className="flex min-h-[80px] flex-col border-b bg-card">
      <div className="flex flex-col space-y-2 px-6 py-6">
        {/* 제목 및 액션 영역 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 모바일 햄버거 버튼 */}
            <button
              onClick={onMenuClick}
              className="lg:hidden rounded-md p-1 hover:bg-accent"
              aria-label="메뉴 열기"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold">{currentPageTitle}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{displayName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
        {/* 브레드크럼 (PC 환경에서만) */}
        {breadcrumbs.length > 0 && (
          <nav className="hidden lg:block" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  <Home className="h-4 w-4" />
                </Link>
              </li>
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </header>
  )
}

