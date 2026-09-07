export interface AuthProfileImage {
  profileImageType: string
  profileImageUrl: string
}

export type Role =
  | "SYSTEM_ADMIN"
  | "ADMIN"
  | "PRESIDENT"
  | "VICE_PRESIDENT"
  | "COUNCIL"
  | "LEADER_1"
  | "LEADER_2"
  | "LEADER_3"
  | "LEADER_4"
  | "LEADER_ALUMNI"
  | "ALUMNI_MANAGER"
  | "COMMON"
  | "NONE"
  | "LEADER_CIRCLE"
  | "PROFESSOR"

export interface AuthSession {
  accessToken: string
  refreshToken: string
  name: string
  email: string
  profileImage: AuthProfileImage | null
  onboardingStatus: string
  academicStatus: string
  roles: Role[]
}

export type LoginResponse = AuthSession
export type RefreshResponse = AuthSession
