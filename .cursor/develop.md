아래 문서는 **그대로 Cursor에 붙여 넣어서 쓰는 용도**로 만든

📄 **"관리자 페이지 바이브 코딩 스펙 문서 (Markdown)"** 입니다.

---

# **🛠 Admin Dashboard Vibe Coding Spec**

> Spring Boot API(/api/v1)와 연동되는 관리자 페이지(Admin Dashboard)를 구축한다.

> 목적은 **운영/관리/통계 중심의 백오피스**를 빠르게 만들고, 이후 지속 확장 가능한 구조를 갖추는 것이다.

> **핵심 기조: 개발 효율 최우선 (Fast & Easy).** 복잡한 반응형 로직을 배제하고 표준 라이브러리 기본 기능을 적극 활용.

---

# **1. 🎯 프로젝트 목표**

- 동문 앱 관리자 페이지 구축
- 운영자/마스터 전용 백오피스
- 회원 / 게시글 / 시스템 설정 통합 관리
- 대시보드 기반 지표 시각화
- 빠른 개발 + 유지보수 가능한 구조

---

# **2. 🧱 기술 스택**

- Framework: **Next.js (App Router)**
- Language: **TypeScript**
- UI: **shadcn/ui + Tailwind CSS**
- HTTP Client: **axios**
- Server State: **@tanstack/react-query**
- Table: **@tanstack/react-table**
- Chart: **recharts**
- Auth: JWT 기반 (Spring Boot에서 발급, 초기엔 mock 가능)

---

# **3. ⚙ 프로젝트 초기 세팅**

Cursor는 아래 명령을 기준으로 프로젝트를 구성한다.

```
npx create-next-app@latest admin --typescript --app
cd admin

npx shadcn@latest init

npm install axios @tanstack/react-query @tanstack/react-table recharts
```

---

# **4. 📁 폴더 구조 규칙**

아래 구조를 **기본 골격으로 엄격히 유지**한다.

```
app/
  layout.tsx
  page.tsx                # / → /dashboard redirect
  dashboard/
    page.tsx

  users/
    page.tsx
    [id]/
      page.tsx            # 상세 페이지
    pending/
      page.tsx
    reported/
      page.tsx

  content/
    page.tsx
    boards/
      page.tsx

  reports/
    page.tsx
    [id]/
      page.tsx            # 신고 상세 페이지

  settings/
    page.tsx
    roles/
      page.tsx
    design/
      page.tsx

components/
  layout/
    Sidebar.tsx
    Header.tsx

  ui/
    badge.tsx
    button.tsx
    card.tsx
    dialog.tsx
    input.tsx
    label.tsx
    select.tsx
    separator.tsx
    table.tsx
    toaster.tsx

  user/
    UserTable.tsx
    UserFilter.tsx
    UserProfileCard.tsx
    UserRoleBox.tsx
    UserActionFooter.tsx

lib/
  api.ts
  api/
    users.ts
  auth.ts
  queryClient.ts
  utils.ts
  constants.ts
  mock/
    users.ts

types/
  user.ts
  post.ts
  dashboard.ts
```

---

# **5. 🏗 글로벌 레이아웃 (Global Layout)**

## **5.1. LNB (좌측 메뉴바)**

- **PC (Desktop):** **고정형 (Fixed)**
  - 너비: `250px` 고정
  - 동작: 항상 노출됨. (접기/펼치기 기능 없음 - 개발 공수 절감)
- **Mobile:** **햄버거 드로어 (Overlay Drawer)**
  - 평소 상태: 숨김 (Hidden)
  - 동작: 헤더 좌측 `[≡]` 버튼 터치 시 좌측에서 슬라이드 (Overlay)
  - 닫기: 배경(Backdrop) 터치 시 닫힘

## **5.2. 헤더 (Top Header)**

- **높이:** 최소 `80px` 이상 (`min-h-[80px]`)
- **여백 (Padding):**
  - 좌우: `24px` (`px-6`)
  - 상하: `24px` (`py-6`)
