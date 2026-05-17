import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import { useProfessorCourses, Course } from "./useProfessorCourses";
import { startLecture, endLecture, getTodayLectures } from "../api/lecture";
import { getAttendanceMonitoring } from "../api/attendance";

interface AttendanceData {
  present: number;
  away: number;
  absent: number;
  total: number;
}

interface ClassSimulatorState {
  courses: Course[];
  coursesLoading: boolean;
  selectedCourse: Course | null;
  scheduledCourse: Course | null;
  setSelectedCourse: (course: Course) => void;
  isActive: boolean;
  elapsedTime: number;
  lastCaptureTime: Date | null;
  attendanceData: AttendanceData;
  startSimulation: () => Promise<void>;
  stopSimulation: () => Promise<void>;
  triggerSensorPing: () => Promise<void>;
}

const ClassSimulatorContext = createContext<ClassSimulatorState | null>(null);

const DAY_MAP: Record<string, number> = { "일": 0, "월": 1, "화": 2, "수": 3, "목": 4, "금": 5, "토": 6 };

function parseSchedule(schedule: string): { day: number; startH: number; startM: number; endH: number; endM: number } | null {
  const match = schedule.match(/^([\uAC00-\uD7AF])\s*(\d{1,2}):(\d{2})\s*[-~]\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const day = DAY_MAP[match[1]];
  if (day === undefined) return null;
  return { day, startH: +match[2], startM: +match[3], endH: +match[4], endM: +match[5] };
}

function findCurrentCourse(courses: Course[]): Course | null {
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const course of courses) {
    const parsed = parseSchedule(course.schedule);
    if (!parsed) continue;
    if (parsed.day === currentDay) {
      const start = parsed.startH * 60 + parsed.startM;
      const end = parsed.endH * 60 + parsed.endM;
      if (currentMinutes >= start && currentMinutes < end) return course;
    }
  }
  return null;
}

function toNumberId(lectureId: string | number): number {
  return typeof lectureId === "number" ? lectureId : Number(lectureId);
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ClassSimulatorProvider({ children }: { children: ReactNode }) {
  const { courses, loading: coursesLoading } = useProfessorCourses();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [scheduledCourse, setScheduledCourse] = useState<Course | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastCaptureTime, setLastCaptureTime] = useState<Date | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({ present: 0, away: 0, absent: 0, total: 0 });

  useEffect(() => {
    if (courses.length === 0) return;
    const check = () => {
      const found = findCurrentCourse(courses);
      setScheduledCourse(found);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [courses]);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      const current = findCurrentCourse(courses);
      setSelectedCourse(current || courses[0]);
    }
  }, [courses, selectedCourse]);

  useEffect(() => {
    if (!selectedCourse || isActive) return;
    const total = selectedCourse.students || 0;
    setAttendanceData({ present: 0, away: 0, absent: total, total });
  }, [selectedCourse, isActive]);

  const refreshAttendanceData = useCallback(async () => {
    if (!selectedCourse) return;

    try {
      const response = await getAttendanceMonitoring(String(selectedCourse.lectureId), {
        date: getTodayString(),
      });

      const data = response.data;
      const total = data.students?.length || selectedCourse.students || 0;
      const present = Number(data.attendance ?? 0);
      const away = Number((data as any).away ?? 0);
      const absent = Number(data.absent ?? Math.max(total - present - away, 0));

      setAttendanceData({
        present,
        away,
        absent,
        total,
      });

      setLastCaptureTime(new Date());
    } catch {
      const total = selectedCourse.students || 0;

      setAttendanceData((prev) => ({
        ...prev,
        total,
        absent: prev.present > 0 ? prev.absent : total,
      }));

      setLastCaptureTime(new Date());
    }
  }, [selectedCourse]);

  const syncLectureRuntimeState = useCallback(async () => {
    if (!selectedCourse) return;

    try {
      const response = await getTodayLectures();

      if (!response.success) return;

      const todayLecture = response.data.find(
          (lecture) => String(lecture.lectureId) === String(selectedCourse.lectureId)
      );

      const active = todayLecture?.status === "IN_PROGRESS";

      setIsActive(active);

      if (active) {
        setLastCaptureTime((prev) => prev ?? new Date());
        await refreshAttendanceData();
      }
    } catch {
      // 오늘 강의 조회 실패는 화면 전체를 막지 않음
    }
  }, [selectedCourse, refreshAttendanceData]);

  const startSimulation = useCallback(async () => {
    if (!selectedCourse) return;
    const lectureId = toNumberId(selectedCourse.lectureId);
    if (!lectureId) {
      toast.error("강의 ID를 확인할 수 없습니다.");
      return;
    }

    try {
      await startLecture(lectureId);
      setIsActive(true);
      setElapsedTime(0);
      setLastCaptureTime(new Date());
      setAttendanceData({
        present: 0,
        away: 0,
        absent: selectedCourse.students || 0,
        total: selectedCourse.students || 0,
      });
      await refreshAttendanceData();
      toast.success(`${selectedCourse.name} 강의가 시작되었습니다.`);
    } catch (error: any) {
      toast.error(error.message || "강의 시작에 실패했습니다.");
    }
  }, [selectedCourse, refreshAttendanceData]);

  const stopSimulation = useCallback(async () => {
    if (!selectedCourse) return;
    const lectureId = toNumberId(selectedCourse.lectureId);
    if (!lectureId) {
      toast.error("강의 ID를 확인할 수 없습니다.");
      return;
    }

    try {
      await endLecture(lectureId);
      setIsActive(false);
      await refreshAttendanceData();
      toast.success("강의가 종료되었습니다. 출결 데이터가 서버에 반영됩니다.");
    } catch (error: any) {
      toast.error(error.message || "강의 종료 처리에 실패했습니다.");
    }
  }, [selectedCourse, refreshAttendanceData]);

  const triggerSensorPing = useCallback(async () => {
    await refreshAttendanceData();
  }, [refreshAttendanceData]);

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    refreshAttendanceData();
    const timer = setInterval(() => {
      refreshAttendanceData();
    }, 5000);
    return () => clearInterval(timer);
  }, [isActive, refreshAttendanceData]);

  useEffect(() => {
    if (!selectedCourse) return;

    syncLectureRuntimeState();

    const timer = setInterval(() => {
      syncLectureRuntimeState();
    }, 10000);

    return () => clearInterval(timer);
  }, [selectedCourse, syncLectureRuntimeState]);

  return (
    <ClassSimulatorContext.Provider
      value={{
        courses,
        coursesLoading,
        selectedCourse,
        scheduledCourse,
        setSelectedCourse,
        isActive,
        elapsedTime,
        lastCaptureTime,
        attendanceData,
        startSimulation,
        stopSimulation,
        triggerSensorPing,
      }}
    >
      {children}
    </ClassSimulatorContext.Provider>
  );
}

export function useClassSimulator() {
  const ctx = useContext(ClassSimulatorContext);
  if (!ctx) throw new Error("useClassSimulator must be used within ClassSimulatorProvider");
  return ctx;
}
