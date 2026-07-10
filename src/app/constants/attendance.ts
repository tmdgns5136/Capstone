export const ATTENDANCE_STATUS = {
  PRESENT: "출석",
  LATE: "지각",
  ABSENT: "결석",
  APPROVED_ABSENT: "공결",
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  [ATTENDANCE_STATUS.PRESENT]: "bg-primary/20 text-primary-dark dark:bg-emerald-900 dark:text-emerald-300",
  [ATTENDANCE_STATUS.LATE]: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  [ATTENDANCE_STATUS.ABSENT]: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  [ATTENDANCE_STATUS.APPROVED_ABSENT]: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
};

export const ABSENCE_CATEGORIES = ["병가", "예비군", "경조사", "기타"] as const;
export type AbsenceCategory = (typeof ABSENCE_CATEGORIES)[number];

export const QA_CATEGORIES = ["전체", "시험", "과제", "출석"] as const;
