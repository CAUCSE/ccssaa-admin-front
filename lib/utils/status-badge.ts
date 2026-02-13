import { BadgeProps } from "@/components/ui/badge"

/**
 * 상태값에 따른 뱃지 variant 및 라벨 매핑
 */
export const statusBadgeMap: Record<
  string,
  { variant: BadgeProps["variant"]; label: string }
> = {
  // Success (Green)
  ACTIVE: { variant: "success", label: "활동" },
  APPROVED: { variant: "success", label: "승인" },
  RESOLVED: { variant: "success", label: "완료" },
  PUBLIC: { variant: "success", label: "공개" },
  AVAILABLE: { variant: "success", label: "사용 가능" },
  IN_USE: { variant: "neutral", label: "사용중" },
  DISABLED: { variant: "neutral", label: "비활성" },

  // Warning (Orange)
  PENDING: { variant: "warning", label: "대기" },
  UNRESOLVED: { variant: "warning", label: "미처리" },

  // Danger (Red)
  REJECTED: { variant: "danger", label: "거부" },
  BANNED: { variant: "danger", label: "추방" },
  DELETED: { variant: "danger", label: "삭제" },

  // Neutral (Gray)
  WITHDRAWN: { variant: "neutral", label: "탈퇴" },
  HIDDEN: { variant: "neutral", label: "숨김" },
  DISMISSED: { variant: "neutral", label: "취소" },
  OCCUPIED: { variant: "neutral", label: "사용중" }, // 하위 호환
  INACTIVE: { variant: "neutral", label: "비활성" },
}

/**
 * 상태값으로부터 뱃지 정보를 가져옵니다.
 */
export function getStatusBadge(
  status: string
): { variant: BadgeProps["variant"]; label: string } {
  return (
    statusBadgeMap[status] || { variant: "secondary", label: status }
  )
}

