import type {
  BoardCreateRequestV2,
  BoardReadScope,
  BoardWriteScope,
  BoardVisibility,
} from "@/types/board-v2"
import { DEPARTMENT_CONFIG, type Department } from "@/types/user"

/** BoardReadScope: ENROLLED 재학생, GRADUATED 졸업생, BOTH 모두 */
export const READ_SCOPES: { value: BoardReadScope; label: string }[] = [
  { value: "BOTH", label: "모두" },
  { value: "ENROLLED", label: "재학생" },
  { value: "GRADUATED", label: "졸업생" },
]

/** BoardWriteScope: ALL_USER 일반 유저 작성 가능, ONLY_ADMIN 게시판 관리자만 작성 가능 */
export const WRITE_SCOPES: { value: BoardWriteScope; label: string }[] = [
  { value: "ALL_USER", label: "일반 유저 작성 가능" },
  { value: "ONLY_ADMIN", label: "게시판 관리자만 작성 가능" },
]

/** BoardVisibility: VISIBLE 보임, HIDDEN 안 보임 */
export const VISIBILITIES: { value: BoardVisibility; label: string }[] = [
  { value: "VISIBLE", label: "보임" },
  { value: "HIDDEN", label: "안 보임" },
]

export function readScopeLabel(value: BoardReadScope): string {
  return READ_SCOPES.find((o) => o.value === value)?.label ?? value
}
export function writeScopeLabel(value: BoardWriteScope): string {
  return WRITE_SCOPES.find((o) => o.value === value)?.label ?? value
}
export function visibilityLabel(value: BoardVisibility): string {
  return VISIBILITIES.find((o) => o.value === value)?.label ?? value
}

export const defaultV2Form: Omit<BoardCreateRequestV2, "boardId"> = {
  name: "",
  description: "",
  adminUserIds: [],
  isAnonymous: false,
  readScope: "BOTH",
  writeScope: "ONLY_ADMIN",
  isNotice: false,
  visibility: "VISIBLE",
  officialNickname: "",
  officialProfileImageId: null,
  departments: [],
}

/**
 * 노출 대상 학과 선택 UI 그룹.
 * 학과 개편으로 같은 학과가 여러 Department 코드로 남아있어(전자계산학과 -> 컴퓨터공학과 -> 컴퓨터공학부 -> 소프트웨어학부),
 * "소프트웨어학부"를 선택하면 과거 코드로 등록된 학생까지 함께 노출 대상에 포함되도록 묶어서 다룬다.
 */
export const DEPARTMENT_GROUPS: { key: Department; label: string; departments: Department[] }[] = [
  {
    key: "SCHOOL_OF_SW",
    label: DEPARTMENT_CONFIG.SCHOOL_OF_SW,
    departments: ["SCHOOL_OF_SW", "SCHOOL_OF_CSE", "DEPT_OF_CSE", "DEPT_OF_CS"],
  },
  {
    key: "DEPT_OF_AI",
    label: DEPARTMENT_CONFIG.DEPT_OF_AI,
    departments: ["DEPT_OF_AI"],
  },
]

/** 노출 대상 학과 Select 값: 전체 노출이거나, DEPARTMENT_GROUPS 중 하나만 노출 */
export type DepartmentSelectionValue = "ALL" | (typeof DEPARTMENT_GROUPS)[number]["key"]

export const DEPARTMENT_SELECTION_OPTIONS: { value: DepartmentSelectionValue; label: string }[] = [
  { value: "ALL", label: "전체" },
  ...DEPARTMENT_GROUPS.map((g) => ({ value: g.key, label: `${g.label}만` })),
]

export function departmentsToSelection(departments: Department[]): DepartmentSelectionValue {
  const matched = DEPARTMENT_GROUPS.find((g) => g.departments.some((d) => departments.includes(d)))
  return matched?.key ?? "ALL"
}

export function selectionToDepartments(value: DepartmentSelectionValue): Department[] {
  return DEPARTMENT_GROUPS.find((g) => g.key === value)?.departments ?? []
}

export function parseAdminUserIds(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
