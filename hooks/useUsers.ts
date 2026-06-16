import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi } from "@/lib/api/users"
import { getAdminUsersV2 } from "@/lib/api/v2/users"
import type {
  AdminUsersSearchParamsV2,
  DeletedUserListParams,
  UserListParams,
  UserDetail,
  UserRole,
} from "@/types/user"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"
import { ADMIN_AUDIT_LOGS_QUERY_KEY } from "@/hooks/useAdminAuditLogs"

// 회원 리스트 조회
export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => userApi.getUsers(params),
  })
}

export function useDeletedUsers(params: DeletedUserListParams) {
  return useQuery({
    queryKey: ["deleted-users", params],
    queryFn: () => userApi.getDeletedUsers(params),
  })
}

// v2 관리자 유저 검색 — GET /api/v2/admin/users/search (관리자 지정 모달용)
export function useAdminUsersV2(params: AdminUsersSearchParamsV2 | undefined) {
  return useQuery({
    queryKey: ["admin-users-search", params],
    queryFn: () => getAdminUsersV2(params),
    enabled: params != null,
  })
}

// 회원 상세 조회
export function useUserDetail(userId: string) {
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
      queryClient.invalidateQueries({ queryKey: ["admin-users-search"] })
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
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin-users-search"] })
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
    onSuccess: (data, variables) => {
      queryClient.setQueryData<UserDetail>(
        ["admin-user", variables.userId],
        (prev) =>
          prev
            ? {
                ...prev,
                state: data.state,
                roles: data.roles,
                rejectionOrDropReason: data.dropReason,
              }
            : prev
      )
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-users-search"] })
      queryClient.invalidateQueries({ queryKey: ["deleted-users"] })
      queryClient.invalidateQueries({ queryKey: ["reported-users"] })
      queryClient.invalidateQueries({ queryKey: [ADMIN_AUDIT_LOGS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: ["reported-user-posts", variables.userId],
      })
      queryClient.invalidateQueries({
        queryKey: ["reported-user-comments", variables.userId],
      })
      toast.success("회원 추방이 완료되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}

// 추방 사용자 복구
export function useRestoreUser() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()

  return useMutation({
    mutationFn: userApi.restoreUser,
    onSuccess: (data, userId) => {
      queryClient.setQueryData<UserDetail>(
        ["admin-user", userId],
        (prev) =>
          prev
            ? {
                ...prev,
                state: data.state,
                roles: data.roles,
                rejectionOrDropReason: null,
              }
            : prev
      )
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-users-search"] })
      queryClient.invalidateQueries({ queryKey: ["deleted-users"] })
      queryClient.invalidateQueries({ queryKey: [ADMIN_AUDIT_LOGS_QUERY_KEY] })
      toast.success("복구가 완료되었습니다.")
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
    mutationFn: ({
      userId,
      currentRole,
      newRole,
    }: {
      userId: string
      currentRole: UserRole
      newRole: UserRole
    }) => userApi.updateUserRole(userId, currentRole, newRole),
    onSuccess: (data, { userId }) => {
      queryClient.setQueryData<UserDetail>(
        ["admin-user", userId],
        (prev) =>
          prev
            ? {
                ...prev,
                roles: data.roles,
              }
            : prev
      )
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-users-search"] })
      queryClient.invalidateQueries({ queryKey: [ADMIN_AUDIT_LOGS_QUERY_KEY] })
      toast.success("역할이 변경되었습니다.")
    },
    onError: (error) => {
      showError?.(error)
    },
  })
}
