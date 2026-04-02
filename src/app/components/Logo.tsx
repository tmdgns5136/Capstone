interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: "text-base", gap: "gap-1.5" },
    md: { icon: 24, text: "text-lg", gap: "gap-2" },
    lg: { icon: 32, text: "text-2xl", gap: "gap-2.5" },
  };

  const s = sizes[size];

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      {/* ScanFace-inspired icon */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Corner brackets */}
        <path
          d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-zinc-400"
        />
        {/* Face dots - eyes */}
        <circle cx="9" cy="10" r="1.25" className="fill-primary" />
        <circle cx="15" cy="10" r="1.25" className="fill-primary" />
        {/* Scan line */}
        <line
          x1="6"
          y1="15"
          x2="18"
          y2="15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>
      {/* Text */}
      <span className={`${s.text} font-bold tracking-tight`}>
        <span className="text-primary">A</span>
        <span className="text-zinc-900">SaaS</span>
      </span>
    </span>
  );
}
