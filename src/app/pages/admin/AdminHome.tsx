import { useCallback, useEffect, useState } from "react";
import { Users, BookOpen, UserCircle, TrendingUp, Server, Database, Wifi, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api/client";
import { getAdminDevices, AdminDevice } from "../../api/adminDevice";
import { CURRENT_YEAR, CURRENT_SEMESTER_NUM } from "../../constants/semester";

interface AdminStats {
  totalStudents: number;
  totalProfessors: number;
  totalCourses: number;
  avgAttendance: number | null;
}

function extractPageTotal(response: any): number {
  return Number(
    response?.data?.totalElements ??
    response?.data?.data?.totalElements ??
    response?.totalElements ??
    0,
  );
}

function extractList(response: any): any[] {
  const data = response?.data;
  const list = data?.content ?? data?.data?.content ?? data?.data ?? data ?? [];
  return Array.isArray(list) ? list : [];
}

export default function AdminHome() {
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalProfessors: 0,
    totalCourses: 0,
    avgAttendance: null,
  });
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminOverview = useCallback(async () => {
    setLoading(true);
    try {
      const [studentRes, professorRes, deviceList] = await Promise.all([
        api<any>("/api/admin/students?page=0&size=1", { method: "GET" }),
        api<any>("/api/admin/professors?page=0&size=100", { method: "GET" }),
        getAdminDevices().catch(() => [] as AdminDevice[]),
      ]);

      const professors = extractList(professorRes);
      const lectureResponses = await Promise.all(
        professors.map((prof: any) =>
          api<any>(`/api/admin/lectures/${prof.userNum}?year=${CURRENT_YEAR}&semester=${CURRENT_SEMESTER_NUM}`, { method: "GET" })
            .catch(() => null),
        ),
      );

      const totalCourses = lectureResponses.reduce((sum, res) => {
        if (!res) return sum;
        return sum + extractList(res).length;
      }, 0);

      setStats({
        totalStudents: extractPageTotal(studentRes),
        totalProfessors: extractPageTotal(professorRes) || professors.length,
        totalCourses,
        avgAttendance: null,
      });
      setDevices(deviceList);
    } catch (e: any) {
      toast.error(e.message || "관리자 현황을 불러오지 못했습니다.");
      setStats({ totalStudents: 0, totalProfessors: 0, totalCourses: 0, avgAttendance: null });
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminOverview();
  }, [fetchAdminOverview]);

  const onlineDevices = devices.filter((d) => d.networkStatus === "ONLINE").length;
  const activeDevices = devices.filter((d) => d.config?.active).length;
  const cameraOkDevices = devices.filter((d) => d.cameraStatus === "OK").length;

  const statusDot = { success: "bg-primary", warning: "bg-amber-500", error: "bg-rose-500" };
  const statusBg = { success: "bg-primary/10", warning: "bg-amber-50", error: "bg-rose-50" };
  const statusText = { success: "text-primary-dark", warning: "text-amber-700", error: "text-rose-700" };

  const infraStatus = [
    {
      name: "MySQL DB",
      desc: "백엔드 데이터베이스",
      status: loading ? "확인 중" : "연결됨",
      statusType: loading ? "warning" : "success",
      metrics: [`학생 ${stats.totalStudents}명`, `교수 ${stats.totalProfessors}명`],
    },
    {
      name: "Raspberry Pi Devices",
      desc: "등록된 출석 촬영 장치",
      status: devices.length === 0 ? "미등록" : onlineDevices === devices.length ? "정상" : "확인 필요",
      statusType: devices.length === 0 ? "warning" : onlineDevices === devices.length ? "success" : "warning",
      metrics: [`온라인 ${onlineDevices}/${devices.length}`, `카메라 정상 ${cameraOkDevices}/${devices.length}`],
    },
    {
      name: "강의 데이터",
      desc: `${CURRENT_YEAR}년 ${CURRENT_SEMESTER_NUM}학기 기준`,
      status: stats.totalCourses > 0 ? "조회됨" : "데이터 없음",
      statusType: stats.totalCourses > 0 ? "success" : "warning",
      metrics: [`강의 ${stats.totalCourses}개`, `활성 장치 ${activeDevices}개`],
    },
  ] as const;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">시스템 개요</h1>
          <p className="text-sm text-zinc-400 mt-1">실제 DB와 장치 API 기준 현황</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Wifi className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
          <span className="text-xs font-medium text-primary-dark">장치 온라인 {onlineDevices}/{devices.length}</span>
        </div>
      </div>

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
              <span className="text-2xl font-bold text-zinc-900">{stat.value ?? "-"}</span>
              <span className="text-sm text-zinc-400">{stat.value === null ? "" : stat.unit}</span>
            </div>
            {stat.label === "평균 출석률" && (
              <p className="mt-3 text-[11px] text-zinc-400">출석률 통계 API 연결 후 표시됩니다.</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              <h2 className="text-base font-semibold text-zinc-900">최근 장치 상태</h2>
            </div>
            <button onClick={fetchAdminOverview} className="text-xs text-zinc-400 hover:text-primary transition-colors">새로고침</button>
          </div>
          <div className="divide-y divide-zinc-50">
            {devices.length > 0 ? (
              devices.slice(0, 5).map((device) => (
                <div key={device.deviceId} className="flex items-start justify-between px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${device.networkStatus === "ONLINE" ? statusDot.success : statusDot.warning}`} />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{device.deviceName || device.deviceId}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{device.classroom} · {device.deviceId}</p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 shrink-0 ml-4">{device.lastHeartbeat || "하트비트 없음"}</span>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">등록된 장치가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-zinc-100">
            <Database className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <h2 className="text-base font-semibold text-zinc-900">인프라 상태</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {infraStatus.map((infra) => (
              <div key={infra.name} className="px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{infra.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{infra.desc}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${statusBg[infra.statusType]} ${statusText[infra.statusType]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[infra.statusType]}`} />
                    {infra.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {infra.metrics.map((metric) => (
                    <span key={metric} className="text-[11px] text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-md">{metric}</span>
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
