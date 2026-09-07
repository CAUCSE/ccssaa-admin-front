import assert from "node:assert/strict"

const auth = await import("../lib/auth.ts")

assert.equal(typeof auth.hasAdminAccess, "function")
assert.equal(typeof auth.isSystemAdmin, "function")
assert.equal(typeof auth.assertAdminSession, "function")

assert.equal(auth.hasAdminAccess(["ADMIN", "COMMON"]), true)
assert.equal(auth.hasAdminAccess(["SYSTEM_ADMIN"]), true)
assert.equal(auth.hasAdminAccess(["COMMON", "COUNCIL"]), false)
assert.equal(auth.isSystemAdmin(["ADMIN"]), false)
assert.equal(auth.isSystemAdmin(["COMMON", "SYSTEM_ADMIN"]), true)

assert.throws(
  () =>
    auth.assertAdminSession({
      accessToken: "access",
      refreshToken: "refresh",
      name: "일반 사용자",
      email: "user@example.com",
      profileImage: null,
      onboardingStatus: "ACTIVE",
      academicStatus: "ENROLLED",
      roles: ["COMMON"],
    }),
  /관리자 권한이 없습니다\./
)

assert.doesNotThrow(() =>
  auth.assertAdminSession({
    accessToken: "access",
    refreshToken: "refresh",
    name: "관리자",
    email: "admin@example.com",
    profileImage: null,
    onboardingStatus: "ACTIVE",
    academicStatus: "ENROLLED",
    roles: ["ADMIN"],
  })
)
