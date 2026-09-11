import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useApiErrorDialog } from "@/components/ApiErrorDialog"
import {
  createSystemNotice,
  deleteSystemNotice,
  getLatestSystemNotice,
  getSystemNotices,
  markSystemNoticeRead,
  updateSystemNotice,
} from "@/lib/api/v2/system-notices"
import type { SystemNoticeRequest } from "@/types/system-notice"

const systemNoticeKey = ["system-notices", "latest"]
const adminSystemNoticesKey = ["system-notices", "admin"]

export function useLatestSystemNotice() {
  const showError = useApiErrorDialog()
  return useQuery({
    queryKey: systemNoticeKey,
    queryFn: async () => {
      try {
        return await getLatestSystemNotice()
      } catch (error) {
        showError?.(error)
        throw error
      }
    },
  })
}

export function useSystemNotices() {
  const showError = useApiErrorDialog()
  return useQuery({
    queryKey: adminSystemNoticesKey,
    queryFn: async () => {
      try {
        return await getSystemNotices()
      } catch (error) {
        showError?.(error)
        throw error
      }
    },
  })
}

export function useMarkSystemNoticeRead() {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn: markSystemNoticeRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: systemNoticeKey }),
    onError: (error) => showError?.(error),
  })
}

function useSystemNoticeMutation<T>(
  mutationFn: (variables: T) => Promise<unknown>,
  successMessage: string
) {
  const queryClient = useQueryClient()
  const showError = useApiErrorDialog()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemNoticeKey })
      queryClient.invalidateQueries({ queryKey: adminSystemNoticesKey })
      toast.success(successMessage)
    },
    onError: (error) => showError?.(error),
  })
}

export function useCreateSystemNotice() {
  return useSystemNoticeMutation<SystemNoticeRequest>(createSystemNotice, "시스템 공지가 등록되었습니다.")
}

export function useUpdateSystemNotice() {
  return useSystemNoticeMutation<{ id: string; data: SystemNoticeRequest }>(
    ({ id, data }) => updateSystemNotice(id, data),
    "시스템 공지가 수정되었습니다."
  )
}

export function useDeleteSystemNotice() {
  return useSystemNoticeMutation<string>(deleteSystemNotice, "시스템 공지가 삭제되었습니다.")
}
