# API Mock 모드 사용 가이드

## 개요

개발 중 실제 백엔드 API가 준비되지 않았을 때, Mock 데이터를 사용하여 프론트엔드 개발을 진행할 수 있습니다.

## 설정 방법

### 1. 환경 변수 설정

`.env.local` 파일에 다음을 추가하세요:

```bash
# Mock API 사용 여부 (true: Mock 사용, false 또는 없음: 실제 API 사용)
NEXT_PUBLIC_USE_MOCK_API=true

# 실제 API Base URL (Mock 모드가 아닐 때 사용)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 2. Mock 모드 활성화/비활성화

- **Mock 모드 활성화**: `NEXT_PUBLIC_USE_MOCK_API=true`
- **실제 API 사용**: `NEXT_PUBLIC_USE_MOCK_API=false` 또는 환경 변수 제거

## Mock API 구조

### 파일 구조

```
lib/
  api/
    auth.ts           # 인증 API (로그인, Mock/Real 분기)
    users.ts          # 회원 API (Mock/Real 분기)
    dashboard.ts      # 대시보드 API (Mock/Real 분기)
    posts.ts          # 게시글 API (향후 추가)
    reports.ts        # 신고 API (향후 추가)
    ...
  mock/
    auth.ts           # 인증 Mock API 구현
    users.ts          # 회원 Mock API 구현
    dashboard.ts      # 대시보드 Mock API 구현
    ...
```

### 기본 패턴

각 API 파일은 다음과 같은 구조를 따릅니다:

```typescript
// lib/api/[domain].ts
import { api } from "../api"
import { mock[Domain]Api } from "../mock/[domain]"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const real[Domain]Api = {
  getData: async (): Promise<DataType> => {
    const response = await api.get<DataType>("/admin/[endpoint]")
    return response.data
  },
}

// Mock 모드에 따라 API 선택
export const [domain]Api = USE_MOCK_API ? mock[Domain]Api : real[Domain]Api

