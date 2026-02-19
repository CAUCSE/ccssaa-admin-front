import type {
  AdmissionSummary,
  AdmissionDetail,
  AdmissionListParams,
  AdmissionListResponse,
} from "@/types/admission"
import type { UserStatus, AcademicStatus, Department } from "@/types/user"

const departments: Department[] = [
  "DEPT_OF_AI",
  "SCHOOL_OF_SW",
  "SCHOOL_OF_CSE",
  "DEPT_OF_CSE",
  "DEPT_OF_CS",
]
const academicStatuses: AcademicStatus[] = ["ENROLLED", "GRADUATED", "UNDETERMINED"]
const names = [
  "김철수", "이영희", "박민수", "정수진", "최동현",
  "강미영", "윤성호", "임지은", "한동욱", "오세진",
  "서하늘", "장은비", "배준혁", "신다은", "권태양",
]

const generateMockAdmissions = (): AdmissionSummary[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const admissionYear = 2020 + Math.floor(Math.random() * 6)
    const studentId = `${admissionYear}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`
    const name = names[Math.floor(Math.random() * names.length)]
    const states: UserStatus[] = ["AWAIT", "AWAIT", "AWAIT", "REJECT"]
    const createdDate = new Date(
      2025,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )

    return {
      id: `admission-${i + 1}`,
      userName: name,
      userEmail: `${studentId}@example.ac.kr`,
      requestedDepartment: departments[Math.floor(Math.random() * departments.length)],
      requestedAdmissionYear: admissionYear,
      requestedStudentId: studentId,
      requestedAcademicStatus: academicStatuses[Math.floor(Math.random() * academicStatuses.length)],
      userState: states[Math.floor(Math.random() * states.length)],
      createdAt: createdDate.toISOString(),
    }
  })
}

let mockAdmissions = generateMockAdmissions()

export const mockAdmissionApi = {
  getAdmissions: async (
    params: AdmissionListParams
  ): Promise<AdmissionListResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...mockAdmissions]

    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.userName.toLowerCase().includes(keyword) ||
          a.requestedStudentId.includes(keyword)
      )
    }

    if (params.userState) {
      filtered = filtered.filter((a) => a.userState === params.userState)
    }

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const page = params.page ?? 0
    const size = params.size ?? 10
    const start = page * size
    const paginatedContent = filtered.slice(start, start + size)

    return {
      content: paginatedContent,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      size,
      number: page,
    }
  },

  getAdmissionDetail: async (
    admissionId: string
  ): Promise<AdmissionDetail> => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const admission = mockAdmissions.find((a) => a.id === admissionId)
    if (!admission) {
      throw new Error("Admission not found")
    }

    return {
      ...admission,
      description: "컴퓨터공학과 재학 중이며, 학생증 사진을 첨부합니다.",
      attachImageUrls: [
        "https://placehold.co/600x400?text=학생증+앞면",
        "https://placehold.co/600x400?text=학생증+뒷면",
      ],
      updatedAt: admission.createdAt,
    }
  },
}
