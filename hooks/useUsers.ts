import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi } from "@/lib/api/users"
import type { UserListParams } from "@/types/user"
import { toast } from "sonner"

// 회원 리스트 조회
export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => userApi.getUsers(params),
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

  return useMutation({
    mutationFn: userApi.approveUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      toast.success("회원 승인이 완료되었습니다.")
    },
    onError: () => {
      toast.error("회원 승인에 실패했습니다.")
    },
  })
}

// 회원 거부
export function useRejectUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("회원 거부가 완료되었습니다.")
    },
    onError: () => {
      toast.error("회원 거부에 실패했습니다.")
    },
  })
}

// 회원 추방
export function useBanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.banUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      toast.success("회원 추방이 완료되었습니다.")
    },
    onError: () => {
      toast.error("회원 추방에 실패했습니다.")
    },
  })
}

// 역할 변경
export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: "USER" | "ADMIN" | "MASTER" }) =>
      userApi.updateUserRole(userId, role),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      toast.success("역할이 변경되었습니다.")
    },
    onError: () => {
      toast.error("역할 변경에 실패했습니다.")
    },
  })
}

