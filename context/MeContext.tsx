"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { usePathname } from "next/navigation"
import { getMe } from "@/lib/api/auth"
import { isAuthenticated } from "@/lib/auth"
import type { MeResponse } from "@/types/auth"

interface MeContextValue {
  me: MeResponse | null
  isLoading: boolean
  refetch: () => Promise<void>
}

const MeContext = createContext<MeContextValue | null>(null)

export function MeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [me, setMe] = useState<MeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    if (!isAuthenticated()) {
      setMe(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const data = await getMe()
      setMe(data)
    } catch {
      setMe(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (pathname === "/login" || !isAuthenticated()) {
      setMe(null)
      setIsLoading(false)
      return
    }
    fetchMe()
  }, [pathname, fetchMe])

  const value: MeContextValue = {
    me,
    isLoading,
    refetch: fetchMe,
  }

  return (
    <MeContext.Provider value={value}>{children}</MeContext.Provider>
  )
}

export function useMe(): MeContextValue {
  const ctx = useContext(MeContext)
  if (!ctx) {
    throw new Error("useMe must be used within MeProvider")
  }
  return ctx
}

export function useMeOptional(): MeContextValue | null {
  return useContext(MeContext)
}
