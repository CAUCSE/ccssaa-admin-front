/** v1 로그인 응답: POST /api/v1/users/sign-in */
export interface SignInResponse {
  accessToken: string
  refreshToken: string
}

/** v1 본인 조회 응답: GET /api/v1/users/me */
export interface MeResponse {
  id: string
  email: string
  name: string
  studentId: string
  admissionYear: number
  roles: string[]
  profileImageUrl: string | null
  state: string
  circleIdIfLeader: string | null
  circleNameIfLeader: string | null
  nickname: string
  major: string
  department: string | null
  academicStatus: string
  currentCompletedSemester: number | null
  graduationYear: number | null
  graduationType: string | null
  phoneNumber: string
  rejectionOrDropReason: string | null
  createdAt: string
  updatedAt: string
  isV2: boolean
}
