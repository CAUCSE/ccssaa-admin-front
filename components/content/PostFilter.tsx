"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { useBoards } from "@/hooks/usePosts"
import type { PostStatus } from "@/types/post"

export function PostFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: boards } = useBoards()

  const [boardId, setBoardId] = useState(searchParams.get("boardId") || "전체")
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")
  const [author, setAuthor] = useState(searchParams.get("author") || "")

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (boardId && boardId !== "전체") {
      params.set("boardId", boardId)
    }
    if (keyword.trim()) {
      params.set("keyword", keyword.trim())
    }
    if (author.trim()) {
      params.set("author", author.trim())
    }

    router.push(`/content?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={boardId} onValueChange={setBoardId}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="게시판" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체</SelectItem>
              {boards?.map((board) => (
                <SelectItem key={board.id} value={String(board.id)}>
                  {board.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1">
            <Input
              placeholder="제목 또는 내용 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="w-full sm:w-[150px]">
            <Input
              placeholder="작성자 검색"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <Button onClick={handleSearch} className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            검색
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

