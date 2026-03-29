import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Play, Square, Wifi, Clock, MapPin, Users, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useClassSimulator } from "../../hooks/useClassSimulator";

const todaySchedule = [
  { id: 1, name: "객체지향 프로그래밍", location: "제1공학관 209호", time: "09:00 - 10:50", status: "진행 중" as const },
  { id: 2, name: "알고리즘", location: "제1공학관 201호", time: "13:00 - 14:50", status: "진행 전" as const },
  { id: 3, name: "데이터베이스", location: "제1공학관 209호", time: "15:00 - 16:50", status: "진행 전" as const },
];

const pendingRequests = [
  { name: "박민수", course: "데이터베이스", date: "2026-03-10", reason: "병원 진료" },
  { name: "정수진", course: "알고리즘", date: "2026-03-11", reason: "가족 행사" },
];

export default function ProfessorHome() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isActive, elapsedTime, attendanceData, selectedCourse: simCourse, scheduledCourse, startSimulation, stopSimulation } = useClassSimulator();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  };

  // 시간표 자동 감지된 강의 또는 선택된 강의
  const activeCourse = scheduledCourse || simCourse;

  const stats = {
    totalStudents: 126,
    avgAttendance: 89.5,
    pendingRequests: 3,
    todayClasses: todaySchedule.length,
  };

  return (
    <div className="space-y-6">
      {/* Time Display */}
      <div className="flex justify-end gap-6 sm:gap-8">
        <div className="text-right">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">LOCAL TIME</p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{formatTime(currentTime)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">TODAY</p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900">{formatDate(currentTime)}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">총 수강생</span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-3xl font-bold text-zinc-900">{stats.totalStudents}<span className="text-base font-medium text-zinc-400 ml-1">명</span></span>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">평균 출석률</span>
            <CheckCircle className="w-4 h-4 text-primary" />
          </div>
          <span className="text-3xl font-bold text-zinc-900">{stats.avgAttendance}%</span>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2">
            <div className="h-full rounded-full bg-primary" style={{ width: `${stats.avgAttendance}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">공결 대기</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-bold text-zinc-900">{stats.pendingRequests}<span className="text-base font-medium text-zinc-400 ml-1">건</span></span>
        </div>
        <div className="bg-zinc-900 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">오늘 강의</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <span className="text-3xl font-bold text-white">{stats.todayClasses}<span className="text-base font-medium text-zinc-400 ml-1">개</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Class Control */}
        <div className={`rounded-2xl p-5 sm:p-8 ${isActive ? "bg-zinc-900" : "bg-zinc-50"}`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              {isActive && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                  </span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">LIVE</span>
                </div>
              )}
              <h1 className={`text-2xl sm:text-3xl font-bold ${isActive ? "text-white" : "text-zinc-900"}`}>
                {isActive ? simCourse?.name : activeCourse?.name || "수업 없음"}
              </h1>
              {activeCourse ? (
                <p className={`text-sm mt-2 flex items-center gap-2 ${isActive ? "text-zinc-400" : "text-zinc-400"}`}>
                  <MapPin className="w-3.5 h-3.5" />
                  {activeCourse.room} | {activeCourse.schedule}
                </p>
              ) : (
                <p className="text-sm mt-2 text-zinc-400">현재 시간표에 해당하는 강의가 없습니다</p>
              )}
            </div>
            <Wifi className={`w-8 h-8 ${isActive ? "text-primary" : "text-zinc-300"}`} />
          </div>

          {isActive ? (
            <>
              {/* 실시간 출석 현황 */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{attendanceData.present}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">출석</p>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-rose-400">{attendanceData.away}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">자리비움</p>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-zinc-500">{attendanceData.absent}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">미출석</p>
                </div>
              </div>
              {/* 경과 시간 */}
              <div className="flex items-center justify-between mb-6 px-1">
                <span className="text-xs text-zinc-500">경과 시간</span>
                <span className="text-lg font-bold text-white font-mono">
                  {String(Math.floor(elapsedTime / 3600)).padStart(2, "0")}:{String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, "0")}:{String(elapsedTime % 60).padStart(2, "0")}
                </span>
              </div>
              <button
                onClick={stopSimulation}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white font-semibold py-4 rounded-xl hover:bg-rose-700 transition-colors text-sm"
              >
                <Square className="w-5 h-5 fill-current" /> 강의 종료
              </button>
            </>
          ) : (
            <>
              {/* Progress placeholder */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>수업 진행률</span>
                </div>
                <div className="w-full bg-zinc-200 rounded-full h-2">
                  <div className="h-full rounded-full bg-primary" style={{ width: "0%" }} />
                </div>
              </div>
              <button
                onClick={startSimulation}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-4 rounded-xl hover:bg-primary-hover transition-colors text-sm"
              >
                <Play className="w-5 h-5" /> 강의 시작
              </button>
            </>
          )}
        </div>

        {/* Today's Schedule */}
        <div>
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-zinc-400" /> 오늘의 강의 일정
          </h2>
          <div className="border-t-2 border-primary mb-4" />
          <div className="space-y-4">
            {todaySchedule.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center justify-between">
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium mb-2 ${course.status === "진행 중"
                      ? "bg-primary/20 text-primary-dark"
                      : "bg-zinc-100 text-zinc-500"
                    }`}>
                    {course.status}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900">{course.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {course.location} | {course.time}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/professor/courses", { state: { courseId: course.id } })}
                  className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-hover transition-colors shrink-0"
                >
                  강의실 입장 <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Absence Requests */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-zinc-900">공결 대기</h2>
        </div>
        <div className="p-4 space-y-3">
          {pendingRequests.map((request, index) => (
            <div key={index} className="flex items-start justify-between p-4 bg-amber-50 rounded-lg border border-amber-100 hover:bg-amber-100/50 transition-colors cursor-pointer">
              <div>
                <p className="font-semibold text-zinc-900">{request.name}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                  <span className="bg-white px-2 py-0.5 rounded border border-zinc-200">{request.course}</span>
                  <span>{request.date}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">사유: {request.reason}</p>
              </div>
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
