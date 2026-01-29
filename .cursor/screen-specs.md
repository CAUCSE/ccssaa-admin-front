# 📱 화면별 상세 스펙

**작성 원칙:**

- **Actionable:** 단순히 "현황"만 보여주는 것이 아니라, 클릭하면 바로 처리 화면으로 이동해야 함.
- **Role-Based:** 사용자 역할에 따라 필요한 정보만 노출 (정보 과부하 방지).

---

## 0. 로그인 (Login)

**화면 ID:** `ADM-LOGIN`  
**상세 스펙:** [.cursor/login-spec.md](.cursor/login-spec.md)

- **경로:** `/login`
- **레이아웃:** LNB/헤더 없음. 전체 화면 중앙에 이메일·비밀번호 폼(Card).
- **동작:** 로그인 성공 시 `/dashboard` 이동. 미인증 사용자 대시보드 접근 시 `/login` 리다이렉트.

---

## 1. 회원 관리 (User Management)

**화면 ID:** `ADM-USER-LIST` / `ADM-USER-DETAIL`

### 1.1. 리스트 화면 (List)

- **검색 조건:** `[학번/이름(Input)]`, `[학과(Select)]`, `[상태(Select: 전체/대기/활동/추방)]`
- **데이터 테이블 (Columns):**
  1. **No:** (Center)
  2. **학번:** (Center) 20201234
  3. **이름:** (Left) 김철수
  4. **학과:** (Left) 소프트웨어학부
  5. **상태:** (Center) `PENDING(대기)`, `ACTIVE(활동)`, `BANNED(추방)` **[Badge]**
  6. **가입일:** (Center) YYYY.MM.DD
  7. **관리:** (Center) `[상세보기 >]` 버튼 (Ghost)

### 1.2. 상세 화면 (Detail)

- **페이지 헤더 (PageHeader):**
  - **네비게이션 영역:** `← Users / 회원 상세` (Breadcrumb 형태)
    - 뒤로가기 버튼: link 스타일 (ghost/text button), hover 시 강조
  - **제목 및 설명:** 
    - 제목: "회원 상세"
    - 설명: "회원 정보를 확인하고 관리할 수 있습니다." (제목 바로 아래)
- **정보 영역:**
  - **프로필 (Read-only):** 이름, 학번, 학과, 연락처, 이메일, 가입일.
  - **역할 (Editable):** `[역할 선택 드롭다운]` + `[변경]` 버튼. (Sprint 2 로직 연동)
- **하단 액션 버튼 (Footer Actions):**
  - **승인 대기(`PENDING`) 상태일 때:** `[거부(Red)]` `[승인(Blue)]`
  - **활동 중(`ACTIVE`) 상태일 때:** `[강제 추방(Red)]` (Master 권한 필요)

---

## 2. 게시판 관리 (Board Management)

**화면 ID:** `ADM-BOARD-LIST` / `ADM-BOARD-DETAIL`

**게시판 생성 API (v2):** [.cursor/boards-api-v2.md](.cursor/boards-api-v2.md) — POST `/api/v2/admin/boards`, 전체 필드(name, description, adminUserIds, isAnonymous, readScope, writeScope, isNotice, visibility).

### 2.1. 리스트 화면 (List) — `/content/boards`

- **검색 조건:** `[게시판 선택(Select)]`, `[제목+내용(Input)]`, `[작성자(Input)]`
- **데이터 테이블 (Columns):**
  1. **No:** (Center)
  2. **게시판:** (Center) 학생회 공지
  3. **제목:** (Left) 2025년 1학기 개강총회 안내... (말줄임)
  4. **작성자:** (Center) 이영희 (학생회장)
  5. **작성일:** (Center) YYYY.MM.DD
  6. **상태:** (Center) `PUBLIC(공개)`, `HIDDEN(숨김)` **[Badge]**
  7. **관리:** (Center) `[상세보기 >]`

### 2.2. 상세 화면 (Detail)

- **정보 영역:**
  - **본문 미리보기:** 제목, 작성자, 본문 내용(Text only), 첨부파일 목록.
  - **댓글 목록:** 댓글 리스트 + 각 댓글 우측에 `[삭제(x)]` 아이콘.
- **우측 상단 액션:**
  - `[공지 고정(Pin)]` (Toggle)
  - `[숨김 처리(Hide)]` (Secondary)
  - `[삭제(Delete)]` (Destructive) **(주의: 학생부회장에게는 노출되지 않음)**

---

## 3. 신고 관리 (Report Management)

**화면 ID:** `ADM-REPORT-LIST` / `ADM-REPORT-DETAIL`

### 3.1. 리스트 화면 (List)

- **검색 조건:** `[대상 유형(글/댓글/유저)]`, `[처리 상태(미처리/완료)]`
- **데이터 테이블 (Columns):**
  1. **No:** (Center)
  2. **대상:** (Center) 게시글 / 댓글
  3. **사유:** (Left) 욕설 및 비하 발언...
  4. **신고자:** (Center) 익명 (또는 학번)
  5. **접수일:** (Center) YYYY.MM.DD HH:mm
  6. **상태:** (Center) `UNRESOLVED(미처리)`, `RESOLVED(완료)` **[Badge]**

### 3.2. 상세 화면 (Detail)

- **핵심 기능:**
  - **신고 대상 원문 보기:** **삭제된 글이라도 관리자는 원문을 볼 수 있어야 함.** (회색 박스 처리)
