# v2 API 공통 응답 처리

## 개요

v2 백엔드는 `ApiResponse<T>` 형태로 응답하며, `@JsonInclude(JsonInclude.Include.NON_NULL)`로 null 필드는 생략됩니다.  
프론트에서는 **래퍼 함수 `unwrapV2`**로 이 공통 포맷을 풀어서 `data`만 사용하고, 실패 시 `code`/`message`로 에러를 던지도록 합니다.

## 백엔드 응답 형식

```java
public class ApiResponse<T> {
  private String code;    // 예: "S000"
  private String message; // 예: "요청 처리 성공"
  private T data;

  public static <T> ApiResponse<T> success(T data) {
    return new ApiResponse<>(ResponseCode.SUCCESS.getCode(), ... , data);
  }
}
```

- 성공 코드: `S000`
- NON_NULL 이므로 `code`, `message`, `data` 중 null이면 JSON에 포함되지 않음

## 프론트 구조

### 1. 타입 (`types/api-v2.ts`)

```ts
export interface ApiResponse<T> {
  code?: string
  message?: string
  data?: T
}

export const V2_SUCCESS_CODE = "S000"
```

필드는 전부 optional — 응답에 생략될 수 있음.

### 2. 언래핑 함수 (`lib/api/v2/response.ts`)

```ts
export function unwrapV2<T>(res: AxiosResponse<ApiResponse<T> | T>): T
```

- `response.data`가 `ApiResponse<T>`면:
  - `code`가 있고 `!== V2_SUCCESS_CODE` → `Error(message ?? "API Error (code)")` throw
  - `data`가 있으면 `data` 반환
- `data` 필드 없이 payload만 오면 body 전체를 `T`로 반환 (NON_NULL 대응)

### 3. v2 API 함수에서 사용

모든 v2 호출은 `apiV2`로 요청한 뒤 `unwrapV2(res)`로 한 번 감싸서 사용합니다.

```ts
import { apiV2 } from "./client"
import { unwrapV2 } from "./response"
import type { ApiResponse } from "@/types/api-v2"

// GET — 리스트
const res = await apiV2.get<ApiResponse<BoardListItemV2[]>>("/admin/boards")
const list = unwrapV2(res)

// POST / PUT / PATCH
const res = await apiV2.post<ApiResponse<unknown>>("/admin/boards", body)
return unwrapV2(res)
```

- 반환 타입은 **항상 payload 타입 `T`** (ApiResponse 아님).
- 에러는 `unwrapV2` 내부에서 `code !== S000`일 때 throw.

## 파일 위치

| 역할           | 경로                    |
|----------------|-------------------------|
| 공통 타입      | `types/api-v2.ts`       |
| 언래핑 래퍼    | `lib/api/v2/response.ts`|
| v2 axios 인스턴스 | `lib/api/v2/client.ts` |
| 도메인 API 예시 | `lib/api/v2/boards.ts`  |

## 새 v2 엔드포인트 추가 시

1. `apiV2.get|post|put|patch|delete<ApiResponse<Payload타입>>(...)` 로 요청
2. `unwrapV2(res)` 로 감싼 값을 반환
3. Mock 사용 시에는 Mock 쪽은 그대로 payload만 반환해도 됨 (unwrapV2가 그대로 통과)

## 에러 처리

- HTTP 4xx/5xx: axios가 그대로 reject (기존과 동일).
- 2xx이지만 body에 `code !== "S000"`: `unwrapV2`가 `Error(message)` throw.
- 이 에러는 호출하는 쪽(React Query 등)에서 catch해서 토스트/폼 에러로 표시하면 됨.