- **구조:**
  - **상단 영역:** 제목 및 액션 버튼
    - 좌측: `[≡]` 햄버거 버튼 (Mobile Only) + **현재 페이지 타이틀**
    - 우측: `유저 프로필 (이름)` + `[로그아웃]` 아이콘
  - **하단 영역:** 브레드크럼 (PC 환경에서만)
    - 제목과 브레드크럼 사이 간격: `space-y-2` (8px)
- **스타일:**
  - 하단 구분선: `border-b` 유지
  - 배경색: `bg-card`
  - 카드 영역과 시각적으로 명확히 분리되도록 여백 확보

## **5.3. 콘텐츠 영역 (Main Content)**

- **너비:** **Fluid (100%)**
  - `max-width` 제한 없음. 화면 전체 너비 사용.
- **여백 (Padding):**
  - PC: `24px`
  - Mobile: `16px`

---

# **6. 📋 리스트 페이지 표준 (List Page Standard)**

## **6.1. 검색 및 필터 영역 (Search Bar)**

- **위치:** 콘텐츠 최상단 (Card 형태 권장)
- **배치 순서:** `[조건 선택(Select)]` → `[검색어 입력(Input)]` → **`[조회 버튼(Button)]`**
- **작동 방식:** **수동 트리거 (Manual Trigger)**
  - 실시간 검색(Debounce) 아님. 반드시 **`[조회]` 버튼 클릭** 또는 **엔터키 입력** 시에만 리스트 갱신.

## **6.2. 데이터 테이블 (Data Table)**

- **스타일:** 헤더(`th`) 배경색 연한 회색(`bg-gray-50`), 폰트 굵게 처리.
- **정렬(Align) 규칙:**
  - Left: 텍스트 데이터 (이름, 학과, 제목 등)
  - Center: 고정 길이 데이터 (날짜, 상태 뱃지, No)
  - Right: 금액, 수치 데이터
- **모바일 대응 전략 (Responsive):** **가로 스크롤 (Horizontal Scroll)**
  - 카드 뷰(Card View)로 변환하지 않음.
  - 모바일에서 테이블 너비가 화면을 초과할 경우, **테이블 내부만 좌우로 스크롤**됨 (`overflow-x: auto`).

## **6.3. 페이지네이션 (Pagination)**

- **위치:** 테이블 하단 **중앙 정렬**
- **형태:** `[<] 1 2 3 4 5 [>]` (UI 라이브러리 기본 스타일 사용)

---

# **7. 📄 상세 페이지 표준 (Detail Page Standard)**

## **7.1. 페이지 진입**

- **방식:** 리스트 행(Row) 클릭 시 **별도 페이지로 이동** (`/users/:id`).
- **헤더:** 페이지 타이틀 좌측에 **`[< 뒤로가기]`** 버튼 필수 배치.

## **7.2. 정보 배치 (Grid System)**

- **PC:** **2단 컬럼 (2 Columns)** 권장 (좌측: 기본 정보 / 우측: 상세 정보).
- **Mobile:** **1단 (Stack)** 으로 자동 줄바꿈 처리.

## **7.3. 버튼 액션 (Action Buttons)**

- **위치:** 콘텐츠 우측 상단 또는 폼 최하단 우측.
- **위험 액션 (삭제/거부/추방):**
  - 반드시 **`Red Color`** 사용.
  - 클릭 시 **Confirm Modal (재확인 팝업)** 필수 트리거.

---

# **8. 🎨 UI 컴포넌트 시스템**

## **8.1. 시맨틱 컬러 및 상태 뱃지 (Color & Badge)**

| **상태 (Status Type)** | **의미 (Semantics)** | **색상 (Color)** | **매핑 상태값 (Enum)** |
| --- | --- | --- | --- |
| **Info / Primary** | 주요 액션, 브랜드 | **🔵 Blue** (Brand) | - |
| **Success** | 성공, 승인, 정상 | **🟢 Green** | `ACTIVE`, `APPROVED`, `RESOLVED`, `PUBLIC` |
| **Warning** | 대기, 미처리, 주의 | **🟠 Orange** | `PENDING`, `UNRESOLVED` |
| **Danger** | 위험, 거부, 삭제 | **🔴 Red** | `REJECTED`, `BANNED`, `DELETED` |
| **Neutral** | 비활성, 숨김, 취소 | **⚪ Gray** | `WITHDRAWN`, `HIDDEN`, `DISMISSED` |

