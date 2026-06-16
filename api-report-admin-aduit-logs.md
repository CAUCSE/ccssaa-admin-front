PI Frontend Implementation Report

## Scope

- Endpoint:
  - `GET /api/v2/admin/audit-logs`
- Purpose:
  - 관리자 페이지에서 관리자 활동 감사 로그를 기간, 카테고리, 액션 타입, 키워드 조건으로 조회하고 페이지네이션 목록/상세 펼침 UI를 구현한다.

## Summary

이 API는 관리자가 수행한 주요 운영 활동 로그를 최신순 페이지 목록으로 조회한다. 현재 확인된 카테고리는 `USER`, `LOCKER`, `ACADEMIC`이며, 사용자 관리, 사물함 관리, 재학/학적 승인 관련 액션을 필터링할 수 있다. 각 로그는 수행자/대상 스냅샷, 요약 문구, 액션별 `metadata`를 포함하므로 목록 테이블과 행 상세 영역을 함께 구성할 수 있다.

## Authentication And Authorization

- Authentication: required
- Principal: 요청 메서드에서 `CustomUserDetails`를 직접 받지는 않는다.
- Authorization rule: `ADMIN` 권한 필요
- Failure handling:
  - 미인증 사용자는 접근할 수 없다.
  - 인증되었지만 `ADMIN` 권한이 없으면 접근할 수 없다.
  - 권한 실패 응답 body는 공통 Spring Security/예외 처리 설정의 영향을 받는다.

## Endpoint Contract

### `GET /api/v2/admin/audit-logs`

#### Request

| Location | Name | Type | Required | Rule | Description |
| :--- | :--- | :--- | :---: | :--- | :--- |
| query | `from` | `LocalDateTime` string | N | 예: `2026-06-13T00:00:00` | `createdAt` 포함 하한 |
| query | `to` | `LocalDateTime` string | N | 예: `2026-06-13T23:59:59` | `createdAt` 포함 상한 |
| query | `category` | `string` | N | `USER`, `LOCKER`, `ACADEMIC` | 감사 로그 카테고리 |
| query | `actionType` | `string` | N | trim 후 uppercase 정규화. 카테고리별 허용값만 가능 | 액션 타입 필터 |
| query | `keyword` | `string` | N | blank는 필터 없음 처리 | 수행자 또는 대상자의 이메일, 이름, 학번 검색 |
| query | `page` | `number` | N | default: `0` | 페이지 번호, 0부터 시작 |
| query | `size` | `number` | N | default: `10` | 페이지 크기 |
| query | `sort` | `string` | N | 추론: 현재 서버 쿼리는 `createdAt DESC`를 고정 적용 | Spring Pageable 파라미터이나 정렬 제어는 기대하지 않는 편이 안전 |

Example:

```http
GET /api/v2/admin/audit-logs?category=LOCKER&actionType=ASSIGN&keyword=admin%40causw.net&page=0&size=10
```

#### Response

- Wrapper: `ApiResponse<PageResponse<AdminAuditLogResponse>>`
- Page base: 0-based
- Sort default: `createdAt DESC`

