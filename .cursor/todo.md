# 📋 개발 TODO 리스트

> 기존 코드를 마크다운 스펙 문서에 맞춰 교체 및 작성하기 위한 작업 목록

**참고 문서:**
- `develop.md` - 전체 개발 스펙
- `ui-layout-guidelines.md` - UI 및 레이아웃 가이드라인
- `color-badge-system.md` - 색상 및 뱃지 시스템
- `button-modal-input.md` - 버튼, 모달, 입력 필드
- `screen-specs.md` - 화면별 상세 스펙
- `dashboard-spec.md` - 대시보드 구성 스펙
- `api-mock.md` - 모킹 api 구성 스펙

---

## 🏗 1. 레이아웃 및 공통 컴포넌트

### 1.1. 글로벌 레이아웃 개선

- [x] **Sidebar 컴포넌트 개선** (`components/layout/Sidebar.tsx`)
  - [x] PC: 고정형 250px 너비 (현재 64px → 250px로 변경)
  - [x] Mobile: 햄버거 드로어 추가 (Overlay Drawer)
  - [x] 모바일에서만 햄버거 버튼 표시
  - [x] 배경(Backdrop) 클릭 시 닫기 기능

- [x] **Header 컴포넌트 개선** (`components/layout/Header.tsx`)
  - [x] 높이 64px 고정 확인
  - [x] 모바일에서 햄버거 버튼 추가 (`[≡]`)
  - [x] 브레드크럼 추가 (PC 환경에서만 타이틀 하단)
  - [x] 유저 프로필 표시 개선

- [x] **Root Layout 개선** (`app/layout.tsx`)
  - [x] 모바일 반응형 처리
  - [x] 콘텐츠 영역 여백: PC 24px, Mobile 16px
  - [x] 모바일에서 Sidebar 드로어 상태 관리

---

### 1.2. UI 컴포넌트 시스템 적용

- [x] **색상 및 뱃지 시스템** (`color-badge-system.md` 참고)
  - [x] Badge 컴포넌트에 시맨틱 컬러 적용 (success, warning, danger, neutral variant 추가)
  - [x] 상태값별 색상 매핑 구현 (ACTIVE=Green, PENDING=Orange, REJECTED=Red 등)
  - [x] `lib/utils/status-badge.ts` 유틸리티 함수 생성
  - [x] `types/user.ts`에 상태 Enum 정의 확인/추가

- [x] **버튼 시스템** (`button-modal-input.md` 참고)
  - [x] Primary, Secondary, Destructive, Ghost 버튼 스타일 확인
  - [x] shadcn/ui Button 컴포넌트 variant 확인/수정 (이미 구현됨)

- [x] **모달 시스템** (`button-modal-input.md` 참고)
  - [x] Alert/Confirm Modal (400px)
  - [x] Form Modal (600px)
  - [x] List Modal (800px)
  - [x] shadcn/ui Dialog 컴포넌트 활용 (컴포넌트 존재 확인)

- [x] **입력 필드 상태** (`button-modal-input.md` 참고)
  - [x] Input 컴포넌트 상태 스타일 확인 (Default, Focus, Error, Disabled)
  - [x] 에러 메시지 표시 기능 확인 (추가 구현 필요)

---

### 1.3. 공통 컴포넌트 생성

- [x] **StatCard 컴포넌트** (`components/ui/stat-card.tsx`)
  - [x] KPI 카드 공통 컴포넌트
  - [x] 클릭 시 해당 리스트 페이지로 이동 기능
  - [x] Badge 표시 기능
  - [x] Dashboard 전용

- [x] **Skeleton 컴포넌트** (`components/ui/skeleton.tsx`)
  - [x] 로딩 상태용 Skeleton UI 컴포넌트 생성

- [x] **DataTable 컴포넌트 개선** (`components/ui/table.tsx`)
  - [x] 헤더 배경색 연한 회색 (`bg-gray-50`)
  - [x] 폰트 굵게 처리 (font-semibold)
  - [x] 정렬 규칙 적용 (Left/Center/Right) - 페이지별로 개별 적용 완료
  - [x] 모바일 가로 스크롤 지원 (`overflow-x: auto` - Table 컴포넌트에 기본 적용)
  - [x] 페이지네이션 중앙 정렬 - 페이지별로 개별 구현 완료
  - [x] 로딩 / empty / error 상태 처리 - 페이지별로 개별 구현 완료 (공통 ErrorMessage 컴포넌트 추가)
  - [x] useSearchParams() Suspense boundary 추가 (Next.js 14 요구사항)
  - [ ] @tanstack/react-table 활용 - 향후 개선 필요

