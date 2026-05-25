# PLAN: 모바일 관리자 페이지 접근성 개선

브랜치: `feat/mobile-admin-usability-plan` (→ 추후 작업 브랜치로 이전)

## 배경

ccssaa-admin은 동문 커뮤니티·네트워킹·행정 관리 기능을 제공하는 Next.js 기반 관리자 프론트엔드다.
실제 모바일 환경(390x844, iPhone 12 기준)에서 Playwright로 검증한 결과
**테이블 가독성·터치 타겟 사이즈·가로스크롤 힌트·필터 접이성**에서 접근성 개선이 필요하다.

## 현재 이슈 요약

| 유형 | 심각도 | 대상 페이지/컴포넌트 |
|------|--------|---------------------|
| 테이블 컬럼 과다로 내용 잘림 | 높음 | UserTable, AdmissionTable, ReportTable, CalendarTable, DeletedUserTable, events 페이지 |
| 터치 타겟 크기 부족 (일부) | 중간 | 사이드바 close 버튼(28px), 페이지네이션 버튼(30~34px) |
| React `asChild` prop DOM 전달 경고 | 낮음 | button.tsx → Slot 미구현 |
| 필터 영역이 길어질 때 접이식 부재 | 중간 | UserFilter, AdmissionFilter 등 |

## 개선 방안

### 방안 A: 테이블 모바일 카드형 리스트 전환 (권장)

UI 테이블을 그대로 유지하되, 일정 min-width 이하(모바일)에서
자동으로 **카드형 리스트(CardList) 레이아웃**으로 전환하도록 `useResponsive` 훅 + 래퍼 도입.

**변경 범위:**
- `components/ui/table.tsx` → `MobileTableWrapper` 컴포넌트 추가
  - md 이상: 기존 테이블 유지
  - md 미만: 각 row를 카드로 렌더링
- `components/user/UserTable.tsx` → `UserCardView` 서브컴포넌트 추가
- `components/admission/AdmissionTable.tsx` → `AdmissionCardView` 서브컴포넌트 추가
- `components/report/ReportTable.tsx` → `ReportCardView`
- `app/events/page.tsx` → `EventCardView`
- 페이지네이션 버튼 → `h-9 px-3` → `min-h-[40px] min-w-[40px]`

### 방안 B: 테이블 유지 + 가로스크롤 힌트 강화 (최소 작업)

컬럼 수가 많은 테이블에:
- 모바일에서 `"표를 좌우로 스크롤할 수 있습니다"` 안내 추가 (`md:hidden`으로 PC에서는 숨김)
- 첫 번째 컬럼(이름/No) `sticky left-0 bg-background` 처리
- 테이블 `min-width` 조정

**변경 범위:**
- `UserTable`, `AdmissionTable`, `ReportTable`, `events page`에 힌트/스크롤 표시 반응형 개선

### 방안 C: 공통 개선 (A/B 공통)

- `components/ui/table.tsx`에서 `overflow-auto` wrapper 유지 + 모바일 스크롤바 스타일
- 사이드바 모바일 close 버튼 `h-8 w-8` → `min-h-[44px] min-w-[44px]` 확대
- Header 햄버거 버튼 `p-1.5` → `p-3` 패딩 확대
- AuthLayout `p-6 lg:p-6 md:p-4` → `p-4 lg:p-6` (모바일 마진 통일)
- `asChild` prop 버그: button.tsx에 `@radix-ui/react-slot` Slot 적용

## 작업 범위 (이번 PR)

**Phase 1 — 기본 개선 (50점 → 70점 목표)**
1. 모바일 힌트 문구: `UserTable`, `AdmissionTable`, `ReportTable`, `events page`에 `"표를 좌우로 스크롤할 수 있습니다"` 추가 (기존 있으면 유지)
2. `AuthLayout` 모바일 padding: `p-6` → `p-4`
3. 사이드바 닫기 버튼, 햄버거 버튼 터치 타겟 확대
4. `button.tsx` `asChild` Slot 버그 수정
5. 페이지네이션 버튼 `min-w-[40px] min-h-[40px]` 반영

**Phase 2 — 카드뷰 도입 (70점 → 90점 목표)**
6. `UserTable` + `AdmissionTable` mobile card view 도입
7. 게시판·경조사·사물함·캘린더·신고·탈퇴회원 카드뷰 도입
8. 필터 접기/펼치기 (추후)

## 구현 결과 검증 방법

- `npm run build`로 에러/경고 제로 확인
- Playwright 모바일(390x844) 스크린샷 재확인
- 모바일 뷰포트에서 테이블/카드 가독성 육안 확인

## 진행 상황

- [x] Phase 1-1. 모바일 힌트 문구 위치 확인 및 반영 (7개 파일)
- [x] Phase 1-2. AuthLayout padding 개선 (p-6 → p-4 lg:p-6)
- [x] Phase 1-3. 터치 타겟 확대 (햄버거 p-3, 닫기 min-h[44px])
- [x] Phase 1-4. asChild Slot 버그 수정 (button.tsx → @radix-ui/react-slot Slot 적용)
- [x] Phase 1-5. 페이지네이션 버튼 최소 크기 (min-w[40px] min-h[40px] 일괄 적용)
- [x] Phase 2-1. UserTable + AdmissionTable mobile card view 도입
- [x] Phase 2-2. 게시판·경조사·사물함(LockerTable)·사물함로그·캘린더·신고·탈퇴회원 카드뷰
- [ ] Phase 2-3. 필터 접기/펼치기 (추후)
- [x] Final. 모바일 재검증 및 commit/push

## 작업 완료 일지

- 브랜치: `feat/mobile-admin-usability-plan`
- 모든 Phase 1 항목 + Phase 2-1, 2-2 완료
- Build 통과, Playwright 모바일(390x844) 검증 완료
  - 모든 페이지 overflow 없음
  - asChild React warning 제거됨
  - 전체 페이지 모바일 카드뷰 렌더링 확인

### 모바일 카드뷰 적용된 페이지 (Phase 2-2)
- `/users` → UserTable (Phase 2-1)
- `/users/pending` → AdmissionTable (Phase 2-1)
- `/users/deleted` → DeletedUserTable
- `/content/boards` → boards page inline card
- `/events` → events page inline card
- `/lockers` → LockerTable
- `/lockers/logs` → lockers logs page inline card
- `/reports` → ReportTable
- `/calendar` → CalendarTable

### 모바일 힌트 적용된 페이지 (Phase 1-1)
- `AdmissionTable`, `ReportTable`, `CalendarTable`, `events/page`, `ReportedPostsTable`, `ReportedCommentsTable`, `DeletedUserTable`