// 외부에서 사용할 함수
export async function getData(): Promise<DataType> {
  return [domain]Api.getData()
}
```

## 구현된 Mock API

### 1. 인증 API (`lib/api/auth.ts`, `lib/mock/auth.ts`)

**v1 스펙:** 로그인 `POST /users/sign-in`, 토큰 재발급 `PUT /users/token/update`, 본인 조회 `GET /users/me`, 로그아웃 `POST /users/sign-out`. 상세는 [.cursor/auth-token.md](.cursor/auth-token.md) 참고.

**Mock 데이터 특징:**
- 이메일/비밀번호가 비어 있지 않으면 로그인 성공 (개발용)
- 지연 시뮬레이션: sign-in 400ms, token/update 300ms, getMe 300ms, sign-out 200ms
- 반환: `accessToken`, `refreshToken` (v1 응답 형식)

**함수:**
- `login(params)` - 로그인 (`email`, `password`) → 성공 시 `setTokens(accessToken, refreshToken)` 후 `SignInResponse` 반환
- `refreshTokens()` - `refreshToken`으로 PUT 재발급 요청 후 새 토큰 저장 및 반환 (401 시 `lib/api.ts`에서 자동 호출)
- `getMe()` - 본인 조회 → `MeResponse` 반환
- `signOut()` - 로그아웃 (body: refreshToken, accessToken, fcmToken: null) 후 `removeTokens()`

### 2. 회원 관리 API (`lib/api/users.ts`, `lib/mock/users.ts`)

**Mock 데이터 특징:**
- 50개의 더미 회원 데이터
- 키워드, 학과, 상태 필터 지원
- 페이지네이션 지원
- 지연 시뮬레이션: 300-500ms

**함수:**
- `getUsers(params)` - 회원 리스트 조회
- `getUserDetail(userId)` - 회원 상세 조회
- `approveUser(userId)` - 회원 승인
- `rejectUser(userId)` - 회원 거부
- `banUser(userId)` - 회원 추방
- `updateUserRole(userId, role)` - 역할 변경

### 3. 대시보드 API (`lib/api/dashboard.ts`, `lib/mock/dashboard.ts`)

**Mock 데이터 특징:**
- 역할별 통계 데이터 (Master, 학생회장, 크자회장)
- 최근 신고, 가입 유저, 승인 대기 목록 등
- 지연 시뮬레이션: 300-500ms

**함수:**
- `getDashboardData()` - 대시보드 데이터 조회

### 4. 사물함 관리 API (`lib/api/lockers.ts`, `lib/mock/lockers.ts`)

**Mock 데이터 특징:**
- 100개의 사물함 데이터 (번호 101-200)
- 상태: AVAILABLE, OCCUPIED
- 현재 사용자, 이전 사용자 정보
- 신청 기간 설정 데이터
- 지연 시뮬레이션: 300-500ms

**함수:**
- `getLockers(params)` - 사물함 목록 조회
- `getLockerDetail(lockerId)` - 사물함 상세 조회
- `assignLocker(lockerId, userId)` - 수동 배정
- `releaseLocker(lockerId)` - 개별 회수
- `releaseAllLockers()` - 일괄 회수
- `setLockerApplicationPeriod(startAt, endAt)` - 신청 기간 설정

### 5. 캘린더 관리 API (`lib/api/calendar.ts`, `lib/mock/calendar.ts`)

**Mock 데이터 특징:**
- 다양한 일정 데이터 (사물함 신청 기간, 경조사, 일반 일정 등)
- 스코프: ALL, STUDENT, ALUMNI
- 액션 타입: Notice, Service, Link
- 지연 시뮬레이션: 300-500ms

**함수:**
- `getCalendarEvents(params)` - 캘린더 일정 목록 조회
- `createCalendarEvent(data)` - 일정 생성
- `updateCalendarEvent(eventId, data)` - 일정 수정
- `deleteCalendarEvent(eventId)` - 일정 삭제
- `syncLockerPeriodToCalendar(startAt, endAt)` - 사물함 기간 캘린더 동기화

### 6. v2 게시판 API (`lib/api/v2/boards.ts`, `lib/mock/boards-v2.ts`)

**v2 스펙:** GET/POST/PUT `/api/v2/admin/boards`, PATCH `/api/v2/admin/boards/orders`. 상세는 [.cursor/boards-api-v2.md](.cursor/boards-api-v2.md) 참고.

**Mock 데이터 특징:**
- 5개 기본 게시판 (학생회 공지, 문화부 공지, 학부 공지, 자유게시판, 동문 게시판)
- `display_order` 기준 정렬, 생성/수정/정렬 시 가변 목록 반영
- 지연 시뮬레이션: get 300ms, create/update 400ms, orders 300ms

**함수:**
- `getBoardsV2()` - 게시판 리스트 조회 (display_order 정렬)
- `createBoardV2(data)` - 게시판 생성
- `updateBoardV2(data)` - 게시판 설정 수정
- `updateBoardOrdersV2(boardIds)` - 게시판 정렬 수정

**참고:** `NEXT_PUBLIC_USE_MOCK_API=true` 이면 v2 게시판 API는 실제 서버(`/api/v2/admin/boards`)를 호출하지 않고 Mock을 사용합니다.

## 새로운 API 추가 방법

### 단계별 가이드

#### 1단계: 타입 정의 (`types/[domain].ts`)

```typescript
// types/posts.ts
export interface Post {
  id: number
  title: string
  content: string
  // ...
}

export interface PostListResponse {
  content: Post[]
  totalElements: number
  // ...
}
```

#### 2단계: Mock API 구현 (`lib/mock/[domain].ts`)

```typescript
// lib/mock/posts.ts
import type { Post, PostListResponse } from "@/types/post"

// Mock 데이터 생성 함수
const generateMockPosts = (): Post[] => {
  // Mock 데이터 생성 로직
  return [...]
}

// Mock API 함수들
export const mockPostApi = {
  getPosts: async (params: PostListParams): Promise<PostListResponse> => {
    // 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))
    
    // Mock 데이터 처리 로직
    const posts = generateMockPosts()
    // 필터링, 페이지네이션 등
    
    return {
      content: posts,
      totalElements: posts.length,
      // ...
    }
  },
  
  getPostDetail: async (postId: number): Promise<Post> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    // Mock 데이터 반환
  },
}
```

#### 3단계: 실제 API 및 분기 로직 (`lib/api/[domain].ts`)

```typescript
// lib/api/posts.ts
import { api } from "../api"
import type { Post, PostListResponse, PostListParams } from "@/types/post"
import { mockPostApi } from "../mock/posts"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

