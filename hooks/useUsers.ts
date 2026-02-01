import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi } from "@/lib/api/users"
import { getAdminUsersV2 } from "@/lib/api/v2/users"
import type {
  AdminUsersSearchParamsV2,
  UserListParams,
} from "@/types/user"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"

// 회원 리스트 조회 (v1)
export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => userApi.getUsers(params),
  })
}

// v2 관리자 유저 검색 — GET /api/v2/admin/users (관리자 지정 모달용)
export function useAdminUsersV2(params: AdminUsersSearchParamsV2 | undefined) {
  return useQuery({
    queryKey: ["admin-users-v2", params],
    queryFn: () => getAdminUsersV2(params),
    enabled: params != null,
  })
}

// 회원 상세 조회
export function useUserDetail(userId: number) {
  return useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => userApi.getUserDetail(userId),
    enabled: !!userId,
  })
}

// 회원 승인
export function useApproveUser() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: userApi.approveUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      toast.success("회원 승인이 완료되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 회원 거부
export function useRejectUser() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: userApi.rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("회원 거부가 완료되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 회원 추방
export function useBanUser() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: userApi.banUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      toast.success("회원 추방이 완료되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 역할 변경
export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: "USER" | "ADMIN" | "MASTER" }) =>
      userApi.updateUserRole(userId, role),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      toast.success("역할이 변경되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

