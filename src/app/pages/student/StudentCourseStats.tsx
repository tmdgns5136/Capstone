import { useParams, useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowLeft, BookOpen, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";

// Mock data for weekly stats
const courseWeeklyData: Record<string, any[]> = {
  "데이터베이스": [
    { week: "1주차", date: "03.02", status: "출석", type: "att" },
    { week: "2주차", date: "03.09", status: "출석", type: "att" },
    { week: "3주차", date: "03.16", status: "지각", type: "late" },
    { week: "4주차", date: "03.23", status: "-", type: "none" },
    { week: "5주차", date: "03.30", status: "-", type: "none" },
  ],
  "알고리즘": [
    { week: "1주차", date: "03.03", status: "출석", type: "att" },
    { week: "2주차", date: "03.10", status: "결석", type: "abs" },
    { week: "3주차", date: "03.17", status: "출석", type: "att" },
  ],
  "default": [
    { week: "1주차", date: "03.04", status: "출석", type: "att" },
    { week: "2주차", date: "03.11", status: "출석", type: "att" },
    { week: "3주차", date: "03.18", status: "출석", type: "att" },
  ]
};

const courseSummaryData: Record<string, any> = {
  "데이터베이스": { att: 2, late: 1, abs: 0, total: 3 },
  "알고리즘": { att: 2, late: 0, abs: 1, total: 3 },
  "default": { att: 3, late: 0, abs: 0, total: 3 },
}

export default function StudentCourseStats() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  const courseName = courseId ? decodeURIComponent(courseId) : "데이터베이스";
  const data = courseWeeklyData[courseName] || courseWeeklyData["default"];
  const summary = courseSummaryData[courseName] || courseSummaryData["default"];

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

  const chartData = [
    { name: "출석", value: summary.att, fill: "var(--primary)" },
    { name: "지각", value: summary.late, fill: "#f59e0b" },
    { name: "결석", value: summary.abs, fill: "#f43f5e" },
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
            <p className="text-sm text-zinc-400 mt-0.5">과목 상세 출결 통계</p>
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
          <p className="text-xs text-zinc-400 mb-1">진행 주차</p>
          <p className="text-3xl font-bold text-zinc-900 tracking-tight">{summary.total}<span className="text-sm text-zinc-400 ml-0.5">주</span></p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.06 }}
          className="sm:col-span-1 lg:col-span-3 bg-white rounded-xl border border-primary/30 shadow-[0_2px_12px_-4px_rgba(5,150,105,0.08)] p-5 flex flex-col items-center justify-center"
        >
          <p className="text-xs text-primary-dark mb-1">출석</p>
          <p className="text-3xl font-bold text-primary-dark tracking-tight">{summary.att}<span className="text-sm text-primary-dark ml-0.5">회</span></p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.12 }}
          className="sm:col-span-1 lg:col-span-3 bg-white rounded-xl border border-amber-100 shadow-[0_2px_12px_-4px_rgba(217,119,6,0.08)] p-5 flex flex-col items-center justify-center"
        >
          <p className="text-xs text-amber-600 mb-1">지각</p>
          <p className="text-3xl font-bold text-amber-600 tracking-tight">{summary.late}<span className="text-sm text-amber-400 ml-0.5">회</span></p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.18 }}
          className="sm:col-span-1 lg:col-span-2 bg-white rounded-xl border border-rose-100 shadow-[0_2px_12px_-4px_rgba(225,29,72,0.08)] p-5 flex flex-col items-center justify-center"
        >
          <p className="text-xs text-rose-600 mb-1">결석</p>
          <p className="text-3xl font-bold text-rose-600 tracking-tight">{summary.abs}<span className="text-sm text-rose-400 ml-0.5">회</span></p>
        </motion.div>
      </div>

      {/* Content: 5:3 asymmetric */}
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
        {/* Weekly List */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-zinc-200 ">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">주차별 상세 현황</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {data.map((week, index) => (
                <motion.div
                  key={week.week}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.06 }}
                  className={`flex items-center justify-between px-6 py-4 ${week.type === 'none' ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
                      <span className="text-sm font-semibold text-zinc-500">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">{week.week}</h3>
                      <p className="text-xs text-zinc-400">{week.date}</p>
                    </div>
                  </div>
                  {getStatusBadge(week.type)}
                </motion.div>
              ))}
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
