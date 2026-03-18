"use client";

type Props = {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
};

function getColor(score: number) {
  if (score >= 90) return "#10b981";
  if (score >= 80) return "#f59e0b";
  return "#f43f5e";
}

export default function ScoreRing({ score, size = 80, strokeWidth = 6, label }: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = getColor(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(226, 234, 255, 0.07)"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
              animation: "ring-fill 1s cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          />
        </svg>
        {/* Center text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: size > 60 ? "18px" : "13px",
              color,
              lineHeight: 1,
            }}
          >
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(226, 234, 255, 0.35)",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
