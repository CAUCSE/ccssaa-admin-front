"use client"

import { useState, useEffect } from "react"

/**
 * useMediaQuery 훅
 * 주어진 CSS media query가 현재 뷰포트에 매칭되는지 반환합니다.
 * SSR-safe: 첫 렌더링 시 false를 반환하고, 클라이언트에서 평가 후 업데이트합니다.
 *
 * @example const isMobile = useMediaQuery("(max-width: 767px)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [query])

  return matches
}

/**
 * 모바일 여부 (max-width: 767px, Tailwind md breakpoint 미만)
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)")
}
