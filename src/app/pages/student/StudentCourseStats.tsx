import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowLeft, BookOpen, AlertTriangle, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { getLectureStats, getMyLectures, StatsData, StatsSessionData, MyLectureData } from "../../api/studentLecture";

function statusType(status: string) {
  switch (status) {
    case "ATTEND": return "att";
    case "LATENESS": return "late";
    case "ABSENCE": return "abs";
    default: return "none";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "ATTEND": return "출석";
    case "LATENESS": return "지각";
    case "ABSENCE": return "결석";
    default: return "미진행";
  }
}

export default function StudentCourseStats() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);

    // 강의명 가져오기 + 통계 가져오기
    Promise.all([
      getMyLectures(new Date().getFullYear(), new Date().getMonth() + 1 >= 7 ? "2학기" : "1학기").catch(() => ({ data: [] as MyLectureData[] })),
      getLectureStats(courseId),
    ])
      .then(([lecturesRes, statsRes]) => {
        const lecture = lecturesRes.data.find((l) => String(l.lectureId) === String(courseId));
        setCourseName(lecture?.lectureName || `강의 ${courseId}`);
        setStats(statsRes.data);
      })
      .catch(() => {
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const getStatusBadge = (type: string) => {
    switch (type) {
      case "att":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
            <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5" />
            출석
          </span>
        );
      case "late":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
            <AlertTriangle strokeWidth={1.5} className="w-3.5 h-3.5" />
            지각
          </span>
        );
      case "abs":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700">
            <XCircle strokeWidth={1.5} className="w-3.5 h-3.5" />
            결석
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-50 text-zinc-400">
            미진행
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <ArrowLeft strokeWidth={1.5} className="w-4 h-4" /> 목록으로
        </button>
        <div className="text-center py-20 text-zinc-500">출결 통계를 불러올 수 없습니다.</div>
      </div>
    );
  }

  const chartData = [
    { name: "출석", value: stats.attendance, fill: "var(--primary)" },
    { name: "지각", value: stats.late, fill: "#f59e0b" },
    { name: "결석", value: stats.absence, fill: "#f43f5e" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-4"
        >
          <ArrowLeft strokeWidth={1.5} className="w-4 h-4" /> 목록으로
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <BookOpen strokeWidth={1.5} className="w-6 h-6 text-primary-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{courseName}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">과목 상세 출결 통계 (출석률 {stats.attendanceRate.toFixed(1)}%)</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-10 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="sm:col-span-1 lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] p-5 flex flex-col items-center justify-center"
        >
          <p className="text-xs text-zinc-400 mb-1">총 수업</p>
          <p className="text-3xl font-bold text-zinc-900 tracking-tight">{stats.totalSessions}<span className="text-sm text-zinc-400 ml-0.5">회</span></p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.06 }}
          className="sm:col-span-1 lg:col-span-3 bg-white rounded-xl border border-primary/30 shadow-[0_2px_12px_-4px_rgba(5,150,105,0.08)] p-5 flex flex-col items-center justify-center"
        >
          <p className="text-xs text-primary-dark mb-1">출석</p>
          <p className="text-3xl font-bold text-primary-dark tracking-tight">{stats.attendance}<span className="text-sm text-primary-dark ml-0.5">회</span></p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.12 }}
          className="sm:col-span-1 lg:col-span-3 bg-white rounded-xl border border-amber-100 shadow-[0_2px_12px_-4px_rgba(217,119,6,0.08)] p-5 flex flex-col items-center justify-center"
        >
          <p className="text-xs text-amber-600 mb-1">지각</p>
          <p className="text-3xl font-bold text-amber-600 tracking-tight">{stats.late}<span className="text-sm text-amber-400 ml-0.5">회</span></p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.18 }}
          className="sm:col-span-1 lg:col-span-2 bg-white rounded-xl border border-rose-100 shadow-[0_2px_12px_-4px_rgba(225,29,72,0.08)] p-5 flex flex-col items-center justify-center"
        >
          <p className="text-xs text-rose-600 mb-1">결석</p>
          <p className="text-3xl font-bold text-rose-600 tracking-tight">{stats.absence}<span className="text-sm text-rose-400 ml-0.5">회</span></p>
        </motion.div>
      </div>

      {/* Content: 5:3 asymmetric */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
        {/* Weekly List */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-zinc-200 ">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">회차별 상세 현황</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {stats.sessions.map((session, index) => {
                const type = statusType(session.status);
                return (
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.06 }}
                    className={`flex items-center justify-between px-6 py-4 ${type === 'none' ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                        <span className="text-sm font-semibold text-zinc-500">{session.sessionNum}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">{session.sessionNum}회차</h3>
                        <p className="text-xs text-zinc-400">{session.sessionDate} ({session.startTime} ~ {session.endTime})</p>
                      </div>
                    </div>
                    {getStatusBadge(type)}
                  </motion.div>
                );
              })}
              {stats.sessions.length === 0 && (
                <div className="text-center py-12 text-sm text-zinc-400">세션 데이터가 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Column */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-zinc-200  sticky top-6">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">출결 비율</h2>
            </div>
            <div className="p-6">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#71717a', fontWeight: 500, fontSize: 13 }}
                      width={50}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        border: '1px solid #e4e4e7',
                        borderRadius: '12px',
                        fontSize: '13px',
                        boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
