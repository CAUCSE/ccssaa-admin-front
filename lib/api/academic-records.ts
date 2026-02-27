import { mockAcademicRecordsApi } from "../mock/academic-records"
import {
  getAcademicRecordApplications as getApplicationsV2,
  getAcademicRecordApplicationDetail as getApplicationDetailV2,
  approveAcademicRecordApplication as approveV2,
  rejectAcademicRecordApplication as rejectV2,
} from "./v2/academic-records"
import type {
  AcademicRecordApplicationListPayload,
  AcademicRecordApplicationDetail,
  AcademicRecordListParams,
} from "@/types/academic-record"

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true"

const realAcademicRecordsApi = {
  getApplications: (params?: AcademicRecordListParams): Promise<AcademicRecordApplicationListPayload> =>
    getApplicationsV2(params),

  getApplicationDetail: (applicationId: string): Promise<AcademicRecordApplicationDetail | null> =>
    getApplicationDetailV2(applicationId),

  approve: (applicationId: string): Promise<unknown> =>
    approveV2(applicationId),

  reject: (applicationId: string, rejectReason: string): Promise<unknown> =>
    rejectV2(applicationId, rejectReason),
}

export const academicRecordsApi = USE_MOCK_API ? mockAcademicRecordsApi : realAcademicRecordsApi

export async function getApplications(params?: AcademicRecordListParams) {
  return academicRecordsApi.getApplications(params)
}

export async function getApplicationDetail(applicationId: string) {
  return academicRecordsApi.getApplicationDetail(applicationId)
}

export async function approveApplication(applicationId: string) {
  return academicRecordsApi.approve(applicationId)
}

export async function rejectApplication(applicationId: string, rejectReason: string) {
  return academicRecordsApi.reject(applicationId, rejectReason)
}