---

## 📊 2. 대시보드 구현

### 2.1. 대시보드 페이지 (`app/dashboard/page.tsx`)

- [x] **KPI 카드 영역 (4-Grid)**
  - [x] 역할별 KPI 카드 구성
    - [x] Master: 전체 회원 수, 신규 가입(오늘), 미처리 신고, 미처리 경조사
    - [x] 학생회장: 재학생 수, 가입 승인 대기, 학생회 공지, 문화부 공지
    - [x] 크자회장: 졸업생 수, 경조사 신청 대기, 오늘의 새 글, 학부 공지
  - [x] 클릭 시 해당 리스트 페이지로 이동
  - [x] Badge 표시 (Warning, Danger 등)

- [x] **메인 위젯 영역 (2-Column)**
  - [x] Master: 최근 신고 접수 내역, 최근 가입 유저
  - [x] 학생회장: 가입 승인 대기 목록 (Quick Action 버튼 포함)
  - [x] 크자회장: 경조사 신청 목록, 최근 동문 게시글
  - [x] 클릭 시 상세 페이지로 이동

- [x] **공통 기능**
  - [x] 바로가기 (Quick Links) - 공지사항 작성, 유저 검색
  - [x] Empty State 처리
  - [x] Skeleton UI (로딩 상태)

- [x] **API 연동**
  - [x] `lib/api/dashboard.ts` 생성
  - [x] 역할별 대시보드 데이터 조회 API
  - [x] React Query로 데이터 페칭

---

## 👤 3. 회원 관리 구현

### 3.1. 회원 목록 페이지 (`app/users/page.tsx`)

- [x] **검색 및 필터 영역** (`ui-layout-guidelines.md` 참고)
  - [x] 검색 조건: 학번/이름(Input), 학과(Select), 상태(Select)
  - [x] 수동 트리거 방식 (조회 버튼 클릭 또는 엔터키)
  - [x] Card 형태로 감싸기

- [x] **데이터 테이블** (`screen-specs.md` 참고)
  - [x] 컬럼: No, 학번, 이름, 학과, 상태(Badge), 가입일, 관리
  - [x] 정렬: 텍스트=Left, 날짜/상태=Center
  - [x] 상태 뱃지 색상 적용 (PENDING=Orange, ACTIVE=Green, BANNED=Red)
  - [x] 행 클릭 시 상세 페이지로 이동

- [x] **페이지네이션**
  - [x] 테이블 하단 중앙 정렬
  - [x] 기본 스타일 사용

### 3.2. 회원 상세 페이지 (`app/users/[id]/page.tsx`)

- [x] **페이지 헤더**
  - [x] `PageHeader` 컴포넌트 생성 및 적용
  - [x] 네비게이션 영역: `← Users / 회원 상세` (Breadcrumb 형태)
  - [x] 제목 및 설명 영역 분리
  - [x] 뒤로가기 버튼 link 스타일 (ghost/text button)

- [x] **정보 영역 (2-Column Grid)**
  - [x] 좌측: 프로필 정보 (Read-only) - 이름, 학번, 학과, 연락처, 이메일, 가입일
  - [x] 우측: 역할 (Editable) - 역할 선택 드롭다운 + 변경 버튼

- [x] **하단 액션 버튼**
  - [x] PENDING 상태: `[거부(Red)]` `[승인(Blue)]`
  - [x] ACTIVE 상태: `[강제 추방(Red)]` (Master 권한 필요)
  - [x] 위험 액션은 Confirm Modal 필수

- [x] **API 연동**
  - [x] 회원 상세 조회 API
  - [x] 회원 상태 변경 API (승인/거부/추방)
  - [x] 역할 변경 API

### 3.3. 가입 승인 대기 페이지 (`app/users/pending/page.tsx`)

- [x] 회원 목록과 동일한 구조
- [x] 기본 필터: 상태=PENDING
- [x] Badge에 대기 인원 수 표시 (Sidebar)

