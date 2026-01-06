import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsApi } from "@/lib/api/settings"
import type { Role, Permission, Banner, DesignSettings } from "@/types/settings"
import { toast } from "sonner"

// 역할 목록 조회
export function useRoles() {
  return useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => settingsApi.getRoles(),
  })
}

// 역할 생성
export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description: string; permissions: string[] }) =>
      settingsApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      toast.success("역할이 생성되었습니다.")
    },
    onError: () => {
      toast.error("역할 생성에 실패했습니다.")
    },
  })
}

// 역할 수정
export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: number
      data: { name: string; description: string; permissions: string[] }
    }) => settingsApi.updateRole(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      toast.success("역할이 수정되었습니다.")
    },
    onError: () => {
      toast.error("역할 수정에 실패했습니다.")
    },
  })
}

// 역할 삭제
export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roleId: number) => settingsApi.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] })
      toast.success("역할이 삭제되었습니다.")
    },
    onError: () => {
      toast.error("역할 삭제에 실패했습니다.")
    },
  })
}

// 권한 목록 조회
export function usePermissions() {
  return useQuery({
    queryKey: ["admin-permissions"],
    queryFn: () => settingsApi.getPermissions(),
  })
}

// 배너 목록 조회
export function useBanners() {
  return useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => settingsApi.getBanners(),
  })
}

// 배너 생성
export function useCreateBanner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Banner, "id" | "createdAt">) => settingsApi.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] })
      toast.success("배너가 생성되었습니다.")
    },
    onError: () => {
      toast.error("배너 생성에 실패했습니다.")
    },
  })
}

// 배너 수정
export function useUpdateBanner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bannerId, data }: { bannerId: number; data: Partial<Banner> }) =>
      settingsApi.updateBanner(bannerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] })
      toast.success("배너가 수정되었습니다.")
    },
    onError: () => {
      toast.error("배너 수정에 실패했습니다.")
    },
  })
}

// 배너 삭제
export function useDeleteBanner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bannerId: number) => settingsApi.deleteBanner(bannerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] })
      toast.success("배너가 삭제되었습니다.")
    },
    onError: () => {
      toast.error("배너 삭제에 실패했습니다.")
    },
  })
}

// 디자인 설정 조회
export function useDesignSettings() {
  return useQuery({
    queryKey: ["admin-design-settings"],
    queryFn: () => settingsApi.getDesignSettings(),
  })
}

// 디자인 설정 업데이트
export function useUpdateDesignSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<DesignSettings>) => settingsApi.updateDesignSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-design-settings"] })
      toast.success("디자인 설정이 업데이트되었습니다.")
    },
    onError: () => {
      toast.error("디자인 설정 업데이트에 실패했습니다.")
    },
  })
}

