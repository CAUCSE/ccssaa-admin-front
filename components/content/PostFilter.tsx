"use client"

import { useEffect, useState } from "react"
import { RotateCcw, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePostBoardOptions } from "@/hooks/usePosts"
import { POST_CATEGORIES } from "@/lib/utils/post-admin"

const ALL = "ALL"

export function PostFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: boards } = usePostBoardOptions()
  const [boardId, setBoardId] = useState(searchParams.get("boardId") ?? ALL)
  const [category, setCategory] = useState(searchParams.get("category") ?? ALL)
  const [status, setStatus] = useState(searchParams.get("status") ?? ALL)
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "")
  const [writerKeyword, setWriterKeyword] = useState(searchParams.get("writerKeyword") ?? "")

  useEffect(() => {
    setBoardId(searchParams.get("boardId") ?? ALL)
    setCategory(searchParams.get("category") ?? ALL)
    setStatus(searchParams.get("status") ?? ALL)
    setKeyword(searchParams.get("keyword") ?? "")
    setWriterKeyword(searchParams.get("writerKeyword") ?? "")
  }, [searchParams])

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (boardId !== ALL) params.set("boardId", boardId)
    if (category !== ALL) params.set("category", category)
    if (status !== ALL) params.set("status", status)
    if (keyword.trim()) params.set("keyword", keyword.trim())
    if (writerKeyword.trim()) params.set("writerKeyword", writerKeyword.trim())
    params.set("page", "1")
    router.push(`/content?${params.toString()}`)
  }

  const resetFilters = () => router.push("/content?page=1")

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[180px_160px_140px_1fr_180px_auto]">
          <Select value={boardId} onValueChange={setBoardId}>
            <SelectTrigger><SelectValue placeholder="게시판" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>전체 게시판</SelectItem>
              {boards?.map((board) => <SelectItem key={board.boardId} value={board.boardId}>{board.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="카테고리" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>전체 카테고리</SelectItem>
              {POST_CATEGORIES.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="상태" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>전체 상태</SelectItem>
              <SelectItem value="VISIBLE">공개</SelectItem>
              <SelectItem value="HIDDEN">숨김</SelectItem>
              <SelectItem value="DELETED">삭제</SelectItem>
            </SelectContent>
          </Select>
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && applyFilters()} placeholder="제목 또는 본문 검색" />
          <Input value={writerKeyword} onChange={(event) => setWriterKeyword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && applyFilters()} placeholder="작성자 이름 또는 닉네임" />
          <div className="flex gap-2">
            <Button onClick={applyFilters}><Search className="mr-2 h-4 w-4" />검색</Button>
            <Button variant="outline" onClick={resetFilters} aria-label="필터 초기화"><RotateCcw className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