- **하단 액션 버튼:**
  - `[반려(기각)]`: 신고가 유효하지 않음. 상태만 '완료'로 변경.
  - `[승인(제재)]`: 신고 접수. 해당 글 삭제 또는 유저 제재 처리.

---

## 4. 경조사 관리 (Event Management)

**화면 ID:** `ADM-EVENT-LIST` / `ADM-EVENT-DETAIL`

**권한:** 🎓 크자회장, Master 전용

### 4.1. 리스트 화면 (List)

- **검색 조건:** `[날짜 범위(Date Picker)]`, `[상태(승인/거부/대기)]`
- **데이터 테이블 (Columns):**
  1. **신청일:** (Center) YYYY.MM.DD
  2. **신청자:** (Center) 박지성 (20180001)
  3. **종류:** (Center) 결혼 / 부고
  4. **경조사일:** (Center) YYYY.MM.DD
  5. **상태:** (Center) `PENDING`, `APPROVED`, `REJECTED` **[Badge]**

### 4.2. 상세 화면 (Detail)

- **정보 영역:**
  - **증빙 서류:** 청첩장/부고장 이미지 뷰어 (클릭 시 확대).
  - **계좌 정보:** 지원금 지급용 계좌번호.
- **하단 액션 버튼:**
  - `[거부(Red)]`: 클릭 시 **'거부 사유 입력 모달'** 팝업.
  - `[승인(Blue)]`: 승인 시 즉시 `APPROVED` 상태로 변경 및 배너 노출(자동화 여부 확인).

---

## 5. 사물함 관리 (Locker Management)

**화면 ID:** `ADM-LOCKER-LIST` / `ADM-LOCKER-DETAIL`

**권한:** `LOCKER_MANAGEMENT` 권한 필요 (RBAC 기반)

### 5.1. 리스트 화면 (List)

- **검색 조건:** `[사물함 번호(Input)]`, `[상태(Select: 전체/사용가능/사용중)]`, `[사용자 검색(Input)]`
- **데이터 테이블 (Columns):**
  1. **번호:** (Center) 101, 102, ...
  2. **현재 사용자:** (Center) 김철수 (20201234) / 빈칸
  3. **이전 사용자:** (Center) 이영희 (20201111) / 빈칸
  4. **상태:** (Center) `AVAILABLE(사용가능)`, `OCCUPIED(사용중)` **[Badge]**
  5. **배정일:** (Center) YYYY.MM.DD / 빈칸
  6. **관리:** (Center) `[상세보기 >]` 버튼 (Ghost)

- **관리자 액션 버튼 (상단):**
  - `[수동 배정]` (Secondary) - 특정 유저를 특정 번호에 강제 배정
  - `[일괄 회수]` (Destructive) - 모든 OCCUPIED 사물함 회수 + 일괄 알림 발송
  - `[신청 기간 설정]` (Primary) - 신청 시작일/종료일 설정 (캘린더 자동 동기화)

### 5.2. 상세 화면 (Detail)

- **정보 영역:**
  - **사물함 번호:** 101
  - **현재 상태:** `AVAILABLE` / `OCCUPIED` **[Badge]**
  - **현재 사용자 정보:** 이름, 학번, 연락처, 배정일
  - **이전 사용자 정보:** 이름, 학번 (최소 이력 보존)
- **관리자 액션 버튼:**
  - `[수동 배정]` (Secondary) - 유저 선택 모달 팝업
  - `[회수]` (Destructive) - Confirm Modal (개별 회수 + 알림 발송)

---

## 6. 캘린더 관리 (Calendar Management)

**화면 ID:** `ADM-CALENDAR-LIST` / `ADM-CALENDAR-FORM`

**권한:** `CALENDAR_MANAGEMENT` 권한 필요 (RBAC 기반)

### 6.1. 리스트 화면 (List)

- **검색 조건:** 
  - `[날짜 범위(Date Picker)]`
  - `[스코프(Select: 전체/재학생/졸업생)]`
  - `[액션 타입(Select: 전체/일반/서비스연결/외부링크)]`
  - `[키워드 검색(Input)]`
- **데이터 테이블 (Columns):**
  1. **일정명:** (Left) 사물함 신청 기간 / 개강총회 / ...
  2. **날짜:** (Center) YYYY.MM.DD HH:mm
  3. **스코프:** (Center) `ALL(전체)`, `STUDENT(재학생)`, `ALUMNI(졸업생)` **[Badge]**
  4. **액션 타입:** (Center) `Notice(일반)`, `Service(서비스연결)`, `Link(외부링크)` **[Badge]**
  5. **생성일:** (Center) YYYY.MM.DD
  6. **관리:** (Center) `[수정]` `[삭제]` 버튼

- **일정 생성 버튼 (상단):**
  - `[일정 등록]` (Primary) - Form Modal 팝업

### 6.2. 일정 등록/수정 모달 (Form Modal)

- **입력 필드:**
  - **일정명 (제목):** Input (필수)
  - **날짜/시간:** Date Picker (필수)
  - **설명:** Textarea (선택)
  - **스코프:** Select (ALL, STUDENT, ALUMNI) (필수)
  - **액션 타입:** Select (Notice, Service, Link) (필수)
  - **서비스 연결:** Select (Service 타입일 경우) - 사물함 신청 페이지 등
  - **외부 링크:** Input URL (Link 타입일 경우)
  - **알림 설정:** Checkbox (일정 시작 전 알림 발송 여부)
- **하단 버튼:**
  - `[취소]` (Secondary)
  - `[저장]` (Primary)

