import { Users, BookOpen, UserCircle, TrendingUp, Server, Database, Wifi } from "lucide-react";

export default function AdminHome() {
  const stats = {
    totalStudents: 1250,
    totalProfessors: 48,
    totalCourses: 126,
    avgAttendance: 91.2,
  };

  const recentActivities = [
    { action: "새 학생 데이터 동기화", detail: "한지우 (20240137)", time: "5분 전", status: "success" },
    { action: "라즈베리파이 센서 연결", detail: "공학관 405호", time: "1시간 전", status: "success" },
    { action: "교수 권한 갱신", detail: "이교수", time: "2시간 전", status: "warning" },
    { action: "Amazon Rekognition", detail: "API 호출 한도 80% 도달", time: "3시간 전", status: "error" },
  ];

  const statusDot = { success: "bg-primary", warning: "bg-amber-500", error: "bg-rose-500" };
  const statusBg = { success: "bg-primary/10", warning: "bg-amber-50", error: "bg-rose-50" };
  const statusText = { success: "text-primary-dark", warning: "text-amber-700", error: "text-rose-700" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">시스템 개요</h1>
          <p className="text-sm text-zinc-400 mt-1">전체 시스템 상태 및 현황</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Wifi className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
          <span className="text-xs font-medium text-primary-dark">네트워크 안정 (12ms)</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "전체 학생", value: stats.totalStudents, unit: "명", icon: Users },
          { label: "전체 교수", value: stats.totalProfessors, unit: "명", icon: UserCircle },
          { label: "전체 강의", value: stats.totalCourses, unit: "개", icon: BookOpen },
          { label: "평균 출석률", value: stats.avgAttendance, unit: "%", icon: TrendingUp },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-zinc-900">{stat.value}</span>
              <span className="text-sm text-zinc-400">{stat.unit}</span>
            </div>
            {stat.label === "평균 출석률" && (
              <div className="mt-3 w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${stats.avgAttendance}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two-column: Logs + Infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* System Logs */}
        <div className="md:col-span-3 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              <h2 className="text-base font-semibold text-zinc-900">시스템 로그</h2>
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
          </div>
          <div className="divide-y divide-zinc-50">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start justify-between px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${statusDot[activity.status as keyof typeof statusDot]}`} />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{activity.action}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{activity.detail}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-400 shrink-0 ml-4">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure Status */}
        <div className="md:col-span-2 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-zinc-100">
            <Database className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <h2 className="text-base font-semibold text-zinc-900">인프라 상태</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {[
              { name: "Supabase DB", desc: "PostgreSQL 15.1", status: "정상", statusType: "success", metrics: ["연결 42/100", "응답 15ms"] },
              { name: "AWS Rekognition", desc: "얼굴 인식 API", status: "주의", statusType: "warning", metrics: ["사용량 82%", "정확도 99.8%"] },
              { name: "Edge Nodes (R-Pi)", desc: "카메라 모듈 디바이스", status: "정상", statusType: "success", metrics: ["활성 12/15", "업타임 48h"] },
            ].map((infra, index) => (
              <div key={index} className="px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{infra.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{infra.desc}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${statusBg[infra.statusType as keyof typeof statusBg]} ${statusText[infra.statusType as keyof typeof statusText]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[infra.statusType as keyof typeof statusDot]}`} />
                    {infra.status}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {infra.metrics.map((metric, mi) => (
                    <span key={mi} className="text-[11px] text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-md">{metric}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