### 3.4. 신고된 회원 페이지 (`app/users/reported/page.tsx`)

- [x] 회원 목록과 동일한 구조
- [x] 기본 필터: 신고된 회원만 표시 (API 확정 후 적용)
- [x] Badge에 미처리 신고 수 표시 (Sidebar)

---

## 📝 4. 게시판 관리 구현

### 4.1. 게시글 목록 페이지 (`app/content/page.tsx`)

- [x] **검색 및 필터 영역**
  - [x] 검색 조건: 게시판 선택(Select), 제목+내용(Input), 작성자(Input)
  - [x] 수동 트리거 방식

- [x] **데이터 테이블**
  - [x] 컬럼: No, 게시판, 제목(말줄임), 작성자, 작성일, 상태(Badge), 관리
  - [x] 상태 뱃지: PUBLIC=Green, HIDDEN=Gray

- [x] **API 연동**
  - [x] 게시글 목록 조회 API
  - [x] 게시판 목록 조회 API (Select 옵션용)

### 4.2. 게시글 상세 페이지 (`app/content/[id]/page.tsx` - 새로 생성 필요)

- [x] **페이지 헤더**
  - [x] `PageHeader` 컴포넌트 적용

- [x] **정보 영역**
  - [x] 본문 미리보기: 제목, 작성자, 본문 내용, 첨부파일 목록
  - [x] 댓글 목록: 각 댓글 우측에 `[삭제(x)]` 아이콘

- [x] **우측 상단 액션**
  - [x] `[공지 고정(Pin)]` (Toggle)
  - [x] `[숨김 처리(Hide)]` (Secondary)
  - [x] `[삭제(Delete)]` (Destructive) - 학생부회장에게는 노출 안 함

- [x] **API 연동**
  - [x] 게시글 상세 조회 API
  - [x] 댓글 목록 조회 API
  - [x] 게시글 상태 변경 API (공지 고정, 숨김, 삭제)
  - [x] 댓글 삭제 API

### 4.3. 게시판 관리 페이지 (`app/content/boards/page.tsx`)

- [x] 게시판 생성/수정/삭제 기능
- [x] 게시판 목록 표시
- [x] API 연동 (생성, 수정, 삭제)

---

## 🚨 5. 신고 관리 구현

### 5.1. 신고 목록 페이지 (`app/reports/page.tsx` - 새로 생성 필요)

- [x] **검색 및 필터 영역**
  - [x] 검색 조건: 대상 유형(글/댓글/유저), 처리 상태(미처리/완료)

- [x] **데이터 테이블**
  - [x] 컬럼: No, 대상, 사유, 신고자, 접수일, 상태(Badge)
  - [x] 상태 뱃지: UNRESOLVED=Orange, RESOLVED=Green

- [x] **API 연동**
  - [x] 신고 목록 조회 API

### 5.2. 신고 상세 페이지 (`app/reports/[id]/page.tsx` - 새로 생성 필요)

- [x] **핵심 기능**
  - [x] 신고 대상 원문 보기 (삭제된 글도 회색 박스로 표시)

- [x] **하단 액션 버튼**
  - [x] `[반려(기각)]`: 상태만 '완료'로 변경
  - [x] `[승인(제재)]`: 해당 글 삭제 또는 유저 제재 처리

- [x] **API 연동**
  - [x] 신고 상세 조회 API
  - [x] 신고 처리 API (반려/승인)

---

## 🎉 6. 경조사 관리 구현 (크자회장, Master 전용)

### 6.1. 경조사 목록 페이지 (`app/events/page.tsx` - 새로 생성 필요)

- [x] **검색 및 필터 영역**
  - [x] 검색 조건: 날짜 범위(Date Picker), 상태(승인/거부/대기)

- [x] **데이터 테이블**
  - [x] 컬럼: 신청일, 신청자, 종류, 경조사일, 상태(Badge)
  - [x] 상태 뱃지: PENDING=Orange, APPROVED=Green, REJECTED=Red

- [ ] **권한 체크**
  - [ ] 크자회장, Master만 접근 가능 (향후 구현)

- [x] **API 연동**
  - [x] 경조사 목록 조회 API

