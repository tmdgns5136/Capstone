interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  trackColor?: string;
  height?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = "bg-primary",
  trackColor = "bg-zinc-100",
  height = "h-2",
  className = "",
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className={`w-full ${trackColor} rounded-full ${height} ${className}`}>
      <div
        className={`${height} rounded-full ${color} transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