## **8.2. 버튼 시스템 (Button System)**

| **레벨 (Hierarchy)** | **스타일 (Style)** | **사용 원칙 (Usage Rule)** | **예시** |
| --- | --- | --- | --- |
| **Primary** | **Solid Blue** (채워진 파랑) | 화면 내 **가장 중요한 1~2개 액션**에만 사용 | `[저장]`, `[등록]`, `[검색]` |
| **Secondary** | **Outline Gray** (회색 테두리) | Primary를 보조하거나, 취소/이동 액션에 사용 (다수 허용) | `[취소]`, `[목록]`, `[초기화]` |
| **Destructive** | **Solid Red** (채워진 빨강) | 데이터 삭제, 회원 차단 등 **위험한 액션**에만 제한적 사용 | `[삭제]`, `[추방]`, `[거부]` |
| **Ghost** | **Text Only** (배경 없음) | 단순 링크 이동, 아이콘 버튼, 닫기 버튼 | `상세보기 >`, `[x]` |

## **8.3. 모달 표준 (Modal Standard)**

| **유형 (Type)** | **권장 너비 (Width)** | **구성 요소 및 특징** | **사용처 예시** |
| --- | --- | --- | --- |
| **Alert / Confirm** | **Small** (400px) | 타이틀 + 메시지 + 버튼(2개). 단순 확인용. | 삭제 재확인, 승인 확인 |
| **Form Modal** | **Medium** (600px) | 타이틀 + **입력 폼(Input)** + 버튼. 스크롤 발생 가능. | 거부 사유 입력, 역할 생성 |
| **List Modal** | **Large** (800px~) | 타이틀 + **데이터 테이블/검색** + 닫기 버튼. | 소속 유저 조회, 이력 조회 |

## **8.4. 입력 필드 상태 (Input States)**

- **Default:** `Border: Gray-300` / `Background: White`
- **Focus:** `Border: Blue-500` (Brand Color) / `Ring: Blue-100` (Glow 효과)
- **Error:** `Border: Red-500` / `Message: Red-500` (하단 에러 문구 필수)
- **Disabled:** `Border: Gray-200` / `Background: Gray-100` / `Cursor: Not-allowed`

---

# **9. 🧭 IA (Information Architecture)**

## **🔑 마스터**

### **🏠 Admin Home (Dashboard)**

- 대시보드 홈
- 전체 지표 요약
- 역할별 위젯 구성 (Master / 학생회장 / 크자회장)

### **👤 회원 관리 (User)**

- 전체 회원 목록 (`/users`)
- 가입 승인 대기 (`/users/pending`)
  - Badge: 대기 인원 수
- 신고된 회원 (`/users/reported`)
  - Badge: 미처리 신고 수
- 회원 상세 (`/users/:id`)

### **📝 게시판 관리 (Content)**

- 전체 게시글 통합 관리 (`/content`)
  - 공지 / 일반 / 신고글 통합 조회
- 게시판 생성 관리 (`/content/boards`)

### **🚨 신고 관리 (Reports)**

- 신고 목록 (`/reports`)
  - Badge: 미처리 신고 수
- 신고 상세 (`/reports/:id`)
  - 신고 대상 원문 보기
  - 반려/승인 처리

### **🔐 사물함 관리 (Lockers)**

- 사물함 신청/배정/회수 관리 (`/lockers`)
- RBAC 기반 권한 제어 (`LOCKER_MANAGEMENT`)
- 선착순 신청 기간(Time-Gated Selection) 설정 및 자동 개폐
- 최소 이력 보존(현재/직전 사용자만 유지) 및 강제 회수 기능

### **📅 캘린더 관리 (Calendar)**

