# 🎨 시맨틱 컬러 및 상태 뱃지 시스템

## 시맨틱 컬러 및 상태 뱃지 (Color & Badge)

| **상태 (Status Type)** | **의미 (Semantics)** | **색상 (Color)** | **매핑 상태값 (Enum)** |
| --- | --- | --- | --- |
| **Info / Primary** | 주요 액션, 브랜드 | **🔵 Blue** (Brand) | - |
| **Success** | 성공, 승인, 정상 | **🟢 Green** | `ACTIVE`, `APPROVED`, `RESOLVED`, `PUBLIC` |
| **Warning** | 대기, 미처리, 주의 | **🟠 Orange** | `PENDING`, `UNRESOLVED` |
| **Danger** | 위험, 거부, 삭제 | **🔴 Red** | `REJECTED`, `BANNED`, `DELETED` |
| **Neutral** | 비활성, 숨김, 취소 | **⚪ Gray** | `WITHDRAWN`, `HIDDEN`, `DISMISSED`, `OCCUPIED` |
| **Available** | 사용 가능, 정상 | **🟢 Green** | `AVAILABLE` |

---

## 사용 예시

### 상태별 뱃지 매핑

```typescript
// 사용 예시
const statusBadgeMap = {
  ACTIVE: { color: 'green', label: '활동' },
  APPROVED: { color: 'green', label: '승인' },
  RESOLVED: { color: 'green', label: '완료' },
  PUBLIC: { color: 'green', label: '공개' },
  PENDING: { color: 'orange', label: '대기' },
  UNRESOLVED: { color: 'orange', label: '미처리' },
  REJECTED: { color: 'red', label: '거부' },
  BANNED: { color: 'red', label: '추방' },
  DELETED: { color: 'red', label: '삭제' },
  WITHDRAWN: { color: 'gray', label: '탈퇴' },
  HIDDEN: { color: 'gray', label: '숨김' },
  DISMISSED: { color: 'gray', label: '취소' },
  OCCUPIED: { color: 'gray', label: '사용중' },
  AVAILABLE: { color: 'green', label: '사용가능' },
}
```

---

## 캘린더 스코프 및 액션 타입 뱃지

| **타입** | **의미** | **색상** | **값** |
| --- | --- | --- | --- |
| **Scope - ALL** | 전체 노출 | **🔵 Blue** | `ALL` |
| **Scope - STUDENT** | 재학생 전용 | **🟢 Green** | `STUDENT` |
| **Scope - ALUMNI** | 졸업생 전용 | **🟠 Orange** | `ALUMNI` |
| **Action - Notice** | 일반 알림 | **⚪ Gray** | `Notice` |
| **Action - Service** | 서비스 연결 | **🔵 Blue** | `Service` |
| **Action - Link** | 외부 링크 | **🟣 Purple** | `Link` |

## 구현 가이드

- 모든 상태 뱃지는 위 표의 색상 규칙을 따라야 함
- shadcn/ui의 Badge 컴포넌트를 활용
- 상태값은 Enum으로 관리하여 타입 안정성 확보
- 사물함 상태: `AVAILABLE`(Green), `OCCUPIED`(Gray)
- 캘린더 스코프: `ALL`(Blue), `STUDENT`(Green), `ALUMNI`(Orange)
- 캘린더 액션 타입: `Notice`(Gray), `Service`(Blue), `Link`(Purple)

