import type { LockerPolicyFormData } from "@/types/locker-policy"

export interface LockerPolicyValidationError {
  field: string
  message: string
}

/**
 * 사물함 정책 폼 검증
 * - apply_start_at < apply_end_at
 * - extend_start_at < extend_end_at (nullable 허용, 둘 다 있으면 비교)
 * - apply_end_at <= apply_expired_at
 * - extend_end_at <= extend_expired_at (연장 기간이 있으면)
 * - version 비어 있으면 안 됨
 */
export function validateLockerPolicyForm(
  data: LockerPolicyFormData,
  /** 다른 정책의 version 목록 (중복 검사용, 수정 시 현재 정책 version 제외 후 전달) */
  existingVersions?: string[]
): LockerPolicyValidationError[] {
  const errors: LockerPolicyValidationError[] = []
  const v = data.version?.trim()
  if (!v) {
    errors.push({ field: "version", message: "버전을 입력해주세요." })
  }
  if (existingVersions && v) {
    const duplicate = existingVersions.includes(v)
    if (duplicate) errors.push({ field: "version", message: "이미 존재하는 버전입니다." })
  }

  if (!data.applyStartAt?.trim()) {
    errors.push({ field: "apply", message: "신청 시작일시를 입력해주세요." })
  }
  if (!data.applyEndAt?.trim()) {
    errors.push({ field: "apply", message: "신청 종료일시를 입력해주세요." })
  }
  if (!data.applyExpiredAt?.trim()) {
    errors.push({ field: "apply", message: "신청 만료일시를 입력해주세요." })
  }

  const applyStart = data.applyStartAt ? new Date(data.applyStartAt).getTime() : NaN
  const applyEnd = data.applyEndAt ? new Date(data.applyEndAt).getTime() : NaN
  const applyExpired = data.applyExpiredAt ? new Date(data.applyExpiredAt).getTime() : NaN

  if (!Number.isNaN(applyStart) && !Number.isNaN(applyEnd) && applyStart >= applyEnd) {
    errors.push({ field: "apply", message: "신청 시작일시는 신청 종료일시보다 이전이어야 합니다." })
  }
  if (!Number.isNaN(applyEnd) && !Number.isNaN(applyExpired) && applyEnd > applyExpired) {
    errors.push({ field: "apply", message: "신청 종료일시는 신청 만료일시보다 이후일 수 없습니다." })
  }

  const extStart = data.extendStartAt ? new Date(data.extendStartAt).getTime() : null
  const extEnd = data.extendEndAt ? new Date(data.extendEndAt).getTime() : null
  const extExpired = data.extendExpiredAt ? new Date(data.extendExpiredAt).getTime() : null

  const hasExtend = extStart !== null || extEnd !== null || extExpired !== null
  if (hasExtend) {
    if (extStart !== null && extEnd !== null && extStart >= extEnd) {
      errors.push({ field: "extend", message: "연장 시작일시는 연장 종료일시보다 이전이어야 합니다." })
    }
    if (extEnd !== null && extExpired !== null && extEnd > extExpired) {
      errors.push({ field: "extend", message: "연장 종료일시는 연장 만료일시보다 이후일 수 없습니다." })
    }
  }

  return errors
}
