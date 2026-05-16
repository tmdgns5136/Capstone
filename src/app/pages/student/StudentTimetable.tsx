import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Clock, MapPin, User, Loader2 } from "lucide-react";
import { getLectureTimeTable, LectureTimeTable } from "../../api/studentLecture";
import { CURRENT_YEAR, CURRENT_SEMESTER_NUM, CURRENT_SEMESTER_LABEL } from "../../constants/semester";

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

const days = ["월", "화", "수", "목", "금"];

const courseColors = [
  "bg-primary/10 text-primary-dark border-primary",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-sky-50 text-sky-700 border-sky-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-indigo-50 text-indigo-700 border-indigo-200",
];

function parseDayIndex(day: string): number {
  const korean: Record<string, number> = { "월": 0, "화": 1, "수": 2, "목": 3, "금": 4, "토": 5, "일": 6 };
  const english: Record<string, number> = { "MONDAY": 0, "TUESDAY": 1, "WEDNESDAY": 2, "THURSDAY": 3, "FRIDAY": 4, "SATURDAY": 5, "SUNDAY": 6 };
  const upper = day.toUpperCase();
  if (english[upper] !== undefined) return english[upper];
  for (const [key, val] of Object.entries(korean)) {
    if (day.includes(key)) return val;
  }
  return -1;
}

function parseHour(time: string): number {
  // "09:00", "09:00:00" 등
  const parts = time.split(":");
  return parseInt(parts[0], 10);
}

interface TimetableEntry {
  name: string;
  room: string;
  day: number;
  startHour: number;
  endHour: number;
  color: string;
  lectureCode: string;
}

export default function StudentTimetable() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    setLoading(true);
    getLectureTimeTable(CURRENT_YEAR, CURRENT_SEMESTER_NUM)
      .then((res) => {
        const entries: TimetableEntry[] = res.data.map((item, idx) => ({
          name: item.lectureName,
          room: item.room || "",
          day: parseDayIndex(item.day),
          startHour: parseHour(item.startTime),
          endHour: parseHour(item.endTime),
          color: courseColors[idx % courseColors.length],
          lectureCode: item.lectureCode,
        }));
        setCourses(entries.filter((e) => e.day >= 0 && e.day <= 4));
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

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
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">{CURRENT_SEMESTER_LABEL}</h2>
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
                        .filter((c) => c.day === dayIndex && c.startHour === index + 8)
                        .map((course, i) => {
                          const duration = Math.max(course.endHour - course.startHour, 1);
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: "spring", stiffness: 100, damping: 20 }}
                              className={`absolute inset-x-px top-px rounded-md sm:rounded-lg border p-0.5 sm:p-1.5 ${course.color} z-10 flex flex-col justify-center items-center text-center cursor-default overflow-hidden`}
                              style={{
                                height: `calc(${duration * 100}% - 2px)`,
                              }}
                            >
                              <div className="text-[9px] sm:text-xs font-semibold leading-tight truncate w-full">{course.name}</div>
                              <div className="text-[7px] sm:text-xs opacity-60 truncate w-full">{course.room}</div>
                            </motion.div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course List */}
        {courses.length > 0 && (
          <div className="bg-white rounded-xl border border-zinc-200 ">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">수강 과목 목록</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {courses.map((course, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.06 }}
                    className={`p-4 rounded-xl border ${course.color} hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all`}
                  >
                    <h3 className="font-semibold text-sm mb-2">{course.name}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs opacity-70">
                        <MapPin strokeWidth={1.5} className="w-3 h-3" />
                        {course.room || "-"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs opacity-70">
                        <Clock strokeWidth={1.5} className="w-3 h-3" />
                        {days[course.day]}요일 {String(course.startHour).padStart(2, "0")}:00 - {String(course.endHour).padStart(2, "0")}:00
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {courses.length === 0 && (
          <div className="text-center py-12 text-sm text-zinc-400">시간표 데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
