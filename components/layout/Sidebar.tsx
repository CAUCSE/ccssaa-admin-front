"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  ChevronRight,
  X,
  AlertTriangle,
  Calendar,
  Lock,
  CalendarDays,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useDashboard } from "@/hooks/useDashboard"

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: number | (() => number | undefined)
  children?: SidebarItem[]
}

const getSidebarItems = (
  pendingApprovals: number | undefined,
  pendingReports: number | undefined
): SidebarItem[] => [
  {
    title: "대시보드",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "회원 관리",
    href: "/users",
    icon: <Users className="h-5 w-5" />,
    children: [
      {
        title: "전체",
        href: "/users",
        icon: <ChevronRight className="h-4 w-4" />,
      },
      {
        title: "승인 대기",
        href: "/users/pending",
        icon: <ChevronRight className="h-4 w-4" />,
        badge: pendingApprovals,
      },
      {
        title: "신고된 회원",
        href: "/users/reported",
        icon: <ChevronRight className="h-4 w-4" />,
        badge: pendingReports,
      },
    ],
  },
  {
    title: "게시판 관리",
    href: "/content",
    icon: <FileText className="h-5 w-5" />,
    children: [
      {
        title: "게시글",
        href: "/content",
        icon: <ChevronRight className="h-4 w-4" />,
      },
      {
        title: "게시판",
        href: "/content/boards",
        icon: <ChevronRight className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "신고 관리",
    href: "/reports",
    icon: <AlertTriangle className="h-5 w-5" />,
    badge: pendingReports,
  },
  {
    title: "경조사",
    href: "/events",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "사물함 관리",
    href: "/lockers",
    icon: <Lock className="h-5 w-5" />,
  },
  {
    title: "캘린더 관리",
    href: "/calendar",
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    title: "시스템 설정",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
    children: [
      {
        title: "권한 및 역할",
        href: "/settings/roles",
        icon: <ChevronRight className="h-4 w-4" />,
      },
      {
        title: "디자인/배너",
        href: "/settings/design",
        icon: <ChevronRight className="h-4 w-4" />,
      },
    ],
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
}

/**
 * Sidebar 컴포넌트
 * 좌측 네비게이션 메뉴를 표시하는 컴포넌트입니다.
 * 
 * - PC: 고정형 250px 너비
 * - Mobile: 햄버거 드로어 (Overlay Drawer)
 * - 대시보드 데이터를 활용하여 Badge 표시 (대기 인원 수, 미처리 신고 수)
 * 
 * @param isOpen - 사이드바 열림 상태 (기본값: true)
 * @param onClose - 사이드바 닫기 핸들러 (모바일용)
 * @param isMobile - 모바일 모드 여부 (기본값: false)
 */
export function Sidebar({ isOpen = true, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname()
  const { data: dashboardData } = useDashboard()

  const pendingApprovals = dashboardData?.stats.pendingApprovals
  const pendingReports = dashboardData?.stats.pendingReports

  const sidebarItems = getSidebarItems(pendingApprovals, pendingReports)

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/"
    }
    return pathname.startsWith(href)
  }

  // 모바일에서 링크 클릭 시 사이드바 닫기
  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  const getBadgeValue = (badge: number | (() => number | undefined) | undefined): number | undefined => {
    if (badge === undefined) return undefined
    if (typeof badge === "function") return badge()
    return badge
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b px-6">
        <h1 className="text-xl font-bold">동문 관리자</h1>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-accent"
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              <span className="flex-1">{item.title}</span>
              {(() => {
                const badgeValue = getBadgeValue(item.badge)
                return badgeValue !== undefined && badgeValue > 0 ? (
                  <Badge variant="secondary">{badgeValue}</Badge>
                ) : null
              })()}
            </Link>
            {item.children && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                      pathname === child.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {child.icon}
                    <span className="flex-1">{child.title}</span>
                    {(() => {
                      const badgeValue = getBadgeValue(child.badge)
                      return badgeValue !== undefined && badgeValue > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          {badgeValue}
                        </Badge>
                      ) : null
                    })()}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </>
  )

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        {/* Mobile Drawer */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-screen w-[250px] flex-col border-r bg-card transition-transform duration-300 ease-in-out lg:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </aside>
      </>
    )
  }

  // Desktop: 고정형 250px
  return (
    <aside className="hidden h-screen w-[250px] flex-col border-r bg-card lg:flex">
      {sidebarContent}
    </aside>
  )
}

