"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";

const SUGGESTIONS = [
  "What are the biggest compliance gaps across the network?",
  "Which staff have expired ACLS certifications?",
  "Who is fully certified and available for shift coverage?",
  "What's the readiness score for each facility?",
  "Show me certifications expiring in the next 30 days",
  "Which department has the most compliance risk?",
];

function AssistantIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" fill="white" />
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2 7h10M7 2l5 5-5 5"
        stroke={active ? "white" : "var(--text-dim)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageContent({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          )
        );

        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", paddingLeft: "4px" }}>
              <span style={{ color: "var(--cyan)", flexShrink: 0, marginTop: "1px" }}>›</span>
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
      })}
    </div>
  );
}

export default function AdvisorPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/advisor",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello. I'm the **ORIP Clinical Readiness Advisor**, grounded in live Foundry ontology data across all 3 facilities and 25 staff members.\n\nAsk me anything about certification compliance, readiness scores, staffing gaps, or shift coverage.",
      },
    ],
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleSuggestion(text: string) {
    append({ role: "user", content: text });
  }

  const canSend = input.trim().length > 0 && !isLoading;

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
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--cyan)",
            marginBottom: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--cyan)",
              boxShadow: "0 0 6px var(--cyan)",
            }}
          />
          Foundry Ontology Grounded · Live Data
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "28px",
            color: "var(--text-primary)",
            margin: "0 0 4px",
          }}
        >
          Clinical Readiness Advisor
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            margin: 0,
          }}
        >
          AI responses grounded in live certification and workforce data from Palantir Foundry
        </p>
      </div>

      {/* Suggestion chips */}
      <div
        className="animate-fade-up-2"
        style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", flexShrink: 0 }}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            disabled={isLoading}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-secondary)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              opacity: isLoading ? 0.5 : 1,
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,210,255,0.3)";
                (e.currentTarget as HTMLElement).style.color = "var(--cyan)";
              }
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
                boxShadow: msg.role === "assistant" ? "0 0 12px rgba(0,210,255,0.2)" : "none",
              }}
            >
              {msg.role === "assistant" ? (
                <AssistantIcon />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  U
                </span>
              )}
            </div>

            {/* Bubble */}
            <div
              style={{
                maxWidth: "78%",
                padding: "14px 18px",
                borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                background:
                  msg.role === "user" ? "rgba(0,210,255,0.08)" : "var(--bg-surface)",
                border: `1px solid ${
                  msg.role === "user" ? "rgba(0,210,255,0.18)" : "var(--border)"
                }`,
                fontFamily: "var(--font-display)",
                fontSize: "14px",
                lineHeight: 1.65,
              }}
            >
              {msg.role === "user" ? (
                <p style={{ margin: 0, color: "var(--text-primary)" }}>{msg.content}</p>
              ) : (
                <MessageContent text={msg.content} />
              )}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--text-dim)",
                  marginTop: "8px",
                  textAlign: msg.role === "user" ? "right" : "left",
                  letterSpacing: "0.06em",
                }}
              >
                {msg.role === "assistant" ? "ORIP ADVISOR · FOUNDRY" : "YOU"} ·{" "}
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {isLoading && (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #00d2ff 0%, #0066ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 12px rgba(0,210,255,0.2)",
                flexShrink: 0,
              }}
            >
              <AssistantIcon />
            </div>
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "4px 12px 12px 12px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                display: "flex",
                gap: "5px",
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
                    opacity: 0.5,
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
        <form onSubmit={handleSubmit}>
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
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
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
              type="submit"
              disabled={!canSend}
              style={{
                background: canSend
                  ? "linear-gradient(135deg, #00d2ff 0%, #0066ff 100%)"
                  : "var(--bg-elevated)",
                border: "none",
                borderRadius: "8px",
                width: "40px",
                height: "40px",
                cursor: canSend ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
                boxShadow: canSend ? "0 0 16px rgba(0,210,255,0.3)" : "none",
              }}
            >
              <SendIcon active={canSend} />
            </button>
          </div>
        </form>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--text-dim)",
            textAlign: "center",
            marginTop: "8px",
            letterSpacing: "0.06em",
          }}
        >
          Responses grounded in live Foundry ontology data · Enter to send
        </div>
      </div>
    </div>
  );
}
