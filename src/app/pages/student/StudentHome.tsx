import { useState, useEffect } from "react";
import { Clock, ScanFace, Loader2 } from "lucide-react";
import { ProgressBar } from "../../components/ProgressBar";
import {
  getTodayCourses,
  getCurrentLecture,
  getLectureTimeTable,
  type CourseData,
  type CourseStateData,
  type LectureTimeTable,
} from "../../api/studentLecture";

const days = ["월요일", "화요일", "수요일", "목요일", "금요일"];
const dayMap: Record<string, number> = { "MONDAY": 0, "TUESDAY": 1, "WEDNESDAY": 2, "THURSDAY": 3, "FRIDAY": 4, "월": 0, "화": 1, "수": 2, "목": 3, "금": 4 };
const hours = Array.from({ length: 10 }, (_, i) => i + 9);

function getTodayString() {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[new Date().getDay()];
}

function parseHour(time: string) {
  return parseInt(time.split(":")[0], 10);
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
  const retentionColorClass = attendancePercent >= 90 ? "text-primary" : attendancePercent >= 75 ? "text-amber-400" : "text-rose-400";

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
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <span className="text-sm font-medium text-zinc-400 block">실시간 체류율</span>
                </div>
                <span className={`text-4xl font-bold ${retentionColorClass}`}>
                  {attendancePercent}%
                </span>
              </div>
              <ProgressBar
                value={attendancePercent}
                trackColor="bg-zinc-700"
                height="h-3"
                color={attendancePercent >= 90 ? "bg-primary" : attendancePercent >= 75 ? "bg-amber-400" : "bg-rose-400"}
              />
              <p className="text-xs text-zinc-500 mt-2 text-right">※ 75% 미만 시 지각/결석 처리</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 gap-3">
            <ScanFace className="w-10 h-10 text-zinc-600" />
            <p className="text-zinc-400 font-medium text-sm">현재 진행 중인 수업이 없습니다</p>
            <p className="text-zinc-600 text-xs">수업 시간이 되면 실시간 출석 현황이 표시됩니다</p>
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
          <div className="grid border-b border-zinc-100" style={{ gridTemplateColumns: "36px repeat(5, 1fr)" }}>
            <div className="py-2 text-xs font-medium text-zinc-400 text-center">-</div>
            {days.map((day) => (
              <div key={day} className="py-2 text-xs font-medium text-zinc-500 text-center truncate px-0.5">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.replace("요일", "")}</span>
              </div>
            ))}
          </div>
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: "36px repeat(5, 1fr)",
              gridTemplateRows: `repeat(${hours.length}, 72px)`,
            }}
          >
            {hours.map((hour, rowIdx) => (
              <div
                key={hour}
                className="border-b border-zinc-50 text-[10px] text-zinc-400 flex items-center justify-center"
                style={{ gridColumn: 1, gridRow: rowIdx + 1 }}
              >
                {String(hour).padStart(2, "0")}
              </div>
            ))}
            {hours.map((_, rowIdx) =>
              days.map((__, colIdx) => (
                <div key={`cell-${rowIdx}-${colIdx}`} className="border-b border-zinc-50" style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 1 }} />
              ))
            )}
            {timetable.map((course) => {
              const dayIdx = dayMap[course.day] ?? dayMap[course.day.toUpperCase()];
              if (dayIdx === undefined) return null;
              const startHour = parseHour(course.startTime);
              const endHour = parseHour(course.endTime);
              const rowStart = startHour - hours[0] + 1;
              const rowEnd = endHour - hours[0] + 1;
              const col = dayIdx + 2;
              return (
                <div
                  key={`${course.day}-${course.startTime}`}
                  className="px-0.5 py-0.5 overflow-hidden z-10"
                  style={{ gridColumn: col, gridRow: `${rowStart} / ${rowEnd}` }}
                >
                  <div className="rounded-md p-1.5 h-full overflow-hidden flex flex-col justify-between bg-primary/15 border-l-2 border-primary">
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-900 truncate leading-tight">{course.lectureName}</p>
                      <p className="text-[10px] text-zinc-400 truncate leading-tight mt-0.5">{course.room}</p>
                    </div>
                    <span className="self-start px-1.5 py-0.5 rounded text-[10px] font-medium leading-tight bg-zinc-100 text-zinc-600">
                      {course.startTime} - {course.endTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
