import assert from "node:assert/strict"
import test from "node:test"

import { getPostCategoryLabel, getPostImageAlt, getPostStatusLabel, getPostWriterLabel, shouldRenderPostHtml } from "./post-admin.ts"

test("게시물 상태를 관리자 화면용 한글로 표시한다", () => {
  assert.equal(getPostStatusLabel("VISIBLE"), "공개")
  assert.equal(getPostStatusLabel("HIDDEN"), "숨김")
  assert.equal(getPostStatusLabel("DELETED"), "삭제")
})

test("null 카테고리를 미분류로 표시한다", () => {
  assert.equal(getPostCategoryLabel(null), "미분류")
  assert.equal(getPostCategoryLabel("EVENT_LECTURE"), "행사/특강")
})

test("익명 게시물도 관리자에게 실제 작성자와 익명 여부를 함께 표시한다", () => {
  assert.equal(getPostWriterLabel({ writerName: "홍길동", writerNickname: "길동", isAnonymous: true }), "홍길동 (길동) · 익명 작성")
})

test("게시물 이미지에 제목과 순서를 포함한 대체 텍스트를 제공한다", () => {
  assert.equal(getPostImageAlt("동문 행사", 1), "동문 행사 이미지 2")
  assert.equal(getPostImageAlt(null, 0), "게시물 이미지 1")
})

test("크롤링 게시물만 HTML 본문으로 렌더링한다", () => {
  assert.equal(shouldRenderPostHtml(true), true)
  assert.equal(shouldRenderPostHtml(false), false)
})
