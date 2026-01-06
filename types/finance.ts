export type PaymentStatus = "PAID" | "PENDING" | "OVERDUE"

export interface FinanceRecord {
  id: number
  userId: number
  userName: string
  userStudentNo: string
  amount: number
  status: PaymentStatus
  paidAt?: string
  dueDate: string
  createdAt: string
}

export interface FinanceListParams {
  page?: number
  size?: number
  startDate?: string
  endDate?: string
  status?: PaymentStatus
  userId?: number
  keyword?: string
}

export interface FinanceListResponse {
  content: FinanceRecord[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