- 전체 일정 조회 및 관리 (`/calendar`)
- RBAC 기반 권한 제어 (`CALENDAR_MANAGEMENT`)
- 사물함 신청 기간·주요 경조사 일정 자동 동기화(Auto-Sync)
- 유저 스코프(`ALL`/`STUDENT`/`ALUMNI`) 기반 일정 노출 제어

### **⚙ 시스템 설정 (Settings)**

- 권한 및 역할 관리 (`/settings/roles`) (Master Only)
- 디자인 / 배너 관리 (`/settings/design`)

---

# **10. 🌐 API 규칙**

모든 API는 다음 prefix를 사용한다.

```
/api/v1/**
```

### **예시**

```
GET    /api/v1/admin/dashboard

GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
GET    /api/v1/admin/users/pending
GET    /api/v1/admin/users/reported

GET    /api/v1/admin/posts
GET    /api/v1/admin/boards

GET    /api/v1/admin/settings/roles
PATCH  /api/v1/admin/settings/design
```

---

# **11. 🔌 Axios 기본 설정**

```
import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/api/v1",
  withCredentials: true,
})
```

- 모든 API는 lib/api.ts에서 관리
- 페이지에서 axios 직접 호출 금지

---

# **12. 🔄 React Query 사용 규칙**

- 모든 서버 통신은 React Query 기반
- 페이지 컴포넌트는 useQuery, useMutation만 사용
- pagination / loading / error 기본 처리

```
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers
})
```

## **12.1. useSearchParams() 사용 시 Suspense 필수**

Next.js 14 App Router에서 `useSearchParams()`를 사용하는 페이지는 반드시 Suspense boundary로 감싸야 합니다.

```tsx
"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

function PageContent() {
  const searchParams = useSearchParams()
  // ... 페이지 로직
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <PageContent />
    </Suspense>
  )
}
```

**적용 페이지:**
- `/users`, `/users/pending`, `/users/reported`
- `/content`
- `/reports`
- `/events`
- `/finance`

---

# **13. 🧩 Client Component 원칙**

관리자 페이지는 **전부 Client Component 기반**으로 작성한다.

```
"use client"
```

- 테이블
- 차트
- 필터
- 모달
- 폼

---

# **14. 📊 공통 컴포넌트 정책**

## **✅ DataTable**

components/ui/table.tsx (shadcn/ui 기반)

기본 지원 기능:
- pagination
- sorting
- column filter
- row action (상세 / 승인 / 삭제)
- 로딩 / empty / error 상태
- 모바일 가로 스크롤 지원

## **✅ ErrorMessage 컴포넌트**

components/ui/error-message.tsx

공통 에러 메시지 표시 컴포넌트:
- API 에러나 기타 오류 상황에서 사용
- 재시도 버튼 지원
- 일관된 에러 UI 제공

```tsx
import { ErrorMessage } from "@/components/ui/error-message"

<ErrorMessage
  title="오류가 발생했습니다"
  message="데이터를 불러오는 중 오류가 발생했습니다."
  onRetry={() => refetch()}
  retryText="다시 시도"
/>
```

## **✅ Sidebar Badge 표시**

Sidebar에서 실시간 Badge 표시:
- 대기 인원 수 (Users > Pending)
- 미처리 신고 수 (Users > Reported, Reports)
- 대시보드 데이터를 활용하여 실시간 업데이트
- Badge는 0보다 클 때만 표시

## **✅ StatCard**

- KPI 카드 공통 컴포넌트
- Dashboard 전용
- 클릭 시 해당 리스트 페이지로 이동 (Shortcut)

## **✅ Badge**

- Sidebar 카운트용
- 상태 표시용
- (대기 인원, 신고 수)

---

# **15. 🧪 Dashboard 구성**

## **15.1. 글로벌 레이아웃**

- **상단 (Top):** **KPI 카드 (4-Grid)**
  - 핵심 지표(숫자)를 크게 강조.
  - 클릭 시 해당 리스트 페이지로 이동 (Shortcut).
