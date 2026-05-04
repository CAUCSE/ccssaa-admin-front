export interface AuthProfileImage {
  profileImageType: string
  profileImageUrl: string
}

export interface AuthSession {
  accessToken: string
  name: string
  email: string
  profileImage: AuthProfileImage | null
  onboardingStatus: string
  academicStatus: string
}

export type LoginResponse = AuthSession
export type RefreshResponse = AuthSession
