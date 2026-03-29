import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import { useProfessorCourses, Course } from "./useProfessorCourses";

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
  startSimulation: () => void;
  stopSimulation: () => void;
  triggerSensorPing: () => void;
}

const ClassSimulatorContext = createContext<ClassSimulatorState | null>(null);

const DAY_MAP: Record<string, number> = { "일": 0, "월": 1, "화": 2, "수": 3, "목": 4, "금": 5, "토": 6 };

function parseSchedule(schedule: string): { day: number; startH: number; startM: number; endH: number; endM: number } | null {
  // "월 09:00-10:30" 형태 파싱
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

export function ClassSimulatorProvider({ children }: { children: ReactNode }) {
  const { courses, loading: coursesLoading } = useProfessorCourses();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [scheduledCourse, setScheduledCourse] = useState<Course | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastCaptureTime, setLastCaptureTime] = useState<Date | null>(null);

  const totalStudents = selectedCourse?.students || 40;
  const intervalMs = 5000;

  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    present: 0,
    away: 0,
    absent: totalStudents,
    total: totalStudents,
  });

  // 시간표 기반 자동 매칭 (1분마다 갱신)
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

  // 초기 선택: 시간표 매칭 강의가 있으면 그것, 없으면 첫 번째
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      const current = findCurrentCourse(courses);
      setSelectedCourse(current || courses[0]);
    }
  }, [courses, selectedCourse]);

  const triggerSensorPing = useCallback(() => {
    setLastCaptureTime(new Date());
    setAttendanceData((prev) => {
      const presentToAway = Math.floor(Math.random() * (prev.present * 0.1));
      const awayToPresent = Math.floor(Math.random() * (prev.away * 0.3 + 1));
      return {
        ...prev,
        present: prev.present - presentToAway + awayToPresent,
        away: prev.away + presentToAway - awayToPresent,
      };
    });
  }, []);

  const startSimulation = useCallback(() => {
    if (!selectedCourse) return;
    setIsActive(true);
    setElapsedTime(0);
    const initialPresent = Math.floor(totalStudents * 0.9);
    setAttendanceData({
      present: initialPresent,
      away: 0,
      absent: totalStudents - initialPresent,
      total: totalStudents,
    });
    setLastCaptureTime(new Date());
    toast.success(`${selectedCourse.name} 실시간 모니터링이 시작되었습니다.`);
    toast.info("라즈베리파이 센서와 연동 대기 중...");
  }, [selectedCourse, totalStudents]);

  const stopSimulation = useCallback(() => {
    setIsActive(false);
    toast.success("강의가 종료되었습니다. 전체 체류율 기반 출결이 산정됩니다.");
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const next = prev + 1;
        if (next % (intervalMs / 1000) === 0) triggerSensorPing();
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, intervalMs, triggerSensorPing]);

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
