import assert from "node:assert/strict"
import test from "node:test"

import {
  getCampaignDraftErrors,
  isCampaignInProgress,
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