- **중단 (Middle):** **최근 활동 / 리스트 (2-Column)**
  - 최근 가입자, 최근 신고 내역 등 리스트 미리보기.
- **모바일 대응:** 1단(Stack)으로 자동 줄바꿈.

## **15.2. 역할별 위젯 구성 (Role-Specific Widgets)**

### **👑 Master (최고 관리자)**

시스템 전체의 건전성을 모니터링합니다.

- **KPI 카드:**
  1. **전체 회원 수:** `1,250명` (Total)
  2. **신규 가입(오늘):** `+5명` (Growth)
  3. **미처리 신고:** `3건` (Warning - **Red Badge**)
  4. **미처리 경조사:** `2건` (Info)
- **메인 위젯:**
  - **[최근 신고 접수 내역]** (최신순 5개) → 클릭 시 신고 관리 상세로 이동.
  - **[최근 가입 유저]** (최신순 5개) → 클릭 시 유저 상세로 이동.

### **🏫 학생회장 (재학생 관리)**

'가입 승인' 업무가 최우선입니다. (회비 기능 제외됨 반영)

- **KPI 카드:**
  1. **재학생 수:** `850명`
  2. **가입 승인 대기:** `12명` (Warning - **Orange Badge**) → **가장 중요!**
  3. **학생회 공지:** `15개` (Total)
  4. **문화부 공지:** `8개` (Total)
- **메인 위젯:**
  - **[가입 승인 대기 목록]** (오래된순 5개)
    - 리스트 우측에 `[승인]` 버튼을 바로 배치하여, 홈에서 즉시 처리 가능하게 설계 (Quick Action).

### **🎓 크자회장 (동문 관리)**

경조사 챙기기와 동문 커뮤니티 관리가 핵심입니다.

- **KPI 카드:**
  1. **졸업생 수:** `400명`
  2. **경조사 신청 대기:** `2건` (Warning - **Orange Badge**)
  3. **오늘의 새 글:** `5개` (Engagement)
  4. **학부 공지:** `3개` (최근 업데이트)
- **메인 위젯:**
  - **[경조사 신청 목록]** (최신순 5개) → 클릭 시 증빙 확인 화면으로 이동.
  - **[최근 동문 게시글]** (최신순 5개) → 모니터링 용도.

## **15.3. 공통 기능 및 예외 처리**

### **15.3.1. 바로가기 (Quick Links)**

화면 우측(또는 하단)에 자주 쓰는 기능 아이콘 배치.

- `[공지사항 작성]` (Pencil Icon)
- `[유저 검색]` (Search Icon)

### **15.3.2. Empty State (데이터 없음)**

초기 서비스 오픈 시 데이터가 0일 경우, 위젯이 깨지지 않게 처리.

- **KPI 카드:** `0명` 또는 표시.
- **리스트 위젯:** "최근 활동 내역이 없습니다." 문구와 함께 **'일러스트'** 또는 **'회색 박스'** 노출.

### **15.3.3. 로딩 상태 (Skeleton UI)**

대시보드는 데이터를 긁어오는 쿼리가 무거우므로 로딩이 걸릴 수 있음.

- 데이터 로딩 중일 때, 숫자와 리스트 자리에 **회색 박스 애니메이션(Skeleton)** 노출 필수.

---

# **16. 🧑‍💻 코드 스타일 규칙**

- any 사용 금지
- API DTO는 types/에 정의
- 페이지는 얇게 유지
- 비즈니스 로직은 lib로 이동
- 하드코딩 URL 금지
- mock → 실API 쉽게 교체 가능 구조
- 모든 버튼과 배지(Badge)의 색상 코드는 UI Kit 명세서를 따름
- 테이블 구현 시 모바일 환경에서의 `min-width` 설정에 유의하여 가로 스크롤이 자연스럽게 생기도록 함
---

# **17. 🔐 사물함 관리 (Locker Management)**

## **17.1. 시스템 설계 원칙: 기능 권한 기반의 제어 (RBAC)**