```json
{
  "code": "S000",
  "message": "요청 처리 성공",
  "data": {
    "content": [
      {
        "id": "11112222-aaaa-3333-bbbb-446655440000",
        "category": "LOCKER",
        "actionType": "ASSIGN",
        "actionDescription": "사물함 배정",
        "actor": {
          "userId": "admin-user-id",
          "email": "admin@causw.net",
          "name": "관리자",
          "studentId": "20190001"
        },
        "target": {
          "type": "LOCKER",
          "id": "locker-id",
          "email": "user@causw.net",
          "name": "홍길동",
          "studentId": "20201234"
        },
        "summary": "310관-12 사물함을 홍길동에게 배정했습니다.",
        "metadata": {
          "lockerId": "locker-id",
          "lockerNumber": 12,
          "lockerLocationName": "310관",
          "expireDate": "2026-12-31T23:59:59",
          "expiredAt": "2026-12-31T23:59:59"
        },
        "createdAt": "2026-06-13T10:30:00"
      }
    ],
    "currentPage": 0,
    "size": 10,
    "totalPages": 1,
    "totalElements": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Fields

| Field | Type | Nullable | Description | Frontend Note |
| :--- | :--- | :---: | :--- | :--- |
| `code` | `string` | N | 공통 응답 코드 | 성공 시 `S000` |
| `message` | `string` | N | 공통 응답 메시지 | 성공 시 `요청 처리 성공` |
| `data.content[]` | `AdminAuditLogResponse[]` | N | 감사 로그 목록 | 빈 결과는 빈 배열 |
| `data.currentPage` | `number` | N | 현재 페이지 번호 | 0부터 시작 |
| `data.size` | `number` | N | 페이지 크기 | 요청 `size` 기준 |
| `data.totalPages` | `number` | N | 전체 페이지 수 | 페이지 UI에 사용 |
| `data.totalElements` | `number` | N | 전체 요소 수 | 전체 건수 표시에 사용 |
| `data.hasNext` | `boolean` | N | 다음 페이지 존재 여부 | 다음 버튼 활성화 |
| `data.hasPrev` | `boolean` | N | 이전 페이지 존재 여부 | 이전 버튼 활성화 |
| `content[].id` | `string` | N | 감사 로그 ID | row key로 사용 가능 |
| `content[].category` | `string` | N | 감사 로그 카테고리 | 배지/필터 분기 |
| `content[].actionType` | `string` | N | 액션 타입 | 필터/배지/상세 분기에 사용 |
| `content[].actionDescription` | `string` | N | 액션 타입 표시명 | UI label로 사용 가능 |
| `content[].actor` | `AuditActorResponse` | N | 수행자 스냅샷 | 현재 사용자 정보가 아니라 로그 발생 시점 정보 |
| `content[].target` | `AuditTargetResponse` | N | 대상 스냅샷 | 대상 타입은 `USER` 또는 `LOCKER` |
| `content[].summary` | `string` | N | 요약 문구 | 목록 보조 문구 또는 상세 헤더 |
| `content[].metadata` | `object` | N | 카테고리별 상세 변경 정보 | 빈 JSON이면 `{}` |
| `content[].createdAt` | `LocalDateTime` string | N | 로그 생성 시각 | 표시 timezone 정책은 FE에서 결정 |
| `actor.userId` | `string` | N | 수행자 사용자 ID |  |
| `actor.email` | `string` | N | 수행자 이메일 스냅샷 |  |
| `actor.name` | `string` | Y | 수행자 이름 스냅샷 | 백필/과거 데이터에서 없을 수 있음 |
| `actor.studentId` | `string` | Y | 수행자 학번 스냅샷 | 학번 없는 사용자 가능 |
| `target.type` | `string` | N | 대상 타입 | `USER`, `LOCKER` |
| `target.id` | `string` | N | 대상 ID | `target.type`에 따라 userId 또는 lockerId |
| `target.email` | `string` | Y | 대상 사용자 이메일 스냅샷 | 사물함 활성화처럼 대상 사용자가 없는 액션은 null 가능 |
| `target.name` | `string` | Y | 대상 사용자 이름 스냅샷 | null 가능 |
| `target.studentId` | `string` | Y | 대상 사용자 학번 스냅샷 | null 가능 |

## Enums And Constants

| Name | Values | Frontend Use |
| :--- | :--- | :--- |
| `AdminAuditLogCategory` | `USER`, `LOCKER`, `ACADEMIC` | 카테고리 필터, 섹션/배지 분기 |
| `USER actionType` | `DROP`, `RESTORE`, `ROLE_CHANGE` | 사용자 추방/복구/권한 변경 필터와 상세 분기 |
| `LOCKER actionType` | `ASSIGN`, `EXTEND`, `RELEASE`, `ENABLE`, `DISABLE`, `RELEASE_EXPIRED` | 사물함 관리 필터와 상세 분기 |
| `ACADEMIC actionType` | `ADMISSION_ACCEPT`, `ADMISSION_REJECT`, `ACADEMIC_RECORD_ACCEPT`, `ACADEMIC_RECORD_REJECT` | 재학인증/학적변경 승인·거절 필터와 상세 분기 |
| `target.type` | `USER`, `LOCKER` | 대상 링크 이동/표시 분기 |

## Metadata Guide

`metadata`는 액션별 상세 정보이며 `Map<String, Object>`로 내려온다. 키가 없거나 값이 null일 수 있으므로 필수 표시 항목처럼 다루지 않는 것이 안전하다.

| Category | Action Type | Metadata Keys | Frontend Note |
| :--- | :--- | :--- | :--- |
| `USER` | `DROP`, `RESTORE`, `ROLE_CHANGE` | `beforeState`, `afterState`, `beforeRoles`, `afterRoles`, `reason` | 상태/권한 변경 전후와 사유 표시. `reason`은 null 가능 |
| `LOCKER` | `ASSIGN`, `EXTEND` | `lockerId`, `lockerNumber`, `lockerLocationName`, `expireDate`, `expiredAt` | `expiredAt`은 요청으로 지정된 새 만료 시각이 있을 때 포함 |
| `LOCKER` | `RELEASE`, `ENABLE`, `RELEASE_EXPIRED` | `lockerId`, `lockerNumber`, `lockerLocationName`, `expireDate` | 대상 사용자가 없으면 `target.email/name/studentId`도 null 가능 |
| `LOCKER` | `DISABLE` | `lockerId`, `lockerNumber`, `lockerLocationName`, `expireDate`, `releasedUserId` | 비활성화 중 회수된 사용자가 있으면 `releasedUserId` 포함 |
| `ACADEMIC` | `ADMISSION_ACCEPT`, `ADMISSION_REJECT` | `admissionId`, `requestedAcademicStatus`, `requestedStudentId`, `requestedAdmissionYear`, `requestedDepartment`, `requestedGraduationYear`, `rejectReason` | 거절 액션은 `rejectReason` 포함 가능 |
| `ACADEMIC` | `ACADEMIC_RECORD_ACCEPT`, `ACADEMIC_RECORD_REJECT` | `applicationId`, `beforeAcademicStatus`, `targetAcademicStatus`, `note`, `rejectReason` | 반려 액션은 `rejectReason` 포함 가능 |

## Business Rules

- `from`과 `to`가 모두 있으면 `from`은 `to`보다 늦을 수 없다.
- `from`, `to` 필터는 `createdAt`에 대해 양끝 포함 조건으로 적용된다.
- `keyword`가 blank이면 서버는 키워드 필터를 적용하지 않는다.
- `actionType`이 blank이면 서버는 액션 타입 필터를 적용하지 않는다.
- `actionType`은 서버에서 trim 후 uppercase로 정규화한다.
- `category`가 지정되면 해당 카테고리의 허용 `actionType`만 사용할 수 있다.
- `category` 없이 `actionType`만 지정하면 전체 카테고리의 허용 액션 타입 중 하나인지 검사한 뒤 필터링한다.
- 지원하지 않는 `actionType` 또는 카테고리와 맞지 않는 `actionType`은 bad request로 처리된다.
- 조회 정렬은 `createdAt DESC` 최신순이다.
- keyword 검색 대상은 수행자/대상자의 이메일, 이름, 학번이다.

## Error Handling

| Error Code | HTTP Status | Cause | Frontend Handling |
| :--- | :---: | :--- | :--- |
| `G40001` | 400 | `from > to`, 지원하지 않는 `actionType`, 카테고리와 맞지 않는 `actionType` | 필터 입력값을 수정하도록 안내 |
| `G40101` 또는 공통 인증 에러 | 401 | 미인증 요청 | 로그인 화면 또는 세션 만료 처리 |
| `G40301` 또는 공통 권한 에러 | 403 | `ADMIN` 권한 없음 | 접근 권한 없음 화면 또는 토스트 처리 |
| `G50001` | 500 | 저장된 metadata JSON 파싱 실패 등 서버 내부 오류 | 재시도 안내, 지속 시 관리자 문의 |

## Side Effects And Refresh Strategy

- Mutates: 없음. 조회 전용 API이다.
- Related data to refetch: 관리자 감사 로그 목록 query.
- File/image effects: 없음.
- Cache invalidation hint:
  - 조회 조건 조합을 query key에 포함한다.
  - 예: `["adminAuditLogs", { from, to, category, actionType, keyword, page, size }]`
  - 사용자 관리, 사물함 관리, 재학/학적 승인·거절 mutation 성공 후 이 목록을 invalidate하면 신규 로그 반영이 자연스럽다.

## Frontend Implementation Checklist

- [ ] `GET /api/v2/admin/audit-logs` API client 메서드 추가
- [ ] 응답 목록은 `data.content`에서 추출
- [ ] `page`는 0-base로 전달
- [ ] 기본 `size=10` 적용 또는 UI 기본값과 동기화
- [ ] 기간 필터에서 `from <= to` 사전 검증
- [ ] 카테고리 선택에 따라 허용 `actionType` 옵션을 변경
- [ ] `actionType`은 서버가 uppercase 정규화하지만, FE 옵션 값은 uppercase로 관리
- [ ] 빈 목록, 로딩, 400 필터 오류, 401/403 권한 오류 상태 처리
- [ ] `metadata` 키와 값 null 가능성을 고려해 상세 UI 렌더링
- [ ] actor/target의 `name`, `studentId`, `target.email` null 가능성을 고려
- [ ] 관련 관리자 mutation 후 감사 로그 목록 cache invalidation

## Open Questions

- `sort` query parameter를 프론트에서 제공해야 하는지 확인 필요. 현재 구현은 `createdAt DESC`를 고정 적용한다.
- 권한 실패 시 실제 응답 body의 `code` 값은 인증 필터/메서드 보안 처리 경로에 따라 달라질 수 있어 통합 환경에서 확인이 필요하다.

