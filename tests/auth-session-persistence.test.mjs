import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8")

const [authTypes, authStorage, authApi, mockAuth, authLayout, loginPage] =
  await Promise.all([
    readSource("types/auth.ts"),
    readSource("lib/auth.ts"),
    readSource("lib/api/auth.ts"),
    readSource("lib/mock/auth.ts"),
    readSource("components/layout/AuthLayout.tsx"),
    readSource("app/login/page.tsx"),
  ])

assert.match(
  authTypes,
  /export interface AuthSession \{[\s\S]*refreshToken: string/
)
assert.match(
  authStorage,
  /const AUTH_SESSION_KEY = "ccssaaAdminSession"/
)
assert.doesNotMatch(authStorage, /const ACCESS_TOKEN_KEY/)
assert.doesNotMatch(authStorage, /const REFRESH_TOKEN_KEY/)
assert.doesNotMatch(authStorage, /const REMEMBER_ME_KEY/)
assert.match(
  authStorage,
  /storage\.setItem\(AUTH_SESSION_KEY, JSON\.stringify\(session\)\)/
)
assert.match(
  authStorage,
  /other\.removeItem\(AUTH_SESSION_KEY\)/
)
assert.match(mockAuth, /refreshToken: mockToken\(\)/)

assert.match(authApi, /const refreshToken = getRefreshToken\(\)/)
assert.match(
  authApi,
  /"Refresh-Authorization": `Bearer \$\{refreshToken\}`/
)
assert.match(authApi, /setAuthSession\(adminSession, rememberMe\)/)
assert.doesNotMatch(authApi, /setRememberMe/)
assert.doesNotMatch(
  authApi,
  /refresh:[\s\S]*?Authorization: `Bearer \$\{accessToken\}`[\s\S]*?return unwrapV2/
)

assert.match(
  authStorage,
  /export const isAccessTokenValid = \(\): boolean =>/
)
assert.match(authLayout, /await refreshTokens\(\)/)
assert.doesNotMatch(loginPage, /getRememberMe/)
assert.ok(
  loginPage.includes(
    "await login({ email: email.trim(), password }, rememberMe)"
  )
)
