type Props = {
  status: string;
  size?: "sm" | "md";
};

function getColors(status: string) {
  if (status === "Active") return { bg: "rgba(16,185,129,0.12)", color: "#10b981", dot: "#10b981" };
  if (status === "Expiring Soon") return { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", dot: "#f59e0b" };
  if (status === "Expired") return { bg: "rgba(244,63,94,0.12)", color: "#f43f5e", dot: "#f43f5e" };
  return { bg: "rgba(226,234,255,0.07)", color: "rgba(226,234,255,0.5)", dot: "rgba(226,234,255,0.3)" };
}

export default function StatusBadge({ status, size = "md" }: Props) {
  const { bg, color, dot } = getColors(status);
  const fontSize = size === "sm" ? "10px" : "11px";
  const padding = size === "sm" ? "3px 8px" : "4px 10px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: bg,
        color,
        fontFamily: "var(--font-mono)",
        fontSize,
        letterSpacing: "0.06em",
        fontWeight: 500,
        padding,
        borderRadius: "4px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: dot,
          boxShadow: `0 0 4px ${dot}`,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}
