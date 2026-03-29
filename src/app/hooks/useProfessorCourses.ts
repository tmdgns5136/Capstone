import { useState, useEffect } from "react";

export interface Course {
  id: number;
  name: string;
  students: number;
  schedule: string;
  room?: string;
}

const KIM_COURSES = [
  { id: 1, name: "데이터베이스", students: 45, schedule: "월 09:00-10:30", room: "공학관 301" },
  { id: 2, name: "인공지능", students: 38, schedule: "월 13:00-14:30", room: "공학관 405" },
  { id: 3, name: "컴퓨터네트워크", students: 42, schedule: "화 10:00-11:30", room: "IT관 201" },
  { id: 4, name: "C프로그래밍1", students: 55, schedule: "목 14:00-16:00", room: "공학관 203" },
];

const LEE_COURSES = [
  { id: 11, name: "운영체제", students: 50, schedule: "월 10:00-12:00", room: "공학관 101" },
  { id: 12, name: "이산수학", students: 40, schedule: "수 13:00-14:30", room: "공학관 102" },
  { id: 13, name: "파이썬프로그래밍", students: 60, schedule: "금 09:00-11:00", room: "IT관 301" },
];

const PARK_COURSES = [
  { id: 21, name: "컴퓨터네트워크", students: 42, schedule: "화 10:00-11:30", room: "IT관 201" },
  { id: 22, name: "C프로그래밍1", students: 55, schedule: "목 14:00-16:00", room: "공학관 203" },
];

export function useProfessorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [professorName, setProfessorName] = useState("교수님");

  useEffect(() => {
    async function loadCourses() {
      // Always load demo courses
      setCourses(KIM_COURSES);
      setProfessorName("김교수 (데모)");
      setLoading(false);
    }
    loadCourses();
  }, []);

  return { courses, professorName, loading };
}
