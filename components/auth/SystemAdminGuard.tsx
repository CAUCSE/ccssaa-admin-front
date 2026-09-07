"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { useMe } from "@/context/MeContext"
import { isSystemAdmin } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function SystemAdminGuard({ children }: { children: React.ReactNode }) {
  const { me, isLoading } = useMe()
  if (isLoading) return <div className="py-16 text-center text-sm text-muted-foreground">권한을 확인하고 있습니다.</div>
  if (!isSystemAdmin(me?.roles ?? [])) {
    return <Card className="mx-auto mt-12 max-w-lg"><CardContent className="flex flex-col items-center gap-4 py-12 text-center"><ShieldAlert className="h-10 w-10 text-destructive"/><div><h1 className="text-xl font-semibold">접근 권한이 없습니다</h1><p className="mt-2 text-sm text-muted-foreground">이메일 캠페인은 시스템 관리자만 사용할 수 있습니다.</p></div><Button asChild><Link href="/dashboard">대시보드로 이동</Link></Button></CardContent></Card>
  }
  return <>{children}</>
}
