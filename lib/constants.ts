// 상태 Badge 색상 매핑
export const USER_STATUS_CONFIG = {
  PENDING: {
    label: "대기",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  ACTIVE: {
    label: "활동",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  BANNED: {
    label: "추방",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
} as const

// 역할 라벨 매핑
export const USER_ROLE_CONFIG = {
  USER: "일반 회원",
  ADMIN: "관리자",
  MASTER: "마스터",
} as const

// 학과 목록 (실제 데이터로 교체 필요)
export const DEPARTMENTS = [
  "전체",
  "소프트웨어학부",
  "컴퓨터공학부",
  "전자공학부",
  "기계공학부",
  "화학공학부",
] as const

