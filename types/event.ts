export type CeremonyState = "ACCEPT" | "REJECT" | "AWAIT" | "CLOSE"

export interface CeremonyListItem {
  id: string
  applicantName: string
  applicantStudentId: string
  state: CeremonyState
  startDate: string
  createdAt: string
  category: string
}

export interface CeremonyDetail {
  id: string
  title: string
  type: string
  category: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  applicant: string
  subject: string
  content: string
  attachedImageUrlList: string[]
  address: string
  postalAddress: string
  detailedAddress: string
  contact: string
  link: string
  isSetAll: boolean
  targetAdmissionYears: number[]
  state: CeremonyState
  note?: string
}

export interface EventListParams {
  page?: number
  size?: number
  fromDate?: string
  toDate?: string
  state?: CeremonyState
}

export interface EventListResponse {
  content: CeremonyListItem[]
  currentPage: number
  size: number
  totalPages: number
  totalElements: number
  hasNext: boolean
  hasPrev: boolean
}

