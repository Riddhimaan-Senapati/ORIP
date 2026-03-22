"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RenewModalProps {
  recordId: string;
  certName: string;
  onClose: () => void;
}

interface AddCertModalProps {
  employeeId: string;
  allCertifications: { id: string; name: string }[];
  onClose: () => void;
}

interface FlagBannerProps {
  employeeId: string;
  isFlagged: boolean;
}

// ─── Server action helpers ────────────────────────────────────────────────────
// These call the Next.js server action which invokes the Foundry OSDK action type.

async function applyRenewCertification(recordId: string, issueDate: string, expiryDate: string) {
  const res = await fetch("/api/actions/renew-certification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recordId, issueDate, expiryDate }),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function applyFlagEmployee(employeeId: string, reviewNotes: string) {
  const res = await fetch("/api/actions/flag-employee", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, reviewNotes }),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function applyAddCertification(
  employeeId: string,
  certId: string,
  issueDate: string,
  expiryDate: string
) {
  const res = await fetch("/api/actions/add-certification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, certId, issueDate, expiryDate }),
  });
  if (!res.ok) throw new Error(await res.text());
}

// ─── Renew Certification Modal ────────────────────────────────────────────────

export function RenewCertButton({ recordId, certName }: { recordId: string; certName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--emerald)",
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: "4px",
          padding: "3px 8px",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        Renew
      </button>
      {open && (
        <RenewModal recordId={recordId} certName={certName} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function RenewModal({ recordId, certName, onClose }: RenewModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expiryDate) { setError("Expiry date is required"); return; }
    setError("");
    startTransition(async () => {
      try {
        await applyRenewCertification(recordId, issueDate, expiryDate);
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to renew certification.");
      }
    });
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--bg-surface)", border: "1px solid var(--border-strong)",
          borderRadius: "12px", padding: "28px", width: "400px", maxWidth: "90vw",
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--emerald)", marginBottom: "8px" }}>
          Renew Certification
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px", color: "var(--text-primary)", margin: "0 0 20px" }}>
          {certName}
        </h3>
        <form onSubmit={handleSubmit}>
          <FieldGroup label="Issue Date">
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} style={inputStyle} />
          </FieldGroup>
          <FieldGroup label="New Expiry Date">
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={inputStyle} required />
          </FieldGroup>
          {error && <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--rose)", marginBottom: "16px" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={isPending} style={submitBtnStyle(isPending)}>
              {isPending ? "Saving…" : "Renew Certification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Flag Employee Banner ─────────────────────────────────────────────────────

export function FlagEmployeeButton({ employeeId, isFlagged }: FlagBannerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");

  function handleFlag(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await applyFlagEmployee(employeeId, notes);
      router.refresh();
      setOpen(false);
    });
  }

  if (isFlagged) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "6px" }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--amber)", boxShadow: "0 0 6px var(--amber)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--amber)" }}>Flagged for compliance review</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--amber)",
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "6px", padding: "6px 14px", cursor: "pointer", transition: "all 0.15s",
        }}
      >
        ⚑ Flag for Review
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "12px", padding: "28px", width: "400px", maxWidth: "90vw" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", marginBottom: "8px" }}>Flag for Review</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px", color: "var(--text-primary)", margin: "0 0 20px" }}>Add compliance review note</h3>
            <form onSubmit={handleFlag}>
              <FieldGroup label="Review Notes (optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the compliance concern..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </FieldGroup>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setOpen(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" disabled={isPending} style={{ ...submitBtnStyle(isPending), background: isPending ? "var(--bg-elevated)" : "rgba(245,158,11,0.8)" }}>
                  {isPending ? "Saving…" : "Flag Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Add Certification Modal ──────────────────────────────────────────────────

export function AddCertButton({
  employeeId,
  allCertifications,
}: {
  employeeId: string;
  allCertifications: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)",
          background: "rgba(0,210,255,0.07)", border: "1px solid rgba(0,210,255,0.25)",
          borderRadius: "6px", padding: "6px 14px", cursor: "pointer", transition: "all 0.15s",
        }}
      >
        + Add Certification
      </button>
      {open && (
        <AddCertModal
          employeeId={employeeId}
          allCertifications={allCertifications}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function AddCertModal({ employeeId, allCertifications, onClose }: AddCertModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [certId, setCertId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!certId || !expiryDate) { setError("All fields are required"); return; }
    setError("");
    startTransition(async () => {
      try {
        await applyAddCertification(employeeId, certId, issueDate, expiryDate);
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add certification.");
      }
    });
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "12px", padding: "28px", width: "420px", maxWidth: "90vw" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cyan)", marginBottom: "8px" }}>New Certification</div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px", color: "var(--text-primary)", margin: "0 0 20px" }}>Add Certification Record</h3>
        <form onSubmit={handleSubmit}>
          <FieldGroup label="Certification">
            <select value={certId} onChange={(e) => setCertId(e.target.value)} style={inputStyle} required>
              <option value="">Select certification…</option>
              {allCertifications.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FieldGroup>
          <FieldGroup label="Issue Date">
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} style={inputStyle} required />
          </FieldGroup>
          <FieldGroup label="Expiry Date">
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={inputStyle} required />
          </FieldGroup>
          {error && <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--rose)", marginBottom: "16px" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={isPending} style={submitBtnStyle(isPending)}>
              {isPending ? "Saving…" : "Add Certification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Shared style helpers ─────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "8px 12px",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-primary)",
  outline: "none",
  boxSizing: "border-box",
};

const cancelBtnStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  color: "var(--text-secondary)",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "8px 16px",
  cursor: "pointer",
};

const submitBtnStyle = (disabled: boolean): React.CSSProperties => ({
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  color: "white",
  background: disabled ? "var(--bg-elevated)" : "linear-gradient(135deg, #00d2ff 0%, #0066ff 100%)",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  cursor: disabled ? "not-allowed" : "pointer",
  boxShadow: disabled ? "none" : "0 0 12px rgba(0,210,255,0.3)",
  transition: "all 0.2s",
});
