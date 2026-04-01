import { useState, useEffect } from "react";
import { Clock, ScanFace } from "lucide-react";
import { ProgressBar } from "../../components/ProgressBar";

const todayCourses = [
  { id: 1, code: "G201", name: "알고리즘", professor: "임정택 교수", progress: 14, total: 18, rate: 85 },
  { id: 2, code: "G207", name: "데이터베이스", professor: "마이클 첸 교수", progress: 8, total: 22, rate: 42 },
  { id: 3, code: "G208", name: "데이터 시각화", professor: "엠마 왓슨 교수", progress: 2, total: 16, rate: 12 },
];

const timetableData = [
  { day: 0, startHour: 9, endHour: 11, name: "알고리즘", room: "공학관 201", status: "출석 완료" as const },
  { day: 0, startHour: 13, endHour: 15, name: "인터페이스 디자인", room: "공학관 207", status: "출석 완료" as const },
  { day: 0, startHour: 16, endHour: 17, name: "데이터 시각화", room: "공학관 208", status: "미출석" as const },
  { day: 2, startHour: 10, endHour: 11, name: "데이터 베이스", room: "공학관 201", status: "미출석" as const },
  { day: 2, startHour: 15, endHour: 16, name: "캡스톤 디자인", room: "공학관 211", status: "출석 완료" as const },
  { day: 4, startHour: 10, endHour: 11, name: "창의적 사고", room: "미래관 302", status: "미출석" as const },
  { day: 4, startHour: 13, endHour: 14, name: "네트워크 보안", room: "공학관 208", status: "출석 완료" as const },
];

const days = ["월요일", "화요일", "수요일", "목요일", "금요일"];
const hours = Array.from({ length: 10 }, (_, i) => i + 9);

function getCurrentClass() {
  const now = new Date();
  const jsDay = now.getDay(); // 0=일, 1=월 ... 5=금
  const timetableDay = jsDay - 1; // 0=월 ... 4=금
  const currentHour = now.getHours();
  return timetableData.find(
    (c) => c.day === timetableDay && currentHour >= c.startHour && currentHour < c.endHour
  ) ?? null;
}

export default function StudentHome() {
  // Live tracking state
  const [totalPhotos, setTotalPhotos] = useState(45);
  const [recognizedFaces, setRecognizedFaces] = useState(40);
  const [liveStatus, setLiveStatus] = useState<"present" | "away">("present");
  const [currentClass, setCurrentClass] = useState(() => getCurrentClass());

  // 1분마다 현재 수업 갱신
  useEffect(() => {
    const tick = setInterval(() => setCurrentClass(getCurrentClass()), 60000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (!currentClass) return;
    const interval = setInterval(() => {
      setTotalPhotos((prev) => prev + 1);
      const isAway = Math.random() > 0.8;
      setLiveStatus(isAway ? "away" : "present");
      if (!isAway) {
        setRecognizedFaces((prev) => prev + 1);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [currentClass]);

  const liveRetention = totalPhotos > 0 ? Math.round((recognizedFaces / totalPhotos) * 100) : 0;
  const retentionColorClass = liveRetention >= 90 ? "text-primary" : liveRetention >= 75 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="space-y-8">
      {/* LIVE TRACKING */}
      <section className="bg-zinc-900 rounded-2xl overflow-hidden">
        {currentClass ? (
          <div className="flex flex-col md:flex-row">
            {/* Left side */}
            <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-700">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">LIVE TRACKING</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentClass.name}</h2>
              <p className="text-sm text-zinc-400 flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4" /> {String(currentClass.startHour).padStart(2, "0")}:00 - {String(currentClass.endHour).padStart(2, "0")}:00 | {currentClass.room}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 text-sm">
                <ScanFace className="w-4 h-4 text-primary" />
                <span className="text-zinc-300">상태:</span>
                {liveStatus === "present" ? (
                  <span className="text-primary font-semibold">카메라 인식됨</span>
                ) : (
                  <span className="text-rose-400 font-semibold">자리비움</span>
                )}
              </div>
            </div>
            {/* Right side - Retention */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <span className="text-sm font-medium text-zinc-400 block">실시간 체류율</span>
                  <span className="text-xs text-zinc-500 block mt-1">
                    인식: {recognizedFaces} / {totalPhotos} (총 촬영)
                  </span>
                </div>
                <span className={`text-4xl font-bold ${retentionColorClass}`}>
                  {liveRetention}%
                </span>
              </div>
              <ProgressBar
                value={liveRetention}
                trackColor="bg-zinc-700"
                height="h-3"
                color={liveRetention >= 90 ? "bg-primary" : liveRetention >= 75 ? "bg-amber-400" : "bg-rose-400"}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {todayCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md border border-zinc-200 text-xs font-medium text-zinc-600">
                  {course.code}
                </span>
                <span className="text-2xl font-bold text-zinc-900">{course.rate}%</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">{course.name}</h3>
              <p className="text-sm text-zinc-400 mb-4">{course.professor}</p>
              <ProgressBar value={course.progress} max={course.total} className="mb-2" />
              <div className="flex justify-between text-xs text-zinc-400">
                <span>진도율</span>
                <span>{course.progress}/{course.total} 완료</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 주간 시간표 */}
      <section>
        <h2 className="text-lg font-bold text-zinc-900 mb-4">주간 시간표</h2>
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {/* Header */}
          <div className="grid border-b border-zinc-100" style={{ gridTemplateColumns: "36px repeat(5, 1fr)" }}>
            <div className="py-2 text-xs font-medium text-zinc-400 text-center">-</div>
            {days.map((day) => (
              <div key={day} className="py-2 text-xs font-medium text-zinc-500 text-center truncate px-0.5">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.replace("요일", "")}</span>
              </div>
            ))}
          </div>
          {/* Body */}
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
            {timetableData.map((course) => {
              const rowStart = course.startHour - hours[0] + 1;
              const rowEnd = course.endHour - hours[0] + 1;
              const col = course.day + 2;
              const isAttended = course.status === "출석 완료";
              return (
                <div
                  key={`${course.day}-${course.startHour}`}
                  className="px-0.5 py-0.5 overflow-hidden z-10"
                  style={{ gridColumn: col, gridRow: `${rowStart} / ${rowEnd}` }}
                >
                  <div className={`rounded-md p-1.5 h-full overflow-hidden flex flex-col justify-between ${isAttended ? "bg-primary/15 border-l-2 border-primary" : "bg-[#fff1f2] border-l-2 border-rose-300"}`}>
                    <div>
                      <p className="text-[11px] font-semibold text-zinc-900 truncate leading-tight">{course.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate leading-tight mt-0.5">{course.room}</p>
                    </div>
                    <span className={`self-start px-1.5 py-0.5 rounded text-[10px] font-medium leading-tight ${isAttended ? "bg-zinc-800 text-white" : "bg-rose-500 text-white"}`}>
                      {isAttended ? "출석" : "미출석"}
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