// 실제 API 함수들
const realPostApi = {
  getPosts: async (params: PostListParams): Promise<PostListResponse> => {
    const response = await api.get<PostListResponse>("/admin/posts", { params })
    return response.data
  },
  
  getPostDetail: async (postId: number): Promise<Post> => {
    const response = await api.get<Post>(`/admin/posts/${postId}`)
    return response.data
  },
}

// Mock 모드에 따라 API 선택
export const postApi = USE_MOCK_API ? mockPostApi : realPostApi

// 외부에서 사용할 함수들
export async function getPosts(params: PostListParams): Promise<PostListResponse> {
  return postApi.getPosts(params)
}

export async function getPostDetail(postId: number): Promise<Post> {
  return postApi.getPostDetail(postId)
}
```

#### 4단계: React Query Hook 생성 (`hooks/use[Domain].ts`)

```typescript
// hooks/usePosts.ts
import { useQuery } from "@tanstack/react-query"
import { getPosts, getPostDetail } from "@/lib/api/posts"

export function usePosts(params: PostListParams) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => getPosts(params),
  })
}

export function usePostDetail(postId: number) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostDetail(postId),
    enabled: !!postId,
  })
}
```

## 실제 API로 전환

### 단계별 전환 방법

1. **환경 변수 변경**
   ```bash
   # .env.local
   NEXT_PUBLIC_USE_MOCK_API=false
   ```

2. **코드 변경 불필요**
   - 각 `lib/api/[domain].ts`에서 자동으로 실제 API를 사용합니다.
   - 컴포넌트나 hooks 코드 변경이 필요 없습니다.

3. **API 엔드포인트 확인**
   - `lib/api/api.ts`에서 `baseURL` 확인
   - `.env.local`의 `NEXT_PUBLIC_API_BASE_URL` 확인

## Mock API 작성 가이드라인

### 1. 데이터 생성

- **동적 생성**: 매번 호출 시 새로운 데이터 생성 (필요시)
- **일관성**: 동일한 입력에 대해 동일한 결과 반환 (필터링, 페이지네이션 등)
- **현실성**: 실제 데이터와 유사한 구조와 값 사용

### 2. 지연 시뮬레이션

```typescript
// 네트워크 지연 시뮬레이션 (300-500ms)
await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))
```

### 3. 에러 처리

```typescript
// 에러 케이스 시뮬레이션 (선택사항)
if (shouldError) {
  throw new Error("Mock error message")
}
```

### 4. 필터링 및 페이지네이션

```typescript
// 필터링 예시
let filtered = [...mockData]
if (params.keyword) {
  filtered = filtered.filter(item => 
    item.name.includes(params.keyword)
  )
}

// 페이지네이션 예시
const page = params.page || 0
const size = params.size || 10
const start = page * size
const end = start + size
const paginated = filtered.slice(start, end)

return {
  content: paginated,
  totalElements: filtered.length,
  totalPages: Math.ceil(filtered.length / size),
  size,
  number: page,
}
```

## 장점

- **코드 변경 최소화**: 환경 변수만으로 전환 가능
- **타입 안정성**: 실제 API와 동일한 타입 사용
- **테스트 용이**: 일관된 Mock 데이터로 테스트 가능
- **독립적 개발**: 백엔드 개발과 병렬 진행 가능
- **오프라인 개발**: 네트워크 없이도 개발 가능

## 주의사항

- Mock 데이터는 브라우저 새로고침 시 초기화됩니다.
- Mock 모드에서는 실제 서버와 통신하지 않습니다.
- 프로덕션 배포 시 반드시 `NEXT_PUBLIC_USE_MOCK_API=false`로 설정하세요.
- Mock 데이터는 실제 비즈니스 로직을 완전히 대체하지 않습니다. 실제 API 연동 후 충분한 테스트가 필요합니다.

## 예시

### Mock 모드에서 개발
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 실제 API 연동
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## 체크리스트

새로운 API를 추가할 때:

- [ ] 타입 정의 (`types/[domain].ts`)
- [ ] Mock API 구현 (`lib/mock/[domain].ts`)
- [ ] 실제 API 및 분기 로직 (`lib/api/[domain].ts`)
- [ ] React Query Hook (`hooks/use[Domain].ts`)
- [ ] Mock 데이터 생성 함수 작성
- [ ] 필터링/페이지네이션 로직 구현
- [ ] 지연 시뮬레이션 추가
- [ ] 에러 케이스 처리 (선택사항)

