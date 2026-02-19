/**
 * file:// URL을 Next.js 프록시 URL로 변환합니다.
 * http(s):// URL은 그대로 반환합니다.
 *
 * 로컬 개발 환경 임시 대응용이며,
 * 백엔드가 HTTP URL을 반환하도록 수정되면 이 함수를 제거하면 됩니다.
 */
export function resolveFileUrl(url: string): string {
  if (url.startsWith("file:///")) {
    const localPath = url.replace("file://", "")
    return `/api/local-file?path=${encodeURIComponent(localPath)}`
  }
  return url
}