### 6.2. 경조사 상세 페이지 (`app/events/[id]/page.tsx` - 새로 생성 필요)

- [x] **정보 영역**
  - [x] 증빙 서류: 이미지 뷰어 (클릭 시 확대)
  - [x] 계좌 정보: 지원금 지급용 계좌번호

- [x] **하단 액션 버튼**
  - [x] `[거부(Red)]`: 거부 사유 입력 모달 팝업
  - [x] `[승인(Blue)]`: APPROVED 상태로 변경 및 배너 노출

- [x] **API 연동**
  - [x] 경조사 상세 조회 API
  - [x] 경조사 승인/거부 API

---

## 🔐 7. 사물함 관리 구현

### 7.1. 사물함 목록 페이지 (`app/lockers/page.tsx`)

- [ ] **권한 체크**
  - [ ] `LOCKER_MANAGEMENT` 권한 검증 (RBAC 기반)
  - [ ] 권한 없을 시 접근 차단

- [ ] **검색 및 필터 영역**
  - [ ] 사물함 번호 검색
  - [ ] 상태 필터 (AVAILABLE, OCCUPIED)
  - [ ] 사용자 검색 (현재 사용자, 이전 사용자)

- [ ] **데이터 테이블**
  - [ ] 컬럼: 번호, 현재 사용자, 이전 사용자, 상태(Badge), 배정일, 액션
  - [ ] 상태 뱃지: AVAILABLE=Green, OCCUPIED=Gray
  - [ ] 행 클릭 시 상세 정보 표시

- [ ] **관리자 액션 버튼**
  - [ ] 수동 직접 배정 (특정 유저를 특정 번호에 강제 배정)
  - [ ] 개별 회수 (선택한 사물함만 회수)
  - [ ] 일괄 회수 (모든 OCCUPIED 사물함 회수 + 일괄 알림 발송)

- [ ] **신청 기간 설정**
  - [ ] 신청 시작일/종료일 설정 (`start_at`, `end_at`)
  - [ ] 설정 시 캘린더에 자동 동기화 (Auto-Sync)

- [ ] **API 연동**
  - [ ] 사물함 목록 조회 API
  - [ ] 사물함 상세 조회 API
  - [ ] 수동 배정 API
  - [ ] 개별 회수 API
  - [ ] 일괄 회수 API
  - [ ] 신청 기간 설정 API

### 7.2. 사물함 상세/관리 페이지 (`app/lockers/[id]/page.tsx`)

- [ ] **정보 영역**
  - [ ] 사물함 번호
  - [ ] 현재 상태 (AVAILABLE/OCCUPIED)
  - [ ] 현재 사용자 정보 (이름, 학번, 연락처)
  - [ ] 이전 사용자 정보 (이름, 학번)
  - [ ] 배정일/회수일

- [ ] **관리자 액션**
  - [ ] 수동 배정 (유저 선택 모달)
  - [ ] 회수 (Confirm Modal)

- [ ] **API 연동**
  - [ ] 사물함 상세 조회 API
  - [ ] 수동 배정 API
  - [ ] 회수 API

---

## 📅 8. 캘린더 관리 구현

### 8.1. 캘린더 목록 페이지 (`app/calendar/page.tsx`)

- [ ] **권한 체크**
  - [ ] `CALENDAR_MANAGEMENT` 권한 검증 (RBAC 기반)
  - [ ] 권한 없을 시 접근 차단

- [ ] **검색 및 필터 영역**
  - [ ] 날짜 범위 필터 (Date Picker)
  - [ ] 스코프 필터 (ALL, STUDENT, ALUMNI)
  - [ ] 액션 타입 필터 (Notice, Service, Link)
  - [ ] 키워드 검색

- [ ] **데이터 테이블**
  - [ ] 컬럼: 일정명, 날짜, 스코프, 액션 타입, 생성일, 액션
  - [ ] 스코프 뱃지: ALL=Blue, STUDENT=Green, ALUMNI=Orange
  - [ ] 액션 타입 뱃지: Notice=Gray, Service=Blue, Link=Purple

- [ ] **일정 생성 버튼**
  - [ ] `[일정 등록]` 버튼 (Form Modal)

