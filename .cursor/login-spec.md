# 로그인 화면 스펙

**화면 ID:** `ADM-LOGIN`

**작성 원칙:** 인증되지 않은 사용자는 대시보드 접근 시 `/login`으로 리다이렉트되며, 로그인 성공 시 `/dashboard`로 이동한다.

---

## 1. 로그인 페이지 (`/login`)

### 1.1. 레이아웃

- **전체:** 사이드바(LNB), 헤더 없음. 전체 화면 중앙에 카드 형태의 로그인 폼만 노출.
- **배경:** `bg-muted/30` 등 연한 배경으로 폼 영역 구분.
- **폼 영역:** Card 컴포넌트, `max-w-md`, 중앙 정렬.

### 1.2. 입력 필드

| 필드       | 타입     | placeholder     | 필수 | 비고           |
|-----------|----------|-----------------|------|----------------|
| 이메일    | Input    | admin@example.com | O  | type="email"   |
| 비밀번호  | Input    | ••••••••        | O  | type="password" |

- **레이블:** 각 필드 상단에 Label (이메일, 비밀번호).
- **버튼:** `[로그인]` Primary, 폼 전체 너비(`w-full`), 로딩 시 "로그인 중..." 표시 및 비활성화.

### 1.3. 동작

- **제출:** 이메일/비밀번호 미입력 시 토스트 에러 메시지.
- **성공:** `login()` API 호출 → `accessToken`/`refreshToken` 저장(`setTokens`) → 토스트 성공 → `router.replace("/dashboard")`.
- **실패:** 토스트 에러 메시지 (API 에러 메시지 또는 "로그인에 실패했습니다.").

### 1.4. 인증 흐름

- **미인증 사용자가 `/` 또는 대시보드 하위 경로 접근:** `AuthLayout`에서 `isAuthenticated()`가 false면 `/login`으로 리다이렉트.
- **로그인 페이지:** LNB/헤더 없이 `AuthLayout`이 children만 렌더.
- **API 401:** `lib/api.ts`에서 토큰 재발급 시도 → 성공 시 해당 요청 재시도, 실패 시 토큰 제거 후 `/login` 이동. 상세는 [.cursor/auth-token.md](.cursor/auth-token.md) 참고.

---

## 2. 관련 파일

| 구분     | 경로 |
|----------|------|
| 로그인 페이지 | `app/login/page.tsx` |
| 인증 레이아웃(리다이렉트/레이아웃 분기) | `components/layout/AuthLayout.tsx` |
| 인증·토큰 관리 스펙 (API v1, 401/refresh) | `.cursor/auth-token.md` |
| 인증 유틸(accessToken/refreshToken, isAuthenticated) | `lib/auth.ts` |
| 로그인 API (Real/Mock 분기) | `lib/api/auth.ts` |
| 로그인 Mock 구현 | `lib/mock/auth.ts` |

---

## 3. Mock 로그인

- **Mock 모드:** `NEXT_PUBLIC_USE_MOCK_API=true` 시 `lib/mock/auth.ts` 사용.
- **동작:** 이메일/비밀번호가 비어 있지 않으면 성공. 임의 값 입력으로 로그인 가능 (개발용).
