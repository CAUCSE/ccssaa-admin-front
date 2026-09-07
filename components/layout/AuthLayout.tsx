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
import {
  getRefreshToken,
  getAuthSession,
  hasAdminAccess,
  isAccessTokenValid,
  removeTokens,
} from "@/lib/auth"
import { refreshTokens } from "@/lib/api/auth"

type AuthStatus = "checking" | "authenticated" | "unauthenticated"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking")

  useEffect(() => {
    let active = true

    const restoreSession = async () => {
      if (pathname === "/login") {
        if (active) setAuthStatus("unauthenticated")
        return
      }

      if (
        isAccessTokenValid() &&
        hasAdminAccess(getAuthSession()?.roles ?? [])
      ) {
        if (active) setAuthStatus("authenticated")
        return
      }

      if (getRefreshToken()) {
        const session = await refreshTokens()
        if (session && isAccessTokenValid()) {
          if (active) setAuthStatus("authenticated")
          return
        }
      }

      removeTokens()
      if (active) {
        setAuthStatus("unauthenticated")
        router.replace("/login")
      }
    }

    setAuthStatus("checking")
    void restoreSession()

    return () => {
      active = false
    }
  }, [pathname, router])

  // 로그인 페이지: 사이드바/헤더 없이 전체 화면
  if (pathname === "/login") {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  // 저장된 인증 확인 또는 토큰 재발급을 기다리는 동안 보호 화면을 숨긴다.
  if (authStatus !== "authenticated") {
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
