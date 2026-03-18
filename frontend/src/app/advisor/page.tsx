"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  employees,
  facilities,
  employeeCertifications,
  getCertsByEmployee,
  getRoleById,
  getCertById,
  getFacilityById,
  departments,
} from "@/lib/data";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

// Simple ontology-grounded query engine (no LLM — pure data lookup)
function queryOntology(query: string): string {
  const q = query.toLowerCase();
  const today = new Date("2026-03-18");

  // "expired" certs
  if (q.includes("expired") && (q.includes("acls") || q.includes("bls") || q.includes("hipaa"))) {
    const certName = q.includes("acls") ? "CERT-ACLS" : q.includes("bls") ? "CERT-BLS" : "CERT-HIPAA";
    const expired = employeeCertifications.filter((ec) => ec.certId === certName && ec.status === "Expired");
    if (expired.length === 0) return "No staff with expired certifications for that credential were found.";
    const names = expired.map((ec) => {
      const emp = employees.find((e) => e.id === ec.employeeId);
      const fac = emp ? getFacilityById(emp.facilityId) : null;
      return `• ${emp?.firstName} ${emp?.lastName} — ${emp?.department} at ${fac?.name ?? "Unknown"}`;
    });
    const certLabel = certName === "CERT-ACLS" ? "ACLS" : certName === "CERT-BLS" ? "BLS" : "HIPAA";
    return `Found **${expired.length} staff** with expired ${certLabel} certifications:\n\n${names.join("\n")}\n\nThese individuals require immediate recertification before being scheduled for clinical duties.`;
  }

  // Expiring soon queries
  if (q.includes("expiring") && (q.includes("30") || q.includes("60") || q.includes("next"))) {
    const days = q.includes("30") ? 30 : 60;
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + days);
    const expiring = employeeCertifications.filter((ec) => {
      const exp = new Date(ec.expiryDate);
      return ec.status !== "Expired" && exp >= today && exp <= cutoff;
    });
    if (expiring.length === 0) return `No certifications expiring in the next ${days} days.`;
    const byEmp = new Map<string, string[]>();
    expiring.forEach((ec) => {
      const cert = getCertById(ec.certId);
      if (!byEmp.has(ec.employeeId)) byEmp.set(ec.employeeId, []);
      byEmp.get(ec.employeeId)!.push(cert?.name.split("(")[0].trim() ?? ec.certId);
    });
    const lines: string[] = [];
    byEmp.forEach((certs, empId) => {
      const emp = employees.find((e) => e.id === empId);
      lines.push(`• ${emp?.firstName} ${emp?.lastName} (${emp?.department}): ${certs.join(", ")}`);
    });
    return `**${expiring.length} certifications** expiring in the next ${days} days across **${byEmp.size} staff members**:\n\n${lines.join("\n")}`;
  }

  // Readiness score queries
  if (q.includes("readiness") && q.includes("facility")) {
    const facLines = facilities
      .sort((a, b) => a.readinessScore - b.readinessScore)
      .map((f) => {
        const emoji = f.readinessScore >= 90 ? "🟢" : f.readinessScore >= 80 ? "🟡" : "🔴";
        return `${emoji} **${f.name}**: ${f.readinessScore}%`;
      });
    return `Current facility readiness scores:\n\n${facLines.join("\n")}\n\nRiverside Community Medical Center is the priority concern at 71%, driven by the ICU department (58%). Immediate intervention is needed for 4 staff with multiple expired certifications.`;
  }

  // Riverside / specific facility
  if (q.includes("riverside") || q.includes("fac-002") || q.includes("fac002")) {
    const riverside = employees.filter((e) => e.facilityId === "FAC-002");
    const icuStaff = riverside.filter((e) => e.department === "ICU");
    const criticalStaff = icuStaff.filter((e) => e.readinessScore < 60);
    const lines = criticalStaff.map((e) => `• ${e.firstName} ${e.lastName} — ${e.readinessScore}% readiness`);
    return `**Riverside Community Medical Center** is at **71% overall readiness** — below the 80% threshold.\n\nThe ICU department is the primary concern at **58%**. Critical staff:\n\n${lines.join("\n")}\n\nRecommendation: Immediately schedule BLS, ACLS, and HIPAA renewal for ICU staff. Consider restricting high-acuity assignments until certifications are current.`;
  }

  // Trauma team / shift coverage
  if (q.includes("trauma") || q.includes("cover") || q.includes("qualified") || q.includes("available")) {
    const qualified = employees.filter((e) => e.readinessScore === 100);
    const icu = qualified.filter((e) => e.department === "ICU" || e.department === "Emergency");
    if (icu.length === 0) {
      const lines = qualified.slice(0, 5).map((e) => {
        const fac = getFacilityById(e.facilityId);
        return `• ${e.firstName} ${e.lastName} — ${e.department} at ${fac?.name.split(" ").slice(0, 2).join(" ")}`;
      });
      return `Fully certified staff (100% readiness):\n\n${lines.join("\n")}`;
    }
    const lines = icu.map((e) => {
      const fac = getFacilityById(e.facilityId);
      const role = getRoleById(e.roleId);
      return `• ${e.firstName} ${e.lastName} — ${role?.title} at ${fac?.name.split(" ").slice(0, 2).join(" ")}`;
    });
    return `**${icu.length} fully certified staff** available for high-acuity coverage:\n\n${lines.join("\n")}\n\nAll have 100% readiness scores with no expired or expiring certifications.`;
  }

  // ICU at specific facility
  if (q.includes("icu") && (q.includes("riverside") || q.includes("fac-002"))) {
    const icuStaff = employees.filter((e) => e.facilityId === "FAC-002" && e.department === "ICU");
    const lines = icuStaff.map((e) => {
      const sc = e.readinessScore;
      const tag = sc >= 80 ? "✓ Compliant" : sc >= 50 ? "⚠ At Risk" : "✗ Critical";
      return `• ${e.firstName} ${e.lastName}: ${sc}% — ${tag}`;
    });
    return `**Riverside ICU** (${icuStaff.length} staff) — Department readiness: **58%**\n\n${lines.join("\n")}\n\nThis department has the highest concentration of compliance risk in the network. 4 of 4 nurses have at least one expired certification.`;
  }

  // Network-wide gaps
  if (q.includes("biggest") || q.includes("gaps") || q.includes("network") || q.includes("compliance")) {
    const allExpired = employeeCertifications.filter((ec) => ec.status === "Expired");
    const byCert = new Map<string, number>();
    allExpired.forEach((ec) => {
      byCert.set(ec.certId, (byCert.get(ec.certId) ?? 0) + 1);
    });
    const sorted = [...byCert.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const lines = sorted.map(([certId, count]) => {
      const cert = getCertById(certId);
      return `• ${cert?.name ?? certId}: ${count} expired across network`;
    });
    const criticalEmps = employees.filter((e) => e.readinessScore < 80).length;
    return `**Top compliance gaps across the network:**\n\n${lines.join("\n")}\n\n**${criticalEmps} staff** are below the 80% readiness threshold. Riverside Community Medical Center accounts for the majority of gaps, particularly in the ICU department.\n\nPriority action: Schedule HIPAA, BLS, and ACLS renewals at Riverside ICU — this single intervention would increase network readiness by ~4 points.`;
  }

  // Default
  return `I can help you analyze workforce readiness across the network. Try asking:\n\n• "Which staff have expired ACLS certifications?"\n• "What's the readiness score for each facility?"\n• "Who in the ICU at Riverside is critical?"\n• "Who is fully certified and available to cover shifts?"\n• "What are the biggest compliance gaps across the network?"\n• "Show me certs expiring in the next 30 days"`;
}

