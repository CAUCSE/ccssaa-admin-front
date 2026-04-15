"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { usePathname } from "next/navigation"
import { getAuthSession, isAuthenticated } from "@/lib/auth"
import type { AuthSession } from "@/types/auth"

interface MeContextValue {
  me: AuthSession | null
  isLoading: boolean
  refetch: () => Promise<void>
}

const MeContext = createContext<MeContextValue | null>(null)

export function MeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [me, setMe] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    if (!isAuthenticated()) {
      setMe(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      setMe(getAuthSession())
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
