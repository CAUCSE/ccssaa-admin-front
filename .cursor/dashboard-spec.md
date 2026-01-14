# 📊 대시보드 구성 스펙

## 1. 글로벌 레이아웃 (Layout)

- **상단 (Top):** **KPI 카드 (4-Grid)**
  - 핵심 지표(숫자)를 크게 강조.
  - 클릭 시 해당 리스트 페이지로 이동 (Shortcut).
- **중단 (Middle):** **최근 활동 / 리스트 (2-Column)**
  - 최근 가입자, 최근 신고 내역 등 리스트 미리보기.
- **모바일 대응:** 1단(Stack)으로 자동 줄바꿈.

---

## 2. 역할별 위젯 구성 (Role-Specific Widgets)

### 👑 2.1. Master (최고 관리자)

시스템 전체의 건전성을 모니터링합니다.

- **KPI 카드:**
  1. **전체 회원 수:** `1,250명` (Total)
  2. **신규 가입(오늘):** `+5명` (Growth)
  3. **미처리 신고:** `3건` (Warning - **Red Badge**)
  4. **미처리 경조사:** `2건` (Info)
- **메인 위젯:**
  - **[최근 신고 접수 내역]** (최신순 5개) → 클릭 시 신고 관리 상세로 이동.
  - **[최근 가입 유저]** (최신순 5개) → 클릭 시 유저 상세로 이동.

### 🏫 2.2. 학생회장 (재학생 관리)

'가입 승인' 업무가 최우선입니다. (회비 기능 제외됨 반영)

- **KPI 카드:**
  1. **재학생 수:** `850명`
  2. **가입 승인 대기:** `12명` (Warning - **Orange Badge**) → **가장 중요!**
  3. **학생회 공지:** `15개` (Total)
  4. **문화부 공지:** `8개` (Total)
- **메인 위젯:**
  - **[가입 승인 대기 목록]** (오래된순 5개)
    - 리스트 우측에 `[승인]` 버튼을 바로 배치하여, 홈에서 즉시 처리 가능하게 설계 (Quick Action).

### 🎓 2.3. 크자회장 (동문 관리)

경조사 챙기기와 동문 커뮤니티 관리가 핵심입니다.

- **KPI 카드:**
  1. **졸업생 수:** `400명`
  2. **경조사 신청 대기:** `2건` (Warning - **Orange Badge**)
  3. **오늘의 새 글:** `5개` (Engagement)
  4. **학부 공지:** `3개` (최근 업데이트)
- **메인 위젯:**
  - **[경조사 신청 목록]** (최신순 5개) → 클릭 시 증빙 확인 화면으로 이동.
  - **[최근 동문 게시글]** (최신순 5개) → 모니터링 용도.

---

## 3. 공통 기능 및 예외 처리 (Common & Edge Cases)

### 3.1. 바로가기 (Quick Links)

화면 우측(또는 하단)에 자주 쓰는 기능 아이콘 배치.

- `[공지사항 작성]` (Pencil Icon)
- `[유저 검색]` (Search Icon)

### 3.2. Empty State (데이터 없음)

초기 서비스 오픈 시 데이터가 0일 경우, 위젯이 깨지지 않게 처리.

- **KPI 카드:** `0명` 또는 표시.
- **리스트 위젯:** "최근 활동 내역이 없습니다." 문구와 함께 **'일러스트'** 또는 **'회색 박스'** 노출.

### 3.3. 로딩 상태 (Skeleton UI)

대시보드는 데이터를 긁어오는 쿼리가 무거우므로 로딩이 걸릴 수 있음.

- 데이터 로딩 중일 때, 숫자와 리스트 자리에 **회색 박스 애니메이션(Skeleton)** 노출 필수.

---

## 구현 가이드

### KPI 카드 컴포넌트 예시

```typescript
<StatCard
  title="전체 회원 수"
  value="1,250명"
  icon={<Users />}
  onClick={() => router.push('/users')}
  badge={null}
/>

<StatCard
  title="미처리 신고"
  value="3건"
  icon={<AlertCircle />}
  onClick={() => router.push('/users/reported')}
  badge={{ color: 'red', label: '긴급' }}
/>
```

### 위젯 리스트 컴포넌트 예시

```typescript
<Card>
  <CardHeader>
    <CardTitle>최근 신고 접수 내역</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      {reports.map((report) => (
        <TableRow
          key={report.id}
          onClick={() => router.push(`/reports/${report.id}`)}
          className="cursor-pointer"
        >
          <TableCell>{report.target}</TableCell>
          <TableCell>{report.reason}</TableCell>
          <TableCell>{report.date}</TableCell>
        </TableRow>
      ))}
    </Table>
  </CardContent>
</Card>
```

