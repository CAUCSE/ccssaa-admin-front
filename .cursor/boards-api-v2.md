# 게시판 관리 API (v2)

**경로:** 게시판 관리 > 게시판 (`/content/boards`)

**v2 API:** baseURL `/api/v2`, Bearer 토큰 인증. 클라이언트: `lib/api/v2/client.ts` (apiV2).

---

## 1. 게시판 리스트 (v2)

- **Method:** `GET`
- **URL:** `/api/v2/admin/boards`
- **Query (검색 조건, 선택):** `BoardSearchCondition` — keyword, isAnonymous, writeScope, readScope, isNotice.
- **Response:** `ApiResponse<{ boards: BoardListItemV2[] }>` — 공통 래퍼 언래핑 후 `data.boards` 사용.

**검색 조건 (BoardSearchCondition):**

| 파라미터 | 타입 | 비고 |
|----------|------|------|
| keyword | string | 키워드 (게시판명 등 검색) |
| isAnonymous | boolean | 익명 여부 |
| writeScope | BoardWriteScope | 쓰기 권한 |
| readScope | BoardReadScope | 읽기 권한 |
| isNotice | boolean | 알림 가능 게시판 여부 |

**리스트 항목 필드:** no(서버 부여 번호), boardId, name(게시판명), description(설명), isAnonymous(익명 여부), readScope(읽기 권한), writeScope(쓰기 권한), isNotice(알림 여부), visibility(노출 여부), displayOrder(표시 순서, 정렬용).

---

## 1-1. 게시판 상세 (v2) — edit 페이지용

- **Method:** `GET`
- **URL:** `/api/v2/admin/boards/{boardId}`
- **Response:** `ApiResponse<BoardDetailV2>` — 공통 래퍼 언래핑 후 `data` 사용.

**BoardDetailV2 필드:** boardId, name, description, isAnonymous, readScope, writeScope, isNotice, visibility, displayOrder, **admins** (배열).

**admins 항목 (BoardAdminInfo):** id(uuid), adminEmail, adminName.

- **클라이언트:** `getBoardV2(boardId)` — `lib/api/v2/boards.ts`
- **Hook:** `useBoardV2(boardId)` — `hooks/usePosts.ts`
- **화면:** `app/content/boards/[boardId]/edit/page.tsx` — 상세 조회 후 폼에 반영, 관리자 ID는 `admins[].id`를 줄바꿈으로 채움.

---

## 2. 게시판 생성 (v2)

- **Method:** `POST`
- **URL:** `/api/v2/admin/boards`
- **Request Body:** `boardId` 빈 문자열 또는 생략, 나머지 필드 동일.

---

## 3. 게시판 정렬 수정 (v2)

- **Method:** `PATCH`
- **URL:** `/api/v2/admin/boards/orders`
- **Request Body:** `{ "boardIds": ["string", "string", ...] }` — 원하는 순서대로 boardId 배열.

---

## 4. 게시판 설정 수정 (v2)

- **Method:** `PUT`
- **URL:** `/api/v2/admin/boards`
- **Request Headers:** `Authorization: Bearer {accessToken}`, `Content-Type: application/json`
- **Request Body:**

| 필드 | 타입 | 비고 |
|------|------|------|
| boardId | string | 수정 시 기존 boardId, 생성 시 빈 문자열 |
| name | string | 게시판 제목 |
| description | string | 게시판 설명 |
| adminUserIds | string[] | 게시판 관리자 id 배열 (uuid) |
| isAnonymous | boolean | 익명 여부 |
| readScope | BoardReadScope | ENROLLED(재학생), GRADUATED(졸업생), BOTH(모두) |
| writeScope | BoardWriteScope | ALL_USER(일반 유저 작성 가능), ONLY_ADMIN(게시판 관리자만 작성 가능) |
| isNotice | boolean | 알림 가능 게시판 여부 |
| visibility | BoardVisibility | VISIBLE(보임), HIDDEN(안 보임) |

