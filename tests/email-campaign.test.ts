import assert from "node:assert/strict"
import test from "node:test"
import { getApiErrorMessage, getApiErrorStatus } from "../lib/api-error.ts"

import {
  getCampaignDraftErrors,
  isCampaignInProgress,
  normalizeRecipientEmails,
} from "../lib/utils/email-campaign.ts"

test("캠페인 초안에서 빈 제목과 본문, 범위를 벗어난 입학연도를 거부한다", () => {
  assert.deepEqual(
    getCampaignDraftErrors({
      subject: "   ",
      htmlText: "",
      admissionYears: [1899, 2020, 2101],
    }),
    {
      subject: "제목을 입력해 주세요.",
      html: "본문을 입력해 주세요.",
      admissionYears: "입학연도는 1900년부터 2100년까지 입력할 수 있습니다.",
    }
  )
})

test("캠페인 제목은 255자까지 허용한다", () => {
  assert.equal(
    getCampaignDraftErrors({
      subject: "가".repeat(255),
      htmlText: "본문",
      admissionYears: [],
    }).subject,
    undefined
  )
  assert.equal(
    getCampaignDraftErrors({
      subject: "가".repeat(256),
      htmlText: "본문",
      admissionYears: [],
    }).subject,
    "제목은 255자 이하로 입력해 주세요."
  )
})

test("QUEUED와 SENDING 상태에서만 polling한다", () => {
  assert.equal(isCampaignInProgress("DRAFT"), false)
  assert.equal(isCampaignInProgress("QUEUED"), true)
  assert.equal(isCampaignInProgress("SENDING"), true)
  assert.equal(isCampaignInProgress("COMPLETED"), false)
})

test("특정 수신 이메일은 공백을 제거하고 소문자로 중복 제거한다", () => {
  assert.deepEqual(
    normalizeRecipientEmails(" Tester@Example.com, tester@example.com\nsecond@example.com "),
    ["tester@example.com", "second@example.com"]
  )
})

test("특정 이메일 모드는 수신 이메일이 한 개 이상이어야 한다", () => {
  assert.equal(
    getCampaignDraftErrors({
      subject: "제목",
      htmlText: "본문",
      admissionYears: [],
      targetMode: "EMAILS",
      recipientEmails: [],
    }).recipientEmails,
    "대상 이메일을 한 개 이상 입력해 주세요."
  )
})

test("등록 회원이 아닌 특정 이메일 오류를 이해하기 쉬운 안내로 변환한다", () => {
  assert.equal(
    getApiErrorMessage({ response: { data: { code: "EMAIL_CAMPAIGN_400_006", message: "invalid" } } }),
    "등록된 활성 회원이 아닌 이메일이 포함되어 있습니다. 이메일 목록 전체를 확인해 주세요."
  )
})

test("API 충돌 응답의 HTTP 상태를 식별한다", () => {
  assert.equal(getApiErrorStatus({ response: { status: 409 } }), 409)
  assert.equal(getApiErrorStatus(new Error("network")), undefined)
})
