import { useQuery } from "@tanstack/react-query"
import { getDashboardData } from "@/lib/api/dashboard"

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
    staleTime: 30000, // 30초
  })
}

