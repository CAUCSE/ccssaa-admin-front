"use client"

import { useDashboard } from "@/hooks/useDashboard"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  UserPlus,
  AlertCircle,
  Calendar,
  GraduationCap,
  Clock,
  FileText,
  Megaphone,
  Search,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getStatusBadge } from "@/lib/utils/status-badge"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * 대시보드 페이지
 * 역할별로 다른 대시보드를 표시합니다.
 * 
 * 역할별 구성:
 * - Master: 전체 회원 수, 신규 가입, 미처리 신고, 미처리 경조사
 * - 학생회장: 재학생 수, 가입 승인 대기, 학생회 공지, 문화부 공지
 * - 크자회장: 졸업생 수, 경조사 신청 대기, 오늘의 새 글, 학부 공지
 * 
 * TODO: 실제 역할 정보를 가져와야 함 (현재는 Master로 가정)
 */
export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard()
  const router = useRouter()

  // TODO: 실제 역할 정보를 가져와야 함 (현재는 Master로 가정)
  const userRole: "MASTER" | "STUDENT_COUNCIL" | "ALUMNI_COUNCIL" = "MASTER"

  if (error) {
    return (
      <div className="rounded-md border p-12 text-center">
        <p className="text-destructive">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  // Master 대시보드
  const renderMasterDashboard = () => {
    if (!data) return null

    return (
      <>
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="전체 회원 수"
            value={isLoading ? "로딩 중..." : `${data.stats.totalUsers.toLocaleString()}명`}
            icon={<Users className="h-4 w-4" />}
            href="/users"
          />
          <StatCard
            title="신규 가입(오늘)"
            value={isLoading ? "로딩 중..." : `+${data.stats.newUsersToday}명`}
            icon={<UserPlus className="h-4 w-4" />}
            href="/users"
          />
          <StatCard
            title="미처리 신고"
            value={isLoading ? "로딩 중..." : `${data.stats.pendingReports}건`}
            icon={<AlertCircle className="h-4 w-4" />}
            badge={
              !isLoading && data.stats.pendingReports > 0
                ? { label: "긴급", variant: "danger" }
                : undefined
            }
            href="/users/reported"
          />
          <StatCard
            title="미처리 경조사"
            value={isLoading ? "로딩 중..." : `${data.stats.pendingEvents}건`}
            icon={<Calendar className="h-4 w-4" />}
            href="/events"
          />
        </div>

        {/* Main Widgets */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* 최근 신고 접수 내역 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 신고 접수 내역</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data.recentReports && data.recentReports.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>대상</TableHead>
                        <TableHead>사유</TableHead>
                        <TableHead>접수일</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentReports.map((report) => {
                        const badge = getStatusBadge(report.status)
                        return (
                          <TableRow
                            key={report.id}
                            className="cursor-pointer"
                            onClick={() => router.push(`/reports/${report.id}`)}
                          >
                            <TableCell>{report.target}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {report.reason}
                            </TableCell>
                            <TableCell>
                              {new Date(report.createdAt).toLocaleDateString("ko-KR")}
                            </TableCell>
                            <TableCell>
                              <Badge variant={badge.variant}>{badge.label}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  최근 활동 내역이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 최근 가입 유저 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 가입 유저</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data.recentUsers && data.recentUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>학번</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>학과</TableHead>
                        <TableHead>가입일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentUsers.map((user) => {
                        const badge = getStatusBadge(user.status)
                        return (
                          <TableRow
                            key={user.id}
                            className="cursor-pointer"
                            onClick={() => router.push(`/users/${user.id}`)}
                          >
                            <TableCell>{user.studentNo}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>
                              {new Date(user.joinedAt).toLocaleDateString("ko-KR")}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  최근 활동 내역이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // 학생회장 대시보드
  const renderStudentCouncilDashboard = () => {
    if (!data) return null

    return (
      <>
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="재학생 수"
            value={isLoading ? "로딩 중..." : `${data.stats.activeStudents.toLocaleString()}명`}
            icon={<Users className="h-4 w-4" />}
            href="/users"
          />
          <StatCard
            title="가입 승인 대기"
            value={isLoading ? "로딩 중..." : `${data.stats.pendingApprovals}명`}
            icon={<Clock className="h-4 w-4" />}
            badge={
              !isLoading && data.stats.pendingApprovals > 0
                ? { label: "대기", variant: "warning" }
                : undefined
            }
            href="/users/pending"
          />
          <StatCard
            title="학생회 공지"
            value={isLoading ? "로딩 중..." : `${data.stats.studentCouncilNotices}개`}
            icon={<Megaphone className="h-4 w-4" />}
            href="/content"
          />
          <StatCard
            title="문화부 공지"
            value={isLoading ? "로딩 중..." : `${data.stats.cultureNotices}개`}
            icon={<FileText className="h-4 w-4" />}
            href="/content"
          />
        </div>

        {/* 가입 승인 대기 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>가입 승인 대기 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data.pendingApprovals && data.pendingApprovals.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>학번</TableHead>
                      <TableHead>이름</TableHead>
                      <TableHead>학과</TableHead>
                      <TableHead>신청일</TableHead>
                      <TableHead>관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pendingApprovals.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.studentNo}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          {new Date(user.joinedAt).toLocaleDateString("ko-KR")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/users/${user.id}`)}
                          >
                            승인
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                승인 대기 중인 회원이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </>
    )
  }

  // 크자회장 대시보드
  const renderAlumniCouncilDashboard = () => {
    if (!data) return null

    return (
      <>
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="졸업생 수"
            value={isLoading ? "로딩 중..." : `${data.stats.alumniCount.toLocaleString()}명`}
            icon={<GraduationCap className="h-4 w-4" />}
            href="/users"
          />
          <StatCard
            title="경조사 신청 대기"
            value={isLoading ? "로딩 중..." : `${data.stats.pendingEventApplications}건`}
            icon={<Calendar className="h-4 w-4" />}
            badge={
              !isLoading && data.stats.pendingEventApplications > 0
                ? { label: "대기", variant: "warning" }
                : undefined
            }
            href="/events"
          />
          <StatCard
            title="오늘의 새 글"
            value={isLoading ? "로딩 중..." : `${data.stats.newPostsToday}개`}
            icon={<FileText className="h-4 w-4" />}
            href="/content"
          />
          <StatCard
            title="학부 공지"
            value={isLoading ? "로딩 중..." : `${data.stats.departmentNotices}개`}
            icon={<Megaphone className="h-4 w-4" />}
            href="/content"
          />
        </div>

        {/* Main Widgets */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* 경조사 신청 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>경조사 신청 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data.recentEvents && data.recentEvents.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>신청자</TableHead>
                        <TableHead>종류</TableHead>
                        <TableHead>경조사일</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentEvents.map((event) => {
                        const badge = getStatusBadge(event.status)
                        return (
                          <TableRow
                            key={event.id}
                            className="cursor-pointer"
                            onClick={() => router.push(`/events/${event.id}`)}
                          >
                            <TableCell>
                              {event.applicant} ({event.applicantNo})
                            </TableCell>
                            <TableCell>
                              {event.type === "MARRIAGE" ? "결혼" : "부고"}
                            </TableCell>
                            <TableCell>
                              {new Date(event.eventDate).toLocaleDateString("ko-KR")}
                            </TableCell>
                            <TableCell>
                              <Badge variant={badge.variant}>{badge.label}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  최근 활동 내역이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 최근 동문 게시글 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 동문 게시글</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data.recentPosts && data.recentPosts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>작성자</TableHead>
                        <TableHead>게시판</TableHead>
                        <TableHead>작성일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentPosts.map((post) => (
                        <TableRow
                          key={post.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/content/${post.id}`)}
                        >
                          <TableCell className="max-w-[200px] truncate">
                            {post.title}
                          </TableCell>
                          <TableCell>{post.author}</TableCell>
                          <TableCell>{post.board}</TableCell>
                          <TableCell>
                            {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  최근 활동 내역이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/content")}
        >
          <Pencil className="mr-2 h-4 w-4" />
          공지사항 작성
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/users")}
        >
          <Search className="mr-2 h-4 w-4" />
          유저 검색
        </Button>
      </div>

      {/* 역할별 대시보드 렌더링 */}
      {userRole === "MASTER" && renderMasterDashboard()}
      {/* TODO: 실제 역할 정보를 가져오면 아래 코드 활성화 */}
      {/* {userRole === "STUDENT_COUNCIL" && renderStudentCouncilDashboard()} */}
      {/* {userRole === "ALUMNI_COUNCIL" && renderAlumniCouncilDashboard()} */}
    </div>
  )
}