**수정 시:** `boardId` 필수(수정 대상 게시판 ID). 나머지 필드 동일.

**예시 (생성):**

```json
{
  "boardId": "",
  "name": "학생회 공지",
  "description": "학생회 공지사항 게시판입니다.",
  "adminUserIds": ["uuid1", "uuid2"],
  "isAnonymous": false,
  "readScope": "BOTH",
  "writeScope": "ONLY_ADMIN",
  "isNotice": true,
  "visibility": "VISIBLE"
}
```

**BoardReadScope:** ENROLLED(재학생), GRADUATED(졸업생), BOTH(모두)  
**BoardWriteScope:** ALL_USER(일반 유저 작성 가능), ONLY_ADMIN(게시판 관리자만 작성 가능)  
**BoardVisibility:** VISIBLE(보임), HIDDEN(안 보임)

---

## 5. 클라이언트 구현

| 구분 | 경로 |
|------|------|
| v2 API 클라이언트 | `lib/api/v2/client.ts` (apiV2, Bearer + 401 처리) |
| v2 게시판 API | `lib/api/v2/boards.ts` — `getBoardsV2(condition)` (GET 리스트), `getBoardV2(boardId)` (GET 상세), `createBoardV2(data)` (POST), `updateBoardV2(data)` (PUT), `updateBoardOrdersV2(boardIds)` (PATCH orders) |
| v2 게시판 타입 | `types/board-v2.ts` — `BoardListItemV2`, `BoardDetailV2`, `BoardAdminInfo`, `BoardCreateRequestV2`, `BoardReadScope`, `BoardWriteScope`, `BoardVisibility` |
| Hook | `hooks/usePosts.ts` — `useBoardsV2(condition)` (GET 리스트), `useBoardV2(boardId)` (GET 상세), `useCreateBoardV2()` (POST), `useUpdateBoardV2()` (PUT), `useUpdateBoardOrdersV2()` (PATCH orders) |
| 화면 | `app/content/boards/page.tsx` — v2 리스트(displayOrder 정렬) + 정렬 수정(드래그&드롭) + 생성 모달. 수정은 별도 페이지 `app/content/boards/[boardId]/edit/page.tsx` |

---

## 6. 화면 동작 (게시판 목록·생성·수정·정렬)

- **목록:** `app/content/boards/page.tsx` — `useBoardsV2()` GET `/api/v2/admin/boards` (응답 `data.boards`). `displayOrder` 기준 정렬 후 테이블 컬럼: No, 게시판명, 설명, 익명 여부, 읽기 권한, 쓰기 권한, 알림 여부, 노출 여부, 관리(수정/삭제).
- **정렬 수정:** 상단 `[정렬 수정]` 버튼 클릭 시 다이얼로그 오픈. 현재 `displayOrder` 순서대로 리스트 표시, 드래그&드롭으로 순서 변경 후 `[저장]` 시 PATCH `/api/v2/admin/boards/orders` 로 `boardIds` 배열 전달.
- **게시판 생성:** 상단 `[게시판 생성]` 클릭 시 v2 생성 모달 오픈. 제출 시 **POST** `/api/v2/admin/boards` (`createBoardV2`). 생성 모달 필드: 게시판명, 설명, 관리자 ID(쉼표/줄바꿈 구분), 익명 여부(체크), 읽기 권한(Select), 쓰기 권한(Select), 알림 가능(체크), 노출 여부(Select).
- **수정:** 행의 `[수정]` 클릭 시 **별도 페이지** `/content/boards/[boardId]/edit` 로 이동. `app/content/boards/[boardId]/edit/page.tsx` 에서 동일 폼 필드로 편집 후 `[수정]` 제출 시 **PUT** `/api/v2/admin/boards` (`updateBoardV2`, `boardId` 필수). 성공 시 목록(`/content/boards`)으로 이동.
- **삭제:** 행의 `[삭제]` 클릭 시 삭제 확인 모달 유지.
