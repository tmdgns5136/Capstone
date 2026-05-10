/**
 * 현재 날짜 기준 학기 정보를 동적으로 계산하는 유틸리티
 */

const now = new Date();

/** 현재 연도 */
export const CURRENT_YEAR = now.getFullYear();

/** 현재 학기 ("1학기" 또는 "2학기") — 7월 기준 분기 */
export const CURRENT_SEMESTER = now.getMonth() + 1 >= 7 ? "2학기" : "1학기";

/** 현재 학기 번호 ("1" 또는 "2") */
export const CURRENT_SEMESTER_NUM = now.getMonth() + 1 >= 7 ? "2" : "1";

/** "2026학년도 1학기" 형태 */
export const CURRENT_SEMESTER_LABEL = `${CURRENT_YEAR}학년도 ${CURRENT_SEMESTER}`;

/** "2026년 1학기" 형태 */
export const CURRENT_SEMESTER_LABEL_SHORT = `${CURRENT_YEAR}년 ${CURRENT_SEMESTER}`;

/** "2026-1" 형태 */
export const CURRENT_SEMESTER_CODE = `${CURRENT_YEAR}-${CURRENT_SEMESTER_NUM}`;

/** 이전 학기 코드 ("2025-2" 또는 "2026-1") */
export const PREV_SEMESTER_CODE = CURRENT_SEMESTER_NUM === "1"
  ? `${CURRENT_YEAR - 1}-2`
  : `${CURRENT_YEAR}-1`;

/** 이전 학기 라벨 */
export const PREV_SEMESTER_LABEL = CURRENT_SEMESTER_NUM === "1"
  ? `${CURRENT_YEAR - 1}학년도 2학기`
  : `${CURRENT_YEAR}학년도 1학기`;

/** 학기 선택 드롭다운용 옵션 목록 */
export const SEMESTER_OPTIONS = [
  { value: CURRENT_SEMESTER_CODE, label: CURRENT_SEMESTER_LABEL },
  { value: PREV_SEMESTER_CODE, label: PREV_SEMESTER_LABEL },
] as const;

/** 학기 시작일 (1학기: 3월 첫째주 월요일, 2학기: 9월 첫째주 월요일) */
export function getSemesterStartDate(year: number = CURRENT_YEAR, semesterNum: string = CURRENT_SEMESTER_NUM): Date {
  const month = semesterNum === "1" ? 2 : 8; // 0-indexed: 2=March, 8=September
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  // 첫 번째 월요일 찾기
  const mondayOffset = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  return new Date(year, month, 1 + mondayOffset);
}
