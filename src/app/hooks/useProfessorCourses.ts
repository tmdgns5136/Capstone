import { useState, useEffect } from "react";
import { getLectures, Lecture } from "../api/lecture";
import { useAuth } from "./useAuth";

export type Course = Lecture;

// 🌟 [수정 1] 외부에서 semester 값을 받을 수 있도록 파라미터 추가
export function useProfessorCourses(semester?: string) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, role, userName } = useAuth();

  useEffect(() => {
    async function loadCourses() {
      if (!isAuthenticated) return; // 인증 안 됐으면 실행 안 함

      setLoading(true);
      setError(null);

      try {
        // 🌟 [수정 2] 백엔드 요청 시 semester 값을 같이 넘겨줍니다!
        const response = await getLectures(semester);

        if (response.success){
          setCourses(response.data);
        }
      } catch (err) {
        setError("강의 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }
    
    loadCourses();
    
  // 🌟 [수정 3] 의존성 배열에 semester 추가 (학기가 바뀔 때마다 다시 실행)
  }, [isAuthenticated, role, semester]); 

  return {
    courses, 
    professorName: userName, 
    loading,
    error
  };
}