- [ ] **API 연동**
  - [ ] 캘린더 목록 조회 API
  - [ ] 일정 생성 API
  - [ ] 일정 수정 API
  - [ ] 일정 삭제 API

### 8.2. 일정 등록/수정 모달 (`components/calendar/CalendarFormDialog.tsx`)

- [ ] **입력 필드**
  - [ ] 일정명 (제목)
  - [ ] 날짜/시간 (Date Picker)
  - [ ] 설명 (Textarea)
  - [ ] 스코프 선택 (ALL, STUDENT, ALUMNI)
  - [ ] 액션 타입 선택 (Notice, Service, Link)
  - [ ] 서비스 연결 (Service 타입일 경우) - 사물함 신청 페이지 등
  - [ ] 외부 링크 (Link 타입일 경우) - URL 입력
  - [ ] 알림 설정 체크박스

- [ ] **API 연동**
  - [ ] 일정 생성 API
  - [ ] 일정 수정 API

### 8.3. 자동 동기화 로직

- [ ] **사물함 신청 기간 동기화**
  - [ ] 사물함 신청 기간 설정 시 자동 일정 생성/업데이트
  - [ ] 사물함 신청 기간 변경 시 캘린더 일정 자동 업데이트
  - [ ] 스코프: STUDENT (재학생 전용)

- [ ] **경조사 일정 동기화** (선택적)
  - [ ] 경조사 승인 시 자동 일정 생성 (정책에 따라)
  - [ ] 스코프: ALUMNI (졸업생 전용)

- [ ] **API 연동**
  - [ ] 사물함 기간 변경 이벤트 감지
  - [ ] 경조사 승인 이벤트 감지
  - [ ] 자동 일정 생성 API

---

## ⚙️ 9. 시스템 설정 구현

### 9.1. 권한 및 역할 관리 (`app/settings/roles/page.tsx`)

- [x] Master 전용 (UI 표시만, 실제 권한 체크는 향후 구현)
- [x] 역할 목록 및 권한 설정
- [x] API 연동

### 9.2. 디자인 / 배너 관리 (`app/settings/design/page.tsx`)

- [x] 배너 이미지 업로드/관리
- [x] 디자인 설정 (기본 구조)
- [x] API 연동

---

## 🔌 10. API 및 데이터 레이어

### 10.1. API 함수 생성

- [x] `lib/api/dashboard.ts` - 대시보드 API
- [x] `lib/api/users.ts` - 회원 관리 API (확인/보완)
- [x] `lib/api/posts.ts` - 게시글 API (게시판 관리 기능 추가)
  - [x] `lib/api/reports.ts` - 신고 관리 API
  - [x] `lib/api/events.ts` - 경조사 관리 API
  - [ ] `lib/api/lockers.ts` - 사물함 관리 API
  - [ ] `lib/api/calendar.ts` - 캘린더 관리 API
  - [x] `lib/api/settings.ts` - 시스템 설정 API

### 10.2. React Query Hooks

- [x] `hooks/useDashboard.ts` - 대시보드 데이터
- [x] `hooks/useUsers.ts` - 회원 데이터 (확인/보완)
- [x] `hooks/usePosts.ts` - 게시글 데이터 (게시판 관리 Hook 추가)
  - [x] `hooks/useReports.ts` - 신고 데이터
  - [x] `hooks/useEvents.ts` - 경조사 데이터
  - [ ] `hooks/useLockers.ts` - 사물함 데이터
  - [ ] `hooks/useCalendar.ts` - 캘린더 데이터
  - [x] `hooks/useSettings.ts` - 시스템 설정 데이터

### 10.3. 타입 정의

- [x] `types/dashboard.ts` - 대시보드 타입
- [x] `types/user.ts` - 회원 타입 (확인/보완 - 이미 존재)
- [x] `types/post.ts` - 게시글 타입
  - [x] `types/report.ts` - 신고 타입 (새로 생성)
  - [x] `types/event.ts` - 경조사 타입 (새로 생성)
  - [ ] `types/locker.ts` - 사물함 타입 (새로 생성)
  - [ ] `types/calendar.ts` - 캘린더 타입 (새로 생성)
  - [x] `types/settings.ts` - 시스템 설정 타입 (새로 생성)

---

## 🎨 11. 스타일 및 반응형

