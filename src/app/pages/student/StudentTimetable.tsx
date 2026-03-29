import { motion } from "motion/react";
import { Clock, MapPin, User } from "lucide-react";

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

const days = ["월", "화", "수", "목", "금"];

const courses = [
  { name: "데이터베이스", professor: "김교수", room: "G301", day: 0, startTime: 9, duration: 2, color: "bg-primary/10 text-primary-dark border-primary" },
  { name: "알고리즘", professor: "이교수", room: "G405", day: 0, startTime: 13, duration: 2, color: "bg-amber-50 text-amber-700 border-amber-200" },
  { name: "웹프로그래밍", professor: "박교수", room: "IT201", day: 1, startTime: 10, duration: 2, color: "bg-sky-50 text-sky-700 border-sky-200" },
  { name: "운영체제", professor: "최교수", room: "G502", day: 2, startTime: 14, duration: 2, color: "bg-rose-50 text-rose-700 border-rose-200" },
  { name: "네트워크", professor: "정교수", room: "IT305", day: 3, startTime: 11, duration: 2, color: "bg-violet-50 text-violet-700 border-violet-200" },
];

export default function StudentTimetable() {
  return (
    <div className="min-h-[100dvh] bg-[#F8FAF9] dark:bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">강의 시간표</h1>
          <p className="text-zinc-400 mt-1">이번 학기 전체 강의 일정을 확인하세요</p>
        </div>

        {/* Timetable Card */}
        <div className="bg-white rounded-xl border border-zinc-200  overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">2026학년도 1학기</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary-dark">
              <Clock strokeWidth={1.5} className="w-3.5 h-3.5" />
              진행 중
            </span>
          </div>
          <div>
            {/* Header Row */}
            <div className="grid border-b border-zinc-100 bg-zinc-50/50" style={{ gridTemplateColumns: "28px repeat(5, 1fr)" }}>
              <div />
              {days.map((day) => (
                <div key={day} className="text-center text-xs sm:text-xs font-medium text-zinc-400 py-1.5 sm:py-2.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="relative">
              {timeSlots.map((time, index) => (
                <div key={time} className="grid border-b border-zinc-50/80 last:border-b-0" style={{ gridTemplateColumns: "28px repeat(5, 1fr)" }}>
                  <div className="text-center text-[9px] sm:text-xs font-medium text-zinc-300 flex items-start justify-center pt-0.5 sm:pt-1">
                    {time.slice(0, -3)}
                  </div>
                  {days.map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="h-[36px] sm:h-[52px] relative border-l border-zinc-50/80"
                    >
                      {courses
                        .filter((c) => c.day === dayIndex && c.startTime === index + 8)
                        .map((course, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className={`absolute inset-x-px top-px rounded-md sm:rounded-lg border p-0.5 sm:p-1.5 ${course.color} z-10 flex flex-col justify-center items-center text-center cursor-default overflow-hidden`}
                            style={{
                              height: `calc(${course.duration * 100}% - 2px)`,
                            }}
                          >
                            <div className="text-[9px] sm:text-xs font-semibold leading-tight truncate w-full">{course.name}</div>
                            <div className="text-[7px] sm:text-xs opacity-60 truncate w-full">{course.room}</div>
                          </motion.div>
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="bg-white rounded-xl border border-zinc-200 ">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">수강 과목 목록</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Asymmetric: first row 3+2, or use different spans */}
              {courses.map((course, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.06 }}
                  className={`${index < 3 ? 'md:col-span-1' : 'md:col-span-1'} p-4 rounded-xl border ${course.color} hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all`}
                >
                  <h3 className="font-semibold text-sm mb-2">{course.name}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs opacity-70">
                      <User strokeWidth={1.5} className="w-3 h-3" />
                      {course.professor}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs opacity-70">
                      <MapPin strokeWidth={1.5} className="w-3 h-3" />
                      {course.room}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs opacity-70">
                      <Clock strokeWidth={1.5} className="w-3 h-3" />
                      {days[course.day]}요일 {course.startTime}:00 - {course.startTime + course.duration}:00
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
