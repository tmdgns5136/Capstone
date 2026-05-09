import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Play, Square, Wifi, Clock, MapPin, Users, CheckCircle, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useClassSimulator } from "../../hooks/useClassSimulator";
import { 
  getTodayLectures, 
  getDashboardStats, 
  startLecture, 
  endLecture, 
  TodayLecture, 
  DashboardStats 
} from "../../api/lecture";
import { getAbsenceRequests, AbsenceRequest } from "../../api/absence"; // 10번 API 가져오기
import { toast } from "sonner";

export default function ProfessorHome() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [todayLectures, setTodayLectures] = useState<TodayLecture[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<AbsenceRequest[]>([]); // 실데이터 상태 추가
  const [loading, setLoading] = useState(true);

  const { isActive, attendanceData, elapsedTime, selectedCourse: simCourse, startSimulation, stopSimulation } = useClassSimulator();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. 대시보드 통합 데이터 호출 (API 5, 6, 10번 연동)
  const fetchDashboardData = useCallback(async () => {
  setLoading(true);
  try {
    // 각 요청의 성공/실패 여부를 개별적으로 확인
    const results = await Promise.allSettled([
      getTodayLectures(),
      getDashboardStats(),
      getAbsenceRequests(1, 5)
    ]);

    // 1. 오늘의 강의 처리
    if (results[0].status === 'fulfilled' && results[0].value.success) {
      setTodayLectures(results[0].value.data);
    }

    // 2. 대시보드 통계 처리
    if (results[1].status === 'fulfilled' && results[1].value.success) {
      setStats(results[1].value.data);
    }

    // 3. 공결 신청 처리
    if (results[2].status === 'fulfilled' && results[2].value.success) {
      setPendingRequests(results[2].value.data.data.filter(r => r.status === "PENDING"));
    }
  } catch (error) {
    toast.error("데이터를 불러오는데 실패했습니다.");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 2. 강의 제어 핸들러 (API 7, 7-1번 연동)
  const handleStartLecture = async (lectureId: number) => {
    try {
      const response = await startLecture(lectureId);
      if (response.success) {
        startSimulation();
        toast.success("강의실이 활성화되었습니다. 출결 측정을 시작합니다.");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("강의 시작에 실패했습니다.");
    }
  };

  const handleEndLecture = async (lectureId: number) => {
    try {
      const response = await endLecture(lectureId);
      if (response.success) {
        stopSimulation();
        toast.success("강의가 종료되었습니다. 출결 데이터가 서버에 반영됩니다.");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("강의 종료 처리에 실패했습니다.");
    }
  };

  // 시간표 기반 활성 강의 찾기
  const activeCourse = todayLectures.find(l => l.status === "IN_PROGRESS") || todayLectures[0];
  const currentlyActive = todayLectures.find(l => l.status === "IN_PROGRESS");

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-zinc-300" /></div>;

  return (
    <div className="space-y-6">
      {/* Time Display */}
      <div className="flex justify-end gap-6 sm:gap-8">
        <div className="text-right">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">LOCAL TIME</p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">
            {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">TODAY</p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">
            {currentTime.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats Grid: API 6번 실제 데이터 적용 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="현재 강의 수강생" value={currentlyActive ? currentlyActive.students : 0} unit="명" icon={<Users className="text-rose-400" />} />
        <StatCard label="평균 출석률" value={stats?.avgAttendance} unit="%" icon={<CheckCircle className="text-primary" />} isProgress />
        <StatCard label="공결 대기" value={stats?.pendingAbsences} unit="건" icon={<AlertCircle className="text-amber-400" />} />
        <StatCard label="오늘 강의" value={stats?.todayClasses} unit="개" icon={<Clock className="text-primary" />} dark />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Class Control */}
        <div className={`rounded-2xl p-5 sm:p-8 transition-all ${isActive ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border border-zinc-200"}`}>
          <div className="flex items-start justify-between mb-8">
            <div className={isActive ? "text-white" : "text-zinc-900"}>
              {isActive && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase">LIVE TRACKING</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold">
                {isActive ? simCourse?.name : activeCourse?.name || "예정된 수업 없음"}
              </h1>
              {activeCourse && (
                <p className="text-sm mt-2 flex items-center gap-2 text-zinc-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {activeCourse.location} | {activeCourse.time}
                </p>
              )}
            </div>
            <Wifi className={`w-8 h-8 ${isActive ? "text-primary" : "text-zinc-300"}`} />
          </div>

          {isActive ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <AttendanceStat label="출석" value={attendanceData.present} color="text-primary" />
                <AttendanceStat label="이탈" value={attendanceData.away} color="text-rose-400" />
                <AttendanceStat label="미출석" value={attendanceData.absent} color="text-zinc-500" />
              </div>
              <button
                onClick={() => handleEndLecture(activeCourse?.lectureId || 0)}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-700 transition-colors"
              >
                <Square className="w-4 h-4 fill-current" /> 수업 종료 및 저장
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary/20 w-0" />
              </div>
              <button
                onClick={() => handleStartLecture(activeCourse?.lectureId || 0)}
                disabled={!activeCourse}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" /> 수업 시작하기
              </button>
            </div>
          )}
        </div>

        {/* Today's Schedule List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-400" /> 오늘 일정
            </h2>
            <button onClick={() => navigate("/professor/courses")} className="text-xs text-zinc-400 hover:text-primary transition-colors">전체 보기</button>
          </div>
          <div className="space-y-3">
            {todayLectures.map((lecture) => (
              <div key={lecture.lectureId} className="bg-white border border-zinc-200 p-4 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    lecture.status === "IN_PROGRESS" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400"
                  }`}>
                    {lecture.status === "IN_PROGRESS" ? "진행 중" : "대기"}
                  </span>
                  <h3 className="font-bold text-zinc-900 mt-1">{lecture.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{lecture.time} · {lecture.location}</p>
                </div>
                <button
                  onClick={() => navigate("/professor/courses", { state: { lectureId: lecture.lectureId } })}
                  className="p-2.5 rounded-full bg-zinc-50 text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 실시간 공결 대기 리스트 (API 10번 실제 데이터 연동) */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> 공결 신청 대기
          </h2>
          <button onClick={() => navigate("/professor/absence-management")} className="text-xs text-zinc-400 hover:text-primary transition-colors">전체 관리</button>
        </div>
        <div className="p-4 space-y-3">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <div 
                key={request.officialId}
                onClick={() => navigate("/professor/absence-management")}
                className="flex items-start justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100 hover:bg-amber-100/50 transition-all cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="font-bold text-zinc-900">{request.studentName} <span className="text-xs font-normal text-zinc-400">({request.studentId})</span></p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span className="bg-white px-2 py-0.5 rounded border border-zinc-200 font-medium">{request.course}</span>
                    <span>결석일: {request.date}</span>
                  </div>
                  <p className="text-xs text-zinc-600 line-clamp-1">사유: {request.reason}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 mt-1" />
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400 font-medium italic">
              현재 대기 중인 공결 신청이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 보조 컴포넌트 ---
function StatCard({ label, value, unit, icon, isProgress, dark }: any) {
  return (
    <div className={`${dark ? "bg-zinc-900 text-white" : "bg-white border-zinc-200"} rounded-2xl border p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value || 0}</span>
        <span className="text-xs font-medium text-zinc-400">{unit}</span>
      </div>
      {isProgress && (
        <div className="w-full bg-zinc-100 rounded-full h-1 mt-3">
          <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${value}%` }} />
        </div>
      )}
    </div>
  );
}

function AttendanceStat({ label, value, color }: any) {
  return (
    <div className="bg-zinc-800/50 rounded-xl p-3 text-center border border-zinc-800">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{label}</p>
    </div>
  );
}