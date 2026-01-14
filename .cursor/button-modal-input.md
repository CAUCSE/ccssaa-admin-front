# 🔘 버튼, 모달, 입력 필드 시스템

## 1. 버튼 시스템 (Button System)

| **레벨 (Hierarchy)** | **스타일 (Style)** | **사용 원칙 (Usage Rule)** | **예시** |
| --- | --- | --- | --- |
| **Primary** | **Solid Blue** (채워진 파랑) | 화면 내 **가장 중요한 1~2개 액션**에만 사용 | `[저장]`, `[등록]`, `[검색]` |
| **Secondary** | **Outline Gray** (회색 테두리) | Primary를 보조하거나, 취소/이동 액션에 사용 (다수 허용) | `[취소]`, `[목록]`, `[초기화]` |
| **Destructive** | **Solid Red** (채워진 빨강) | 데이터 삭제, 회원 차단 등 **위험한 액션**에만 제한적 사용 | `[삭제]`, `[추방]`, `[거부]` |
| **Ghost** | **Text Only** (배경 없음) | 단순 링크 이동, 아이콘 버튼, 닫기 버튼 | `상세보기 >`, `[x]` |

---

## 2. 모달 표준 (Modal Standard)

| **유형 (Type)** | **권장 너비 (Width)** | **구성 요소 및 특징** | **사용처 예시** |
| --- | --- | --- | --- |
| **Alert / Confirm** | **Small** (400px) | 타이틀 + 메시지 + 버튼(2개). 단순 확인용. | 삭제 재확인, 승인 확인 |
| **Form Modal** | **Medium** (600px) | 타이틀 + **입력 폼(Input)** + 버튼. 스크롤 발생 가능. | 거부 사유 입력, 역할 생성 |
| **List Modal** | **Large** (800px~) | 타이틀 + **데이터 테이블/검색** + 닫기 버튼. | 소속 유저 조회, 이력 조회 |

---

## 3. 입력 필드 상태 (Input States)

- **Default:** `Border: Gray-300` / `Background: White`
- **Focus:** `Border: Blue-500` (Brand Color) / `Ring: Blue-100` (Glow 효과)
- **Error:** `Border: Red-500` / `Message: Red-500` (하단 에러 문구 필수)
- **Disabled:** `Border: Gray-200` / `Background: Gray-100` / `Cursor: Not-allowed`

---

## 구현 가이드

### 버튼 사용 예시

```typescript
// Primary - 가장 중요한 액션
<Button variant="default">저장</Button>

// Secondary - 보조 액션
<Button variant="outline">취소</Button>

// Destructive - 위험한 액션
<Button variant="destructive">삭제</Button>

// Ghost - 단순 링크
<Button variant="ghost">상세보기 →</Button>
```

### 모달 사용 예시

```typescript
// Alert / Confirm Modal
<Dialog>
  <DialogContent className="max-w-[400px]">
    <DialogHeader>
      <DialogTitle>삭제 확인</DialogTitle>
      <DialogDescription>정말 삭제하시겠습니까?</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">취소</Button>
      <Button variant="destructive">삭제</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Form Modal
<Dialog>
  <DialogContent className="max-w-[600px]">
    <DialogHeader>
      <DialogTitle>거부 사유 입력</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Input placeholder="거부 사유를 입력하세요" />
    </div>
    <DialogFooter>
      <Button variant="outline">취소</Button>
      <Button>저장</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// List Modal
<Dialog>
  <DialogContent className="max-w-[800px]">
    <DialogHeader>
      <DialogTitle>소속 유저 조회</DialogTitle>
    </DialogHeader>
    <DataTable data={users} columns={columns} />
  </DialogContent>
</Dialog>

// 사물함 수동 배정 모달 (Form Modal)
<Dialog>
  <DialogContent className="max-w-[600px]">
    <DialogHeader>
      <DialogTitle>사물함 수동 배정</DialogTitle>
      <DialogDescription>특정 유저를 선택한 사물함에 배정합니다.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>사물함 번호</Label>
        <Input value="101" disabled />
      </div>
      <div>
        <Label>유저 선택</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="유저를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {/* 유저 목록 */}
          </SelectContent>
        </Select>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline">취소</Button>
      <Button>배정</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// 캘린더 일정 등록 모달 (Form Modal)
<Dialog>
  <DialogContent className="max-w-[600px]">
    <DialogHeader>
      <DialogTitle>일정 등록</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>일정명 *</Label>
        <Input placeholder="일정명을 입력하세요" />
      </div>
      <div>
        <Label>날짜/시간 *</Label>
        <Input type="datetime-local" />
      </div>
      <div>
        <Label>설명</Label>
        <Textarea placeholder="일정 설명을 입력하세요" />
      </div>
      <div>
        <Label>노출 범위 *</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="노출 범위를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            <SelectItem value="STUDENT">재학생</SelectItem>
            <SelectItem value="ALUMNI">졸업생</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>액션 타입 *</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="액션 타입을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Notice">일반 알림</SelectItem>
            <SelectItem value="Service">서비스 연결</SelectItem>
            <SelectItem value="Link">외부 링크</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="notification" />
        <Label htmlFor="notification">알림 설정 (일정 시작 전 알림 발송)</Label>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline">취소</Button>
      <Button>저장</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 입력 필드 상태 예시

```typescript
// Default
<Input placeholder="검색어를 입력하세요" />

// Error
<div>
  <Input className="border-red-500" />
  <p className="text-sm text-red-500 mt-1">에러 메시지</p>
</div>

// Disabled
<Input disabled placeholder="비활성화된 입력" />
```

