"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BrandLogo } from "@/components/layout/BrandLogo"
import { login } from "@/lib/api/auth"
import { getRememberMe, setRememberMe } from "@/lib/auth"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMeState] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setRememberMeState(getRememberMe())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error("이메일과 비밀번호를 입력해주세요.")
      return
    }
    setIsLoading(true)
    try {
      setRememberMe(rememberMe)
      await login({ email: email.trim(), password })
      toast.success("로그인 성공. 대시보드로 이동합니다.")
      router.replace("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그인에 실패했습니다."
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1.5 p-6 text-center">
          <div className="flex justify-center pb-2">
            <BrandLogo className="pointer-events-none" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">CCSSAA 관리자 로그인</CardTitle>
          <p className="text-sm text-muted-foreground">
            관리자 계정으로 로그인해주세요.
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => {
                  if (checked && !rememberMe) {
                    alert(
                      "로그인 유지는 개인 기기에서만 사용해주세요.\n공용 PC나 타인 접근 가능한 기기에서는 체크를 해제해주세요."
                    )
                  }
                  setRememberMeState(checked === true)
                }}
                disabled={isLoading}
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-normal leading-none cursor-pointer"
              >
                로그인 유지
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