- **의도:** 관리 주체의 변경(학생회장 → 마스터 등)과 상관없이 서비스의 연속성을 보장한다.
- **작동 방식:** 모든 사물함 관련 API(신청, 회수, 설정)는 `hasPermission("LOCKER_MANAGEMENT")` 권한 상수를 검증한다.
- **유연성:** 특정 역할(Role)에 로직을 종속시키지 않고, 권한 부여만으로 관리 권한이 즉시 전이되도록 설계한다.

## **17.2. 신청 로직: 시간 제어와 동시성 방어 (Time-Gated Selection)**

- **의도:** 정해진 시간에만 공정하게 자원을 배분하고, 데이터 충돌로 인한 중복 배정을 기술적으로 차단한다.
- **자동 개폐 로직:**
  - 서버는 관리자가 설정한 `start_at`과 `end_at`을 실시간으로 참조한다.
  - Gatekeeping: 현재 서버 시각이 해당 구간 밖일 경우, 모든 신청 API 요청은 비즈니스 로직 진입 전에 즉시 `403 Forbidden` 에러를 반환한다.
- **선택형 선착순(FCFS) 처리:**
  - 유저는 빈 사물함(`AVAILABLE`) 목록 중 본인이 원하는 번호를 명시적으로 선택하여 신청한다.
  - **충돌 해결 (Atomic Transaction):** 두 유저가 동시에 같은 번호를 요청할 경우, DB 트랜잭션 락을 사용하여 한 명의 요청만 성공시킨다.
  - 실패한 유저에게는 "이미 점유된 사물함입니다" 메시지를 반환하고 최신 점유 현황을 다시 조회하게 유도한다.

## **17.3. 상태 및 이력 관리: 최소 데이터 보존 정책 (Minimal History)**

- **의도:** 데이터 효율성을 극대화하면서, 시설 파손 시 책임 소재 파악을 위한 최소한의 단서만 남긴다.
- **상태 정의:** `AVAILABLE`(미사용), `OCCUPIED`(사용 중) 두 상태만 사용한다.
- **데이터 밀어내기 로직 (1-Step History):**
  - 신규 배정 시 `current_user` 정보를 `last_user` 필드로 복사하고, `current_user`에 신규 신청 유저를 기록한다.
  - 이 과정에서 기존에 존재하던 '전전 사용자' 데이터는 영구적으로 덮어쓰기(Overwrite)하여 삭제한다.
- **사용자 자율성:** 배정 완료 후 번호 변경은 불가하며, 오직 '취소 후 선착순 재신청'만 허용한다.

## **17.4. 관리자 개입: 수동 제어권 (Admin God-Mode)**

- **의도:** 시스템 자동화가 해결하지 못하는 행정적 특수 상황을 관리자가 강제로 조정한다.
- **수동 직접 배정:** 선착순 신청 기간과 무관하게 특정 유저를 원하는 사물함 번호에 직접 할당할 수 있다.
  - 기존 사용자가 있다면 강제로 밀어내고 배정하며, 이때도 이력 정책(현재/직전 사용자)만 유지한다.
- **수동 일괄 회수:** 학기 전환 시 버튼 한 번으로 모든 `OCCUPIED` 사물함을 `AVAILABLE`로 전환한다.
  - 유저-사물함 매핑 해제와 **일괄 알림 발송**이 원자적으로 수행되어야 한다.
- **독립적 징계 정책:** 유저가 `SUSPENDED` 되어도 사물함 점유권은 자동 회수되지 않고, 관리자의 명시적 '회수' 액션으로만 자원이 해제된다.

## **17.5. 알림 시스템: 행정 피드백 (Notification Center)**

- **의도:** 유저가 본인의 자원 점유 상태 변화를 알림센터를 통해 명확히 인지하게 한다.
- **트리거 시점:**
  - 배정 성공: 신청 즉시 배정 번호와 함께 발송.
  - 회수 완료: 개별 강제 회수 또는 일괄 회수 시 즉시 발송.
- **이동 경로:** 알림 클릭 시 유저의 현재 사물함 이용 현황 확인 페이지로 랜딩한다.

---

# **18. 📅 캘린더 관리 (Calendar Management)**

