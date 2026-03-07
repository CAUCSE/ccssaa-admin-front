# 동문 관리자 페이지 (Dongne Admin)

Spring Boot API와 연동되는 관리자 페이지입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **HTTP Client**: axios
- **Server State**: @tanstack/react-query
- **Table**: @tanstack/react-table
- **Chart**: recharts

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음을 설정하세요:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCK_API=true  # Mock API 사용 여부 (개발용)
```

## 프로젝트 구조

```
app/
  dashboard/          # 대시보드
  users/              # 회원 관리
    [id]/            # 회원 상세
    pending/         # 가입 승인 대기
    reported/        # 신고된 회원
  content/            # 게시판 관리
    [id]/            # 게시글 상세
    boards/          # 게시판 관리
  reports/            # 신고 관리
    [id]/            # 신고 상세
  events/             # 경조사 관리
    [id]/            # 경조사 상세
  lockers/            # 사물함 관리
    [id]/            # 사물함 상세
    policies/        # 사물함 정책 관리
      new/           # 정책 등록
      [id]/edit/     # 정책 수정
  settings/           # 시스템 설정
    roles/           # 권한 및 역할 관리
    design/          # 디자인/배너 관리

components/
  layout/             # 레이아웃 컴포넌트 (Sidebar, Header, PageHeader)
  user/               # 회원 관리 컴포넌트
  content/            # 게시판 관리 컴포넌트
  report/             # 신고 관리 컴포넌트
  ui/                 # shadcn/ui 컴포넌트

lib/
  api/                # API 함수들
    dashboard.ts
    users.ts
    posts.ts
    reports.ts
    events.ts
    settings.ts
  mock/               # Mock API 데이터
  utils/              # 유틸리티 함수
  api.ts              # axios 인스턴스
  auth.ts             # 인증 유틸리티
  queryClient.ts      # React Query 설정

hooks/                # React Query Hooks
types/                # TypeScript 타입 정의
```

## 주요 기능

### 1. 대시보드
- 역할별 대시보드 (Master, 학생회장, 크자회장)
- KPI 카드 (회원 수, 신규 가입, 미처리 신고 등)
- 최근 활동 위젯

### 2. 회원 관리
- 전체 회원 목록 (검색, 필터, 정렬)
- 회원 상세 정보
- 가입 승인/거부
- 회원 추방
- 역할 변경
- 가입 승인 대기 목록
- 신고된 회원 목록

### 3. 게시판 관리
- 게시글 목록 (검색, 필터)
- 게시글 상세 (본문, 댓글)
- 게시글 상태 변경 (공지 고정, 숨김, 삭제)
- 댓글 삭제
- 게시판 생성/수정/삭제

### 4. 신고 관리
- 신고 목록 (필터)
- 신고 상세 (원문 보기)
- 신고 처리 (반려/승인)

### 5. 경조사 관리
- 경조사 목록 (날짜 범위, 상태 필터)
- 경조사 상세 (증빙 서류, 계좌 정보)
- 경조사 승인/거부

### 6. 사물함 관리
- 사물함 목록 (검색, 일괄 회수, 신청 기간 설정)
- 사물함 상세 (배정/회수)
- **사물함 정책 관리**: 학기/기간별 신청·연장 정책 CRUD, 활성화(동시 1개만 ACTIVE)

### 7. 시스템 설정
- 권한 및 역할 관리 (Master 전용)
- 디자인/배너 관리

## API 규칙

모든 API는 `/api/v1` prefix를 사용합니다.

### 주요 API 엔드포인트

- `GET /api/v1/admin/dashboard` - 대시보드 데이터
- `GET /api/v1/admin/users` - 회원 목록
- `GET /api/v1/admin/users/{id}` - 회원 상세
- `POST /api/v1/admin/users/{id}/approve` - 회원 승인
- `POST /api/v1/admin/users/{id}/reject` - 회원 거부
- `POST /api/v1/admin/users/{id}/ban` - 회원 추방
- `GET /api/v1/admin/posts` - 게시글 목록
- `GET /api/v1/admin/posts/{id}` - 게시글 상세
- `GET /api/v1/admin/reports` - 신고 목록
- `GET /api/v1/admin/reports/{id}` - 신고 상세
- `GET /api/v1/admin/events` - 경조사 목록
- `GET /api/v1/admin/events/{id}` - 경조사 상세
- `GET /api/v1/admin/locker-policies` - 사물함 정책 목록
- `GET /api/v1/admin/locker-policies/{id}` - 사물함 정책 상세
- `POST /api/v1/admin/locker-policies` - 사물함 정책 생성
- `PUT /api/v1/admin/locker-policies/{id}` - 사물함 정책 수정
- `POST /api/v1/admin/locker-policies/{id}/activate` - 사물함 정책 활성화 (기존 ACTIVE는 INACTIVE로 전환)

## 개발 상태

현재 진행률: 약 90% 완료

### 완료된 기능
- ✅ 레이아웃 및 공통 컴포넌트
- ✅ 대시보드
- ✅ 회원 관리
- ✅ 게시판 관리
- ✅ 신고 관리
- ✅ 경조사 관리
- ✅ 사물함 관리 및 사물함 정책 관리
- ✅ 시스템 설정

### 향후 개선 사항
- 권한별 접근 제어 강화
- 모바일 반응형 테스트
- API 에러 처리 개선
- 코드 주석 추가