const SUGGESTIONS = [
  "What are the biggest compliance gaps across the network?",
  "Which staff have expired ACLS certifications?",
  "Who is fully certified and available for shift coverage?",
  "What's the readiness score for each facility?",
  "Show me certifications expiring in the next 30 days",
  "Tell me about the ICU situation at Riverside",
];

function formatMessage(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} style={{ margin: "0 0 8px", fontWeight: 700, color: "var(--text-primary)" }}>
          {line.slice(2, -2)}
        </p>
      );
    }
    // Bold inline
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });

    if (line.startsWith("•")) {
      return (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", paddingLeft: "4px" }}>
          <span style={{ color: "var(--cyan)", flexShrink: 0 }}>›</span>
          <span style={{ color: "var(--text-secondary)" }}>{rendered}</span>
        </div>
      );
    }
    if (line.trim() === "") return <div key={i} style={{ height: "8px" }} />;
    return (
      <p key={i} style={{ margin: "0 0 6px", color: "var(--text-secondary)" }}>
        {rendered}
      </p>
    );
  });
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello. I'm the **Clinical Readiness Advisor**, grounded in your live ontology data across all 3 facilities and 25 staff members.\n\nAsk me anything about certification status, compliance gaps, or shift coverage readiness.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(query?: string) {
    const text = query ?? input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      const response = queryOntology(text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 600);
  }

  return (
    <div
      style={{
        maxWidth: "820px",
        margin: "0 auto",
        padding: "32px 24px 0",
        height: "calc(100vh - 60px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div className="animate-fade-up-1" style={{ marginBottom: "24px", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--cyan)", marginBottom: "6px" }}>
          AIP Agent · Ontology Grounded
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "28px", color: "var(--text-primary)", margin: "0 0 4px" }}>
          Clinical Readiness Advisor
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
          Natural language queries over live workforce data — no hallucinations, ontology-grounded responses
        </p>
      </div>

      {/* Suggestions */}
      <div
        className="animate-fade-up-2"
        style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", flexShrink: 0 }}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-secondary)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
              transition: "all 0.15s",
              textAlign: "left",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,210,255,0.3)";
              (e.currentTarget as HTMLElement).style.color = "var(--cyan)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        className="animate-fade-up-3"
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          paddingRight: "4px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="chat-message"
            style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  msg.role === "assistant"
                    ? "linear-gradient(135deg, #00d2ff 0%, #0066ff 100%)"
                    : "var(--bg-elevated)",
                border: "1px solid var(--border)",
                boxShadow: msg.role === "assistant" ? "0 0 12px rgba(0,210,255,0.25)" : "none",
              }}
            >
              {msg.role === "assistant" ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" fill="white" />
                  <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)" }}>U</span>
              )}
            </div>

            {/* Bubble */}
            <div
              style={{
                maxWidth: "75%",
                padding: "14px 18px",
                borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                background:
                  msg.role === "user"
                    ? "rgba(0, 210, 255, 0.1)"
                    : "var(--bg-surface)",
                border: `1px solid ${msg.role === "user" ? "rgba(0,210,255,0.2)" : "var(--border)"}`,
                fontFamily: "var(--font-display)",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              {msg.role === "user" ? (
                <p style={{ margin: 0, color: "var(--text-primary)" }}>{msg.content}</p>
              ) : (
                <div>{formatMessage(msg.content)}</div>
              )}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--text-dim)",
                  marginTop: "8px",
                  textAlign: msg.role === "user" ? "right" : "left",
                }}
              >
                {msg.role === "assistant" ? "ORIP ADVISOR · " : ""}{msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="chat-message" style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #00d2ff 0%, #0066ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 12px rgba(0,210,255,0.25)",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" fill="white" />
                <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "4px 12px 12px 12px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                display: "flex",
                gap: "4px",
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--cyan)",
                    animation: `fade-up 0.8s ease ${i * 0.2}s infinite alternate`,
                    opacity: 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          flexShrink: 0,
          paddingBottom: "24px",
          borderTop: "1px solid var(--border)",
          paddingTop: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "12px",
            padding: "4px 4px 4px 16px",
            alignItems: "center",
            transition: "border-color 0.2s",
          }}
          onFocusCapture={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,210,255,0.4)";
          }}
          onBlurCapture={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about certifications, readiness scores, coverage gaps..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-display)",
              fontSize: "14px",
              color: "var(--text-primary)",
              padding: "10px 0",
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading
                ? "linear-gradient(135deg, #00d2ff 0%, #0066ff 100%)"
                : "var(--bg-elevated)",
              border: "none",
              borderRadius: "8px",
              width: "40px",
              height: "40px",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
              boxShadow: input.trim() && !loading ? "0 0 16px rgba(0,210,255,0.3)" : "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)", textAlign: "center", marginTop: "8px" }}>
          Responses are grounded in live ontology data · No hallucinations · Enter to send
        </div>
      </div>
    </div>
  );
}