- [x] 테이블 가로 스크롤 확인 (기본 적용 완료)
- [x] Sidebar 드로어 동작 확인
- [x] Suspense fallback UI 구현 (로딩 상태)
- [ ] 모바일 반응형 테스트
- [ ] 모든 페이지 모바일 대응 확인
- [ ] 색상 시스템 일관성 확인

---

## 🧪 12. 테스트 및 검증

- [ ] 각 페이지 기능 테스트
- [ ] 권한별 접근 제어 확인
- [x] API 에러 처리 확인 (공통 ErrorMessage 컴포넌트 추가)
- [x] 로딩 상태 확인 (Suspense fallback 구현)
- [x] Empty State 확인 (각 페이지별 구현 완료)
- [x] TypeScript 빌드 오류 수정 완료
- [x] Vercel 배포 설정 완료
- [ ] 모바일 UX 확인

---

## 📝 13. 문서화 및 정리

- [x] 코드 주석 추가 (주요 컴포넌트 및 페이지)
- [x] README 업데이트
- [x] develop.md 업데이트 (Suspense 패턴, 에러 처리, 배포 가이드)
- [ ] API 문서 정리
- [ ] 컴포넌트 사용 가이드 작성

---

## 우선순위

### 🔥 High Priority (1단계)
1. 레이아웃 및 공통 컴포넌트 (1.1, 1.2, 1.3)
2. 대시보드 구현 (2.1)
3. 회원 관리 구현 (3.1, 3.2)

### ⚡ Medium Priority (2단계)
4. 게시판 관리 구현 (4.1, 4.2)
5. 신고 관리 구현 (5.1, 5.2)
6. API 및 데이터 레이어 (10.1, 10.2, 10.3)

### 📌 Low Priority (3단계)
7. 경조사 관리 구현 (6.1, 6.2)
8. 사물함 관리 구현 (7.1, 7.2)
9. 캘린더 관리 구현 (8.1, 8.2, 8.3)
10. 시스템 설정 구현 (9.1, 9.2)
11. 스타일 및 반응형 (11)
12. 테스트 및 검증 (12)

---

**마지막 업데이트:** 2025-01-27
**진행 상황:** 약 85% 완료 (사물함/캘린더 관리 추가로 진행률 조정)

**최근 완료 사항:**
- ✅ Sidebar Badge 표시 기능 (대기 인원 수, 미처리 신고 수)
- ✅ 공통 ErrorMessage 컴포넌트 생성
- ✅ useSearchParams() Suspense boundary 추가 (모든 관련 페이지)
- ✅ TypeScript 빌드 오류 수정
- ✅ Vercel 배포 설정 및 환경 변수 가이드
- ✅ 코드 주석 추가 (주요 컴포넌트 및 페이지)
- ✅ develop.md 업데이트 (배포 가이드, Suspense 패턴, 에러 처리)

## ✅ 완료된 주요 작업 요약

### 1단계 (High Priority) - 부분 완료
- ✅ 레이아웃 및 공통 컴포넌트 (1.1, 1.2 일부, 1.3 일부)
  - Sidebar: 250px 고정, 모바일 드로어 구현
  - Header: 햄버거 버튼, 브레드크럼 추가
  - Root Layout: 모바일 반응형 처리
  - Badge: 상태별 색상 variant 추가 (success, warning, danger, neutral)
  - StatCard: KPI 카드 컴포넌트 생성
  - Skeleton: 로딩 상태 컴포넌트 생성
  - Table: 헤더 스타일 개선 (bg-gray-50, font-semibold)

- ✅ 대시보드 구현 (2.1)
  - 역할별 위젯 구성 (Master, 학생회장, 크자회장)
  - KPI 카드 영역 (4-Grid)
  - 메인 위젯 영역 (2-Column)
  - 바로가기, Empty State, 로딩 상태 처리
  - API 연동 구조 준비 (dashboard.ts, useDashboard.ts, types/dashboard.ts)

- ✅ 게시판 관리 구현 (4.1, 4.2)
  - 게시글 목록 페이지: 검색/필터, 테이블, 페이지네이션
  - 게시글 상세 페이지: 본문 미리보기, 댓글 목록, 액션 버튼
  - API 연동 완료 (posts.ts, usePosts.ts, types/post.ts)

