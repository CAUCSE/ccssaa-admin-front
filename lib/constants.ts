// 상태 Badge 색상 매핑
export const USER_STATUS_CONFIG = {
  AWAIT: {
    label: "대기",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  ACTIVE: {
    label: "활성",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  DROP: {
    label: "추방",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  INACTIVE: {
    label: "탈퇴",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  },
  REJECT: {
    label: "거부",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
} as const

// 역할 라벨 매핑
export const USER_ROLE_CONFIG = {
  USER: "일반 회원",
  ADMIN: "관리자",
  MASTER: "마스터",
} as const

// 학과 목록
export const DEPARTMENTS = [
  "AI학과",
  "소프트웨어학부",
  "컴퓨터공학부",
  "컴퓨터공학과",
  "전자계산학과",
] as const