## **18.1. 시스템 설계 원칙: 권한 중심의 유연성 (RBAC)**

- **의도:** 일정 등록 주체에 따라 관리 권한을 분리하여 운영의 안정성을 확보한다.
- **작동 방식:** 모든 캘린더 관리 API(등록, 수정, 삭제)는 `hasPermission("CALENDAR_MANAGEMENT")` 권한을 검증한다.
- **확장성:** 마스터가 특정 역할(예: 홍보부장)에게 이 권한을 부여하면, 해당 유저는 즉시 전체 시스템 일정을 관리할 수 있다.

## **18.2. 일정 생성 및 동기화 로직: 자동화된 타임라인 (Auto-Sync)**

- **의도:** 관리자가 동일한 일정을 여러 곳에 중복 등록하는 번거로움을 없애고 데이터 불일치를 방지한다.
- **작동 방식:**
  - 수동 등록: 관리자가 대시보드에서 직접 오피셜 일정을 생성한다.
  - 자동 동기화(Auto-Sync):
    - **사물함:** 사물함 관리자가 '신청 기간'을 설정/수정하면, 캘린더는 이를 감지해 '사물함 신청 기간' 일정을 자동 생성/업데이트한다.
    - **경조사:** 정책에 따라, 승인된 주요 경조사 정보를 캘린더에 노출하도록 설정할 수 있으며, 승인 시점에 자동 일정 생성.
- **의존성:** 타 도메인(사물함, 경조사 등)의 날짜 데이터가 변경되면 캘린더의 대응 일정도 즉시 연동되어 수정된다.

## **18.3. 노출 범위 및 스코프 로직: 타겟팅 정보 전달 (Visibility Scope)**

- **의도:** 유저의 생애 주기(STUDENT, ALUMNI)에 따라 꼭 필요한 정보만 노출하여 정보 피로도를 낮춘다.
- **작동 방식:**
  - **스코프 설정:** 모든 일정은 생성 시 `visibility_scope`(`ALL`, `STUDENT`, `ALUMNI`)를 지정받는다.
  - **필터링 로직:** 유저가 캘린더를 조회할 때 서버는 요청 유저의 역할을 확인하여, 본인 스코프에 해당하지 않는 일정은 응답에서 제외한다.
    - 예: 재학생 전용 사물함 신청 일정은 졸업생에게 노출되지 않음.

## **18.4. 인터페이스 및 시스템 액션 로직: 맥락 기반 이동 (Action Context)**

- **의도:** 일정 확인이 실제 서비스 이용으로 즉시 연결되도록 '브릿지' 역할을 수행한다.
- **작동 방식 (Action Type):**
  - 일반형(Notice): 클릭 시 일정 상세(제목, 장소, 설명)를 팝업으로 표시.
  - 서비스 연결형(Service): 클릭 시 해당 서비스 페이지로 이동 (예: '사물함 신청' 일정 → 사물함 신청 페이지).
  - 외부 링크형(Link): 외부 사이트(예: 학교 공지사항 원문)로 연결되는 URL 포함 가능.

## **18.5. 알림 및 운영 정책 (Notification & Lifecycle)**

- **의도:** 중요한 일정을 유저가 놓치지 않도록 사전에 리마인드한다.
- **알림 자동화:**
  - 일정 생성 시 '알림 설정'이 체크된 경우, 일정 시작 전(예: 1시간 전 또는 당일 오전)에 대상 유저들의 통합 알림센터로 자동 알림을 발송.
- **반복 미지원:** 매년 일정이 가변적이므로 반복 등록 기능은 제공하지 않고, 모든 일정은 단건으로 처리한다.
- **데이터 보존:** 지난 일정은 삭제하지 않고 아카이빙하여, 유저가 과거 활동 기록을 조회할 수 있도록 유지한다.

---

# **19. 📝 화면별 상세 스펙**

자세한 화면별 스펙은 다음 문서를 참고하세요:

- `screen-specs.md` - 회원 관리, 게시판 관리, 신고 관리, 경조사 관리 상세 스펙