- ✅ 신고 관리 구현 (5.1, 5.2)
  - 신고 목록 페이지: 검색/필터, 테이블, 페이지네이션
  - 신고 상세 페이지: 신고 대상 원문 보기, 반려/승인 처리
  - API 연동 완료 (reports.ts, useReports.ts, types/report.ts)

### 생성된 파일
- `components/ui/stat-card.tsx` - StatCard 컴포넌트
- `components/ui/skeleton.tsx` - Skeleton 컴포넌트
- `lib/utils/status-badge.ts` - 상태별 뱃지 유틸리티
- `types/dashboard.ts` - 대시보드 타입 정의
- `lib/api/dashboard.ts` - 대시보드 API 함수
- `hooks/useDashboard.ts` - 대시보드 React Query Hook
- `components/ui/alert-dialog.tsx` - Alert/Confirm Modal 컴포넌트
- `components/ui/form-dialog.tsx` - Form Modal 컴포넌트
- `components/ui/list-dialog.tsx` - List Modal 컴포넌트
- `components/ui/form-field.tsx` - 에러 메시지가 있는 입력 필드 컴포넌트
- `components/layout/PageHeader.tsx` - 상세 페이지 헤더 컴포넌트 (네비게이션 + 제목 + 설명)
- `components/content/PostFilter.tsx` - 게시글 검색/필터 컴포넌트
- `components/content/PostTable.tsx` - 게시글 테이블 컴포넌트
- `types/post.ts` - 게시글 타입 정의 (보완)
- `lib/api/posts.ts` - 게시글 API 함수
- `lib/mock/posts.ts` - 게시글 Mock API
- `hooks/usePosts.ts` - 게시글 React Query Hook
- `components/report/ReportFilter.tsx` - 신고 검색/필터 컴포넌트
- `components/report/ReportTable.tsx` - 신고 테이블 컴포넌트
- `types/report.ts` - 신고 타입 정의
- `lib/api/reports.ts` - 신고 API 함수
- `lib/mock/reports.ts` - 신고 Mock API
- `hooks/useReports.ts` - 신고 React Query Hook
- `app/content/boards/page.tsx` - 게시판 관리 페이지
- `types/event.ts` - 경조사 타입 정의
- `lib/api/events.ts` - 경조사 API 함수
- `lib/mock/events.ts` - 경조사 Mock API
- `hooks/useEvents.ts` - 경조사 React Query Hook
- `app/events/page.tsx` - 경조사 목록 페이지
- `app/events/[id]/page.tsx` - 경조사 상세 페이지
- `types/locker.ts` - 사물함 타입 정의
- `lib/api/lockers.ts` - 사물함 API 함수
- `lib/mock/lockers.ts` - 사물함 Mock API
- `hooks/useLockers.ts` - 사물함 React Query Hook
- `components/locker/LockerTable.tsx` - 사물함 테이블 컴포넌트
- `components/locker/LockerFilter.tsx` - 사물함 필터 컴포넌트
- `app/lockers/page.tsx` - 사물함 관리 페이지
- `app/lockers/[id]/page.tsx` - 사물함 상세 페이지
- `types/calendar.ts` - 캘린더 타입 정의
- `lib/api/calendar.ts` - 캘린더 API 함수
- `lib/mock/calendar.ts` - 캘린더 Mock API
- `hooks/useCalendar.ts` - 캘린더 React Query Hook
- `components/calendar/CalendarTable.tsx` - 캘린더 테이블 컴포넌트
- `components/calendar/CalendarFilter.tsx` - 캘린더 필터 컴포넌트
- `components/calendar/CalendarFormDialog.tsx` - 일정 등록/수정 모달
- `app/calendar/page.tsx` - 캘린더 관리 페이지
- `types/settings.ts` - 시스템 설정 타입 정의
- `lib/api/settings.ts` - 시스템 설정 API 함수
- `lib/mock/settings.ts` - 시스템 설정 Mock API
- `hooks/useSettings.ts` - 시스템 설정 React Query Hook
- `app/settings/roles/page.tsx` - 권한 및 역할 관리 페이지
- `app/settings/design/page.tsx` - 디자인/배너 관리 페이지
- `components/ui/error-message.tsx` - 공통 에러 메시지 컴포넌트

