"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { MeProvider } from "@/context/MeContext"
import { ApiErrorDialogProvider } from "@/components/ApiErrorDialog"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { Toaster } from "@/components/ui/toaster"
import { isAuthenticated } from "@/lib/auth"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (pathname === "/login") return
    if (!isAuthenticated()) {
      router.replace("/login")
    }
  }, [mounted, pathname, router])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // 로그인 페이지: 사이드바/헤더 없이 전체 화면
  if (pathname === "/login") {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  // 인증되지 않은 상태에서 리다이렉트 대기
  if (!isAuthenticated()) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // 대시보드 레이아웃 (사이드바 + 헤더, Me 상태 제공)
  return (
    <>
      <MeProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar isOpen={true} isMobile={false} />
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMobile={true}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </MeProvider>
      <Toaster />
    </>
  )
}

export function AuthLayoutProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiErrorDialogProvider>
        <AuthLayout>{children}</AuthLayout>
      </ApiErrorDialogProvider>
    </QueryClientProvider>
  )
}
