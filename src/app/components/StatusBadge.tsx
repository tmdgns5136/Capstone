import { ATTENDANCE_STATUS_COLORS } from "../constants/attendance";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colors = ATTENDANCE_STATUS_COLORS[status] ?? "bg-zinc-100 text-zinc-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${colors} ${className}`}>
      {status}
    </span>
  );
}
