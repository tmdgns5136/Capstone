import { useCallback, useEffect, useState } from "react";
import { Users, BookOpen, UserCircle, Server, Wifi, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api/client";
import { getAdminDevices, AdminDevice } from "../../api/adminDevice";
import { CURRENT_YEAR, CURRENT_SEMESTER_NUM } from "../../constants/semester";

interface AdminStats {
  totalStudents: number;
  totalProfessors: number;
  totalCourses: number;
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
      });
      setDevices(deviceList);
    } catch (e: any) {
      toast.error(e.message || "관리자 현황을 불러오지 못했습니다.");
      setStats({ totalStudents: 0, totalProfessors: 0, totalCourses: 0 });
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminOverview();
  }, [fetchAdminOverview]);

  const onlineDevices = devices.filter((d) => d.networkStatus === "ONLINE").length;


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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "전체 학생", value: stats.totalStudents, unit: "명", icon: Users },
          { label: "전체 교수", value: stats.totalProfessors, unit: "명", icon: UserCircle },
          { label: "전체 강의", value: stats.totalCourses, unit: "개", icon: BookOpen },
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
          </div>
        ))}
      </div>

      <div>
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
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
      </div>
    </div>
  );
}
