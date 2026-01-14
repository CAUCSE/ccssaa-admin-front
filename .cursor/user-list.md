아래 문서는 **Cursor에 그대로 전달해서 구현 기준으로 쓰는**

📄 **회원 관리(User Management) 상세 스펙 문서 (Markdown)** 입니다.

---

# **👤 User Management Specification**

  

> 관리자 페이지의 회원 관리 기능 정의 문서

> 대상 화면:

- > ADM-USER-LIST (회원 리스트)
    
- > ADM-USER-DETAIL (회원 상세)
    

  

API Prefix: /api/v1

---

# **1. 📌 개요**

  

회원 관리 기능은 다음을 목표로 한다.

- 전체 회원 조회 및 검색
    
- 가입 승인 처리
    
- 회원 상태 관리 (활동 / 추방)
    
- 회원 상세 정보 확인
    
- 관리자 권한 기반 액션 제어
    

---

# **2. 🖥 화면 구성**

  

## **2.1. 회원 리스트 화면 (ADM-USER-LIST)**

  

### **✅ 목적**

- 조건 기반 회원 검색
    
- 상태별 회원 관리
    
- 상세 화면 진입
    

---

## **2.2. 회원 상세 화면 (ADM-USER-DETAIL)**

  

### **✅ 목적**

- 회원 정보 조회
    
- 역할(Role) 관리
    
- 승인 / 추방 등 상태 변경
    

---

# **3. 🔍 ADM-USER-LIST (리스트 화면)**

  

## **3.1. 검색 영역 (Search Filter)**

  

### **필터 조건**

|**필드**|**타입**|**설명**|
|---|---|---|
|학번/이름|Input|학번 또는 이름 부분 검색|
|학과|Select|학과 필터|
|상태|Select|전체 / 대기 / 활동 / 추방|

### **UI 요구**

- 상단 Filter Bar 형태
    
- 검색 시 table refetch
    
- Enter 또는 [검색] 버튼 지원
    
- 초기값: 전체
    

---

## **3.2. 테이블 영역 (Data Table)**

  

### **Columns**

|**No**|**컬럼**|**정렬**|**정렬**|**비고**|
|---|---|---|---|---|
|1|No|Center|❌|페이지 기준 번호|
|2|학번|Center|✅|20201234|
|3|이름|Left|✅|김철수|
|4|학과|Left|✅|소프트웨어학부|
|5|상태|Center|✅|Badge|
|6|가입일|Center|✅|YYYY.MM.DD|
|7|관리|Center|❌|상세 버튼|

---

### **상태 Badge 정책**

|**Status**|**Label**|**Color**|
|---|---|---|
|PENDING|대기|yellow / orange|
|ACTIVE|활동|green / blue|
|BANNED|추방|red|

---

### **관리 컬럼**

- [상세보기 >] (ghost button)
    
- 클릭 시 /users/{userId} 이동
    

---

## **3.3. 테이블 기능 요구**

- pagination (server-side)
    
- sorting
    
- empty state
    
- loading skeleton
    
- error state
    
- query 기반 필터 유지
    

---

# **4. 👤 ADM-USER-DETAIL (상세 화면)**

  

## **4.1. 상단 정보 영역 (Profile - Read Only)**

  

### **표시 항목**

- 이름
    
- 학번
    
- 학과
    
- 연락처
    
- 이메일
    
- 가입일
    
- 현재 상태 (Badge)
    

---

## **4.2. 역할 관리 영역 (Editable)**

  

### **구성**

- 역할 Select Box
    
- [변경] 버튼
    

  

### **정책**

- 기본은 조회 전용
    
- Master만 수정 가능
    
- 변경 시 PATCH 호출
    

---

## **4.3. 하단 액션 영역 (Footer Actions)**

  

### **상태별 버튼 정책**

  

#### **🟡 PENDING (대기)**

- [거부] (Red)
    
- [승인] (Blue)
    

  

#### **🟢 ACTIVE (활동)**

- [강제 추방] (Red)
    
- Master 권한 필요
    

  

#### **🔴 BANNED (추방)**

- 상태 변경 버튼 없음
    
- Read-only
    

---

### **UX 정책**

- 모든 위험 액션은 confirm modal 필수
    
- 성공 시 toast
    
- 실패 시 error toast
    

---

# **5. 🌐 API 설계**

  

## **5.1. 회원 리스트 조회**

```
GET /api/v1/admin/users
```

### **Query Params**

|**이름**|**타입**|**설명**|
|---|---|---|
|page|number|페이지 번호|
|size|number|페이지 크기|
|keyword|string|학번/이름|
|department|string|학과|
|status|PENDING / ACTIVE / BANNED|상태|

---

## **5.2. 회원 상세 조회**

```
GET /api/v1/admin/users/{userId}
```

---

## **5.3. 회원 승인**

```
POST /api/v1/admin/users/{userId}/approve
```

---

## **5.4. 회원 거부**

```
POST /api/v1/admin/users/{userId}/reject
```

---

## **5.5. 회원 추방**

```
POST /api/v1/admin/users/{userId}/ban
```

---

## **5.6. 역할 변경**

```
PATCH /api/v1/admin/users/{userId}/role
```

```
{
  "role": "ADMIN"
}
```

---

# **6. 🧬 데이터 모델 (Frontend Type)**

  

## **UserSummary**

```
export interface UserSummary {
  id: number
  studentNo: string
  name: string
  department: string
  status: "PENDING" | "ACTIVE" | "BANNED"
  joinedAt: string
}
```

---

## **UserDetail**

```
export interface UserDetail {
  id: number
  studentNo: string
  name: string
  department: string
  phone: string
  email: string
  joinedAt: string
  status: "PENDING" | "ACTIVE" | "BANNED"
  role: "USER" | "ADMIN" | "MASTER"
}
```

---

# **7. ⚙ React Query 설계**

  

## **리스트**

```
useQuery({
  queryKey: ["admin-users", params],
  queryFn: () => getUsers(params)
})
```

---

## **상세**

```
useQuery({
  queryKey: ["admin-user", userId],
  queryFn: () => getUserDetail(userId)
})
```

---

## **액션**

- approve → invalidate admin-users, admin-user
    
- reject → invalidate admin-users
    
- ban → invalidate admin-users, admin-user
    
- role update → invalidate admin-user
    

---

# **8. 🧩 컴포넌트 구조 가이드**

```
users/
  page.tsx                 # 리스트
  [id]/
    page.tsx               # 상세

components/
  user/
    UserFilter.tsx
    UserTable.tsx
    UserProfileCard.tsx
    UserRoleBox.tsx
    UserActionFooter.tsx
```

---

# **9. 🎯 구현 우선순위**

1. ADM-USER-LIST UI + mock
    
2. 필터 + 테이블 연결
    
3. 상세 화면 UI
    
4. 상태별 버튼 분기
    
5. React Query 연동
    
6. confirm modal + toast
    
7. 권한 분기
    

---

# **10. ✅ 품질 기준**

- 상태값 하드코딩 금지
    
- 뷰/로직 분리
    
- 모든 위험 액션 confirm
    
- empty/error/loading UI 필수
    
- API 구조 변경에 대응 가능 구조