import { useState, useEffect } from "react";
import { Clock, ScanFace, Loader2 } from "lucide-react";
import {
  getTodayCourses,
  getCurrentLecture,
  getLectureTimeTable,
  type CourseData,
  type CourseStateData,
  type LectureTimeTable,
} from "../../api/studentLecture";

const days = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
const dayMap: Record<string, number> = { "MONDAY": 0, "TUESDAY": 1, "WEDNESDAY": 2, "THURSDAY": 3, "FRIDAY": 4, "SATURDAY": 5, "SUNDAY": 6, "월": 0, "화": 1, "수": 2, "목": 3, "금": 4, "토": 5, "일": 6, "월요일": 0, "화요일": 1, "수요일": 2, "목요일": 3, "금요일": 4, "토요일": 5, "일요일": 6 };
const hours = Array.from({ length: 14 }, (_, i) => i + 8);

function getTodayString() {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[new Date().getDay()];
}

function parseMinutes(time: string) {
  const parts = time.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
}

export default function StudentHome() {
  const now = new Date();
  const year = now.getFullYear();
  const semester = now.getMonth() + 1 >= 7 ? "2학기" : "1학기";

  const [todayCourses, setTodayCourses] = useState<CourseData[]>([]);
  const [currentLecture, setCurrentLecture] = useState<CourseStateData | null>(null);
  const [timetable, setTimetable] = useState<LectureTimeTable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    const today = getTodayString();
    Promise.all([
      getTodayCourses(year, semester, today).catch(() => ({ data: [] })),
      getCurrentLecture(year, semester, today).catch(() => ({ data: [] })),
      getLectureTimeTable(year, semester).catch(() => ({ data: [] })),
    ]).then(([todayRes, currentRes, ttRes]) => {
      setTodayCourses(todayRes.data ?? []);
      const lectures = currentRes.data ?? [];
      setCurrentLecture(lectures.length > 0 ? lectures[0] : null);
      setTimetable(ttRes.data ?? []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const attendancePercent = currentLecture ? parseInt(currentLecture.attendancePercent, 10) || 0 : 0;

  return (
    <div className="space-y-8">
      {/* LIVE TRACKING */}
      <section className="bg-zinc-900 rounded-2xl overflow-hidden">
        {currentLecture ? (
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-700">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">LIVE TRACKING</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentLecture.lectureName}</h2>
              <p className="text-sm text-zinc-400 flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" /> {currentLecture.startTime} - {currentLecture.endTime} | {currentLecture.room}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 text-sm">
                <ScanFace className="w-4 h-4 text-primary" />
                <span className="text-zinc-300">상태:</span>
                {attendancePercent >= 75 ? (
                  <span className="text-primary font-semibold">출석 중</span>
                ) : (
                  <span className="text-rose-400 font-semibold">주의</span>
                )}
              </div>
            </div>
            <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center">
              <span className="text-sm font-medium text-zinc-400 block mb-3">현재 착석 상태</span>
              {attendancePercent >= 75 ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <ScanFace className="w-8 h-8 text-primary" />
                  </div>
                  <span className="text-primary font-bold text-lg">착석 확인됨</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center">
                    <ScanFace className="w-8 h-8 text-rose-400" />
                  </div>
                  <span className="text-rose-400 font-bold text-lg">이탈 감지</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 gap-3">
            <ScanFace className="w-10 h-10 text-zinc-600" />
            <p className="text-zinc-400 font-medium text-sm">현재 진행 중인 수업이 없습니다</p>
            <p className="text-zinc-600 text-xs">수업 시간이 되면 실시간으로 내 상태가 표시됩니다</p>
          </div>
        )}
      </section>

      {/* 오늘의 강의 */}
      <section>
        <h2 className="text-lg font-bold text-zinc-900 mb-4">오늘의 강의</h2>
        {todayCourses.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center text-sm text-zinc-400">
            오늘은 예정된 강의가 없습니다
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {todayCourses.map((course) => (
              <div key={course.lectureId} className="bg-white rounded-xl border border-zinc-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md border border-zinc-200 text-xs font-medium text-zinc-600">
                    {course.room}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1">{course.lectureName}</h3>
                <p className="text-sm text-zinc-400">{course.startTime} - {course.endTime}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 주간 시간표 */}
      <section>
        <h2 className="text-lg font-bold text-zinc-900 mb-4">주간 시간표</h2>
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="grid border-b border-zinc-300" style={{ gridTemplateColumns: "36px repeat(7, 1fr)" }}>
            <div className="py-2" />
            {days.map((day) => (
              <div key={day} className="py-2 text-xs font-medium text-zinc-500 text-center truncate px-0.5 border-l border-zinc-200">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.replace("요일", "")}</span>
              </div>
            ))}
          </div>
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: "36px repeat(7, 1fr)",
              gridTemplateRows: `repeat(${hours.length}, 72px)`,
            }}
          >
            {hours.map((hour, rowIdx) => (
              <div
                key={hour}
                className="border-b border-zinc-200 text-[10px] text-zinc-400 flex items-start justify-center pt-1"
                style={{ gridColumn: 1, gridRow: rowIdx + 1 }}
              >
                {String(hour).padStart(2, "0")}
              </div>
            ))}
            {hours.map((_, rowIdx) =>
              days.map((__, colIdx) => (
                <div key={`cell-${rowIdx}-${colIdx}`} className="border-b border-l border-zinc-200" style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 1 }} />
              ))
            )}
            {/* 과목 블록 오버레이 */}
            {(() => {
              const ROW_HEIGHT = 72; // px, gridTemplateRows와 동일
              const GRID_START_MIN = hours[0] * 60; // 08:00 = 480분
              const COL_COUNT = 7;
              // 각 요일별 컬럼 위치를 grid 위에 absolute로 배치
              return timetable.map((course) => {
                const dayIdx = dayMap[course.day] ?? dayMap[course.day.toUpperCase()];
                if (dayIdx === undefined) return null;
                const startMin = parseMinutes(course.startTime);
                const endMin = parseMinutes(course.endTime);
                const topPx = ((startMin - GRID_START_MIN) / 60) * ROW_HEIGHT;
                const heightPx = Math.max(((endMin - startMin) / 60) * ROW_HEIGHT, ROW_HEIGHT / 6);
                // gridColumn은 36px(시간라벨) + 각 요일 칸. CSS grid 위 absolute이므로 left/width를 %로 계산
                // 시간라벨 폭 = 36px, 나머지를 7등분
                return (
                  <div
                    key={`${course.day}-${course.startTime}`}
                    className="absolute px-0.5 py-0.5 z-10"
                    style={{
                      top: `${topPx}px`,
                      height: `${heightPx}px`,
                      left: `calc(36px + ${(dayIdx / COL_COUNT)} * (100% - 36px))`,
                      width: `calc((100% - 36px) / ${COL_COUNT})`,
                    }}
                  >
                    <div className="rounded-md p-1.5 h-full overflow-hidden flex flex-col justify-between bg-teal-100 dark:bg-teal-900 border-l-2 border-primary">
                      <div>
                        <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">{course.lectureName}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-300 truncate leading-tight mt-0.5">{course.room}</p>
                      </div>
                      <span className="self-start px-1.5 py-0.5 rounded text-[10px] font-medium leading-tight bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200">
                        {course.startTime} - {course.endTime}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}
