import type {
  BoardCreateRequestV2,
  BoardReadScope,
  BoardWriteScope,
  BoardVisibility,
} from "@/types/board-v2"

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
}

export function parseAdminUserIds(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
