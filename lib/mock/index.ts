const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

/**
 * Mock/Real API 분기 유틸.
 * 각 API 모듈에서 반복되는 USE_MOCK_API 체크를 한 곳에서 처리합니다.
 *
 * @example
 * export const userApi = withMock(realUserApi, mockUserApi)
 */
export function withMock<T>(realApi: T, mockApi: T): T {
  return USE_MOCK_API ? mockApi : realApi
}
