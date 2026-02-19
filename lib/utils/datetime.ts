export function isoToDatetimeLocal(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""

  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, "0")
  const D = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")

  return `${y}-${M}-${D}T${h}:${m}`
}

/** ISO 문자열을 "YYYY.MM.DD HH:MM" 형식으로 변환 (잘못된 값이면 '—') */
export function formatDateTime(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"

  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, "0")
  const D = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")

  return `${y}.${M}.${D} ${h}:${m}`
}

/** datetime-local 값(로컬 시간)을 타임존 보정 없이 ISO(Z) 문자열로 변환 */
export function fromDatetimeLocal(value: string): string {
  if (!value) return ""
  // value 예: "2026-02-16T22:54" 또는 "2026-02-16T22:54:00"
  const [date, time] = value.split("T")
  if (!date || !time) return value

  const [y, M, D] = date.split("-")
  const [h, m] = time.split(":")

  if (!y || !M || !D || !h || !m) return value

  const mm = m.length === 1 ? m.padStart(2, "0") : m
  // 서버 예제가 Z(UTC) 포맷을 사용하므로, 로컬 시각 그대로에 'Z'만 붙여 전달
  return `${y}-${M}-${D}T${h}:${mm}:00Z`
}

