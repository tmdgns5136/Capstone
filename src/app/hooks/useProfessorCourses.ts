import { useState, useEffect } from "react";
import { getLectures, Lecture } from "../api/lecture";
import { useAuth } from "./useAuth";

export type Course = Lecture;

export function useProfessorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, role, userName } = useAuth();

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      setError(null);

      try {
        const response = await getLectures();

        if (response.success){
          setCourses(response.data);
        }
      } catch (err) {
        console.error("데이터 로드 실패:", err);
        setError("강의 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [isAuthenticated, role]);

  return {
    courses, 
    professorName: userName, 
    loading,
    error
  };
}
