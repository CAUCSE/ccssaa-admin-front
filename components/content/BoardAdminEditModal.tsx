"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUsers } from "@/hooks/useUsers"
import type { BoardAdminInfo } from "@/types/board-v2"
import type { UserSummary } from "@/types/user"
import { Plus, X } from "lucide-react"

const SEARCH_DEBOUNCE_MS = 300

function adminDisplayLabel(admin: BoardAdminInfo): string {
  if (admin.adminEmail?.trim()) {
    return `${admin.adminName}(${admin.adminEmail})`
  }
  return admin.adminName
}

function userToAdmin(user: UserSummary): BoardAdminInfo {
  return {
    id: String(user.id),
    adminName: user.name,
    adminEmail: "", // UserSummary에는 이메일 없음, 상세 API 연동 시 채울 수 있음
  }
}

function userDisplayLabel(user: UserSummary): string {
  return user.studentNo ? `${user.name} (${user.studentNo})` : user.name
}

interface BoardAdminEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admins: BoardAdminInfo[]
  onApply: (admins: BoardAdminInfo[]) => void
}

export function BoardAdminEditModal({
  open,
  onOpenChange,
  admins,
  onApply,
}: BoardAdminEditModalProps) {
  const [draft, setDraft] = useState<BoardAdminInfo[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")

  useEffect(() => {
    if (!open) return
    setDraft([...admins])
    setSearchKeyword("")
    setDebouncedKeyword("")
  }, [open, admins])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => setDebouncedKeyword(searchKeyword.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchKeyword, open])

  const { data: searchResult } = useUsers({
    keyword: open ? debouncedKeyword || undefined : undefined,
    size: 20,
    status: "ACTIVE",
  })
  const searchUsers = searchResult?.content ?? []
  const draftIds = new Set(draft.map((a) => a.id))
  const addableUsers = searchUsers.filter((u) => !draftIds.has(String(u.id)))

  const handleRemove = (id: string) => {
    setDraft((prev) => prev.filter((a) => a.id !== id))
  }

  const handleAdd = (user: UserSummary) => {
    if (draftIds.has(String(user.id))) return
    setDraft((prev) => [...prev, userToAdmin(user)])
  }

  const handleApply = () => {
    onApply(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>관리자 수정</DialogTitle>
          <DialogDescription>
            게시판 관리자를 검색해서 추가하거나 제거할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 overflow-x-visible overflow-y-auto flex flex-col">
          {/* 현재 관리자 목록 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">현재 관리자 ({draft.length}명)</p>
            <ul className="rounded-md border divide-y max-h-32 overflow-y-auto bg-muted/30">
              {draft.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                  등록된 관리자가 없습니다.
                </li>
              ) : (
                draft.map((admin) => (
                  <li
                    key={admin.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      {adminDisplayLabel(admin)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(admin.id)}
                      aria-label="제거"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* 유저 검색 및 추가 — px-[2px]로 focus ring이 잘리지 않도록 여유 확보 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">유저 검색 후 추가</p>
            <div className="px-[2px]">
              <Input
                placeholder="이름 또는 학번으로 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="h-9 py-1.5 rounded-b-none border-b-0"
              />
            </div>
            <ul className="rounded-b-md rounded-t-none border divide-y max-h-40 overflow-y-auto bg-muted/30">
              {!debouncedKeyword ? (
                <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                  검색어를 입력하세요.
                </li>
              ) : addableUsers.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                  검색 결과가 없거나 이미 추가된 관리자입니다.
                </li>
              ) : (
                addableUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      {userDisplayLabel(user)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 gap-1"
                      onClick={() => handleAdd(user)}
                      aria-label="추가"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      추가
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleApply}>적용</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
