"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Network" },
  { href: "/advisor", label: "AI Advisor" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: "rgba(8, 13, 26, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0, 210, 255, 0.12)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #00d2ff 0%, #0066ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(0, 210, 255, 0.35)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" fill="white" />
                <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "15px",
                  letterSpacing: "0.08em",
                  color: "#e2eaff",
                  lineHeight: 1,
                }}
              >
                ORIP
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "rgba(226, 234, 255, 0.35)",
                  letterSpacing: "0.12em",
                  marginTop: "2px",
                }}
              >
                WORKFORCE READINESS
              </div>
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "13px",
                  letterSpacing: "0.04em",
                  color: active ? "#00d2ff" : "rgba(226, 234, 255, 0.6)",
                  textDecoration: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  background: active ? "rgba(0, 210, 255, 0.1)" : "transparent",
                  border: active ? "1px solid rgba(0, 210, 255, 0.2)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Status indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "rgba(226, 234, 255, 0.4)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px #10b981",
              display: "inline-block",
            }}
          />
          LIVE · 25 STAFF · 3 FACILITIES
        </div>
      </div>
    </nav>
  );
}
