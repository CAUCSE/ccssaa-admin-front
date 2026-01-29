# 인증·토큰 관리 스펙 (API v1)

**버전:** v1 (향후 v2 전환 시 이 문서 수정 예정)

**요약:** 로그인 시 `accessToken`·`refreshToken`을 받아 저장하고, 모든 API 요청에는 `Authorization: Bearer {accessToken}`을 붙인다. 401 발생 시 `refreshToken`으로 재발급 후 재시도하며, 재발급 실패 시 로그아웃 후 `/login`으로 이동한다.

---

## 1. API v1 엔드포인트

### 1.1. 로그인 (Sign-in)

- **Method:** `POST`
- **URL:** `/api/v1/users/sign-in`
- **Request Headers:** `Content-Type: application/json` (Authorization 불필요)
- **Request Body:**

```json
{
  "email": "yebin@cau.ac.kr",
  "password": "password00!!"
}
```

- **Response Body (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

- **동작:** 응답 수신 후 `accessToken`, `refreshToken`을 저장하고, 이후 모든 API 요청에 `Authorization: Bearer {accessToken}` 사용.

- **에러 응답 (v1 전용, 로그인 API에만 적용):** 4xx/5xx 시 아래 형식. 클라이언트는 `message`를 그대로 사용자에게 노출.

```json
{
  "errorCode": 4101,
  "message": "비밀번호를 잘못 입력했습니다.",
  "timeStamp": "2026-01-29T20:32:34.41259"
}
```

- **코드:** v1 분리 — `lib/api/v1/auth.ts`의 `signInV1()`, `lib/api/v1/error.ts`의 `parseV1Error()`, `types/v1.ts`의 `V1ApiErrorResponse`. (v2 API는 별도 요청/응답 양식으로 `lib/api/v2/` 예정)

---

### 1.2. 토큰 재발급 (Token Update)

- **Method:** `PUT`
- **URL:** `/api/v1/users/token/update`
- **Request Headers:** `Content-Type: application/json` (Authorization **없음** — body에 refreshToken만 전달)
- **Request Body:**

```json
{
  "refreshToken": "string"
}
```

- **Response Body (200):**

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

- **동작:** 새 `accessToken`, `refreshToken` 수신 시 기존 토큰을 교체 저장. 실패(401 등) 시 로그아웃 처리 후 `/login`으로 이동.

---

### 1.3. 본인 조회 (Me)

- **Method:** `GET`
- **URL:** `/api/v1/users/me`
- **Request Headers:** `Authorization: Bearer {accessToken}` 필요
- **Response Body (200):**

```json
{
  "id": "15cb67fb-1efc-470f-96b1-8c571e39acc8",
  "email": "yebin@cau.ac.kr",
  "name": "이예빈",
  "studentId": "202099123",
  "admissionYear": 2020,
  "roles": ["COMMON"],
  "profileImageUrl": null,
  "state": "ACTIVE",
  "circleIdIfLeader": null,
  "circleNameIfLeader": null,
  "nickname": "푸111앙",
  "major": "소프트웨어학부",
  "department": null,
  "academicStatus": "UNDETERMINED",
  "currentCompletedSemester": null,
  "graduationYear": null,
  "graduationType": null,
  "phoneNumber": "010-1234-2278",
  "rejectionOrDropReason": null,
  "createdAt": "2025-03-04T19:01:49.829129",
  "updatedAt": "2025-03-04T19:01:49.829129",
  "isV2": true
}
```

- **타입:** `types/auth.ts` 의 `MeResponse`. API: `getMe()`.

---

### 1.4. 로그아웃 (Sign-out)

- **Method:** `POST`
- **URL:** `/api/v1/users/sign-out`
- **Request Headers:** `Content-Type: application/json` (Authorization **없음** — body에 토큰 전달)
- **Request Body:**

```json
{
  "refreshToken": "string",
  "accessToken": "string",
  "fcmToken": null
}
```

- **동작:** 서버에 로그아웃 전달 후 클라이언트에서 `removeTokens()` 호출. `fcmToken`은 `null`로 전송.

---

## 2. 클라이언트 토큰 관리

### 2.1. 저장

| 항목         | 키 (localStorage) | 비고                    |
|--------------|-------------------|-------------------------|
| accessToken  | `accessToken`     | API 요청 시 Bearer로 사용 |
| refreshToken | `refreshToken`    | 401 시 재발급 요청에만 사용 |

- **저장 시점:** 로그인 성공 시, 토큰 재발급 성공 시.
- **제거 시점:** 로그아웃 시, 401 후 재발급 실패 시.

### 2.2. 요청 시 사용

- **일반 API 요청:** `Authorization: Bearer {accessToken}` 헤더 추가.
- **예외:** 다음 요청에는 Authorization 헤더를 **붙이지 않음** (body로 토큰 전달).
  - `PUT /api/v1/users/token/update` — body에 `refreshToken`만
  - `POST /api/v1/users/sign-out` — body에 `refreshToken`, `accessToken`, `fcmToken: null`

### 2.3. 401 처리 흐름

1. 어떤 API 요청이 **401**을 반환하면:
   - 해당 요청이 **token/update** 또는 **sign-out** 호출이면 → 즉시 토큰 제거 후 `/login` 리다이렉트.
   - 그 외 요청이면 2로.
2. **토큰 재발급 시도:** `PUT /api/v1/users/token/update` with `{ refreshToken }`.
3. **재발급 성공:** 새 accessToken/refreshToken 저장 → **실패했던 원래 요청**을 새 accessToken으로 한 번만 재시도.
4. **재발급 실패:** 토큰 제거 후 `/login` 리다이렉트.
5. **동시 다중 401:** 재발급은 한 번만 수행하고, 완료 시 대기 중인 요청들을 새 accessToken으로 일괄 재시도.

---

## 3. 관련 파일

| 구분           | 경로 | 역할 |
|----------------|------|------|
| 토큰 저장/조회 | `lib/auth.ts` | `getAccessToken`, `getRefreshToken`, `setTokens`, `removeTokens`, `isAuthenticated` |
| 인증 API       | `lib/api/auth.ts` | `login()` (sign-in), `refreshTokens()` (PUT token/update), `getMe()` (GET /users/me), `signOut()` (POST sign-out 후 토큰 제거) |
| v1 API (로그인 전용) | `lib/api/v1/` | `signInV1()`, `parseV1Error()`, v1 에러 응답 처리. v2는 `lib/api/v2/` 에 별도 구현 예정 |
| v1 에러 타입   | `types/v1.ts` | `V1ApiErrorResponse` (errorCode, message, timeStamp) |
| 본인 조회 타입 | `types/auth.ts` | `MeResponse`, `SignInResponse` |
| HTTP 클라이언트 | `lib/api.ts` | Request: Bearer accessToken 부착 (token/update, sign-out 제외), Response: 401 시 refresh 후 재시도 또는 로그아웃 |

---

## 4. curl 예시 (로그인 후 Bearer 사용)

```bash
# 로그인
curl -X 'POST' \
  'http://localhost:8080/api/v1/users/sign-in' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"email":"yebin@cau.ac.kr","password":"password00!!"}'

# 인증이 필요한 API 호출 시
curl -X 'POST' \
  'http://localhost:8080/api/v1/users/sign-in' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {accessToken}' \
  -H 'Content-Type: application/json' \
  -d '{"email":"yebin@cau.ac.kr","password":"password00!!"}'
```

---

## 5. Mock 모드

- `NEXT_PUBLIC_USE_MOCK_API=true` 시 `lib/mock/auth.ts` 사용.
- **sign-in:** 이메일/비밀번호만 있으면 `accessToken`, `refreshToken` mock 문자열 반환.
- **token/update (PUT):** `refreshToken`이 비어 있지 않으면 새 mock `accessToken`, `refreshToken` 반환.
- **getMe:** mock 본인 정보(`MeResponse`) 반환.
- **sign-out:** body 무시하고 성공 처리 후 토큰은 `signOut()` 내부에서 `removeTokens()`로 제거.
