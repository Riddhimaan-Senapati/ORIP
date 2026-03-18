import Link from "next/link";
import { notFound } from "next/navigation";
import ScoreRing from "@/components/ScoreRing";
import StatusBadge from "@/components/StatusBadge";
import {
  getEmployeeById,
  getFacilityById,
  getRoleById,
  getCertsByEmployee,
  getCertById,
  certifications,
} from "@/lib/data";

export default async function EmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = getEmployeeById(id);
  if (!employee) notFound();

  const facility = getFacilityById(employee.facilityId);
  const role = getRoleById(employee.roleId);
  const empCerts = getCertsByEmployee(employee.id);

  const today = new Date("2026-03-18");

  const expiredCount = empCerts.filter((c) => c.status === "Expired").length;
  const expiringCount = empCerts.filter((c) => c.status === "Expiring Soon").length;
  const activeCount = empCerts.filter((c) => c.status === "Active").length;

  const score = employee.readinessScore;
  const scoreColor = score >= 90 ? "var(--emerald)" : score >= 80 ? "var(--amber)" : "var(--rose)";

  // Required certs for this role
  const requiredCertIds = role?.requiredCertIds ?? [];
  const heldCertIds = empCerts.map((ec) => ec.certId);
  const missingCerts = requiredCertIds.filter((cid) => !heldCertIds.includes(cid));

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 64px" }}>
      {/* Breadcrumb */}
      <div className="animate-fade-up-1" style={{ marginBottom: "24px", display: "flex", gap: "16px" }}>
        <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", textDecoration: "none", letterSpacing: "0.08em" }}>
          Network
        </Link>
        <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>›</span>
        <Link href={`/facility/${facility?.id}`} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)", textDecoration: "none", letterSpacing: "0.08em" }}>
          {facility?.name.split(" ").slice(0, 2).join(" ")}
        </Link>
        <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>›</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
          {employee.firstName} {employee.lastName}
        </span>
      </div>

      {/* Profile header */}
      <div
        className={`card animate-fade-up-2 ${score < 80 ? "card-critical" : score < 90 ? "card-warning" : "card-good"}`}
        style={{ padding: "32px", marginBottom: "32px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            {/* Employee ID */}
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "8px" }}>
              {employee.id} · {employee.employmentStatus}
            </div>

            {/* Name */}
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "30px", color: "var(--text-primary)", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              {employee.firstName} {employee.lastName}
            </h1>

            {/* Role & facility */}
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "16px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              {role?.title ?? employee.roleId}
            </div>

            {/* Meta tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { label: "Facility", value: facility?.name.split(" ").slice(0, 2).join(" ") ?? "—" },
                { label: "Dept", value: employee.department },
                { label: "Hire Date", value: employee.hireDate },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)" }}>{m.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)" }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <ScoreRing score={score} size={100} label="Readiness" />

            {/* Mini stats */}
            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 500, color: "var(--emerald)" }}>{activeCount}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Active</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 500, color: "var(--amber)" }}>{expiringCount}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Soon</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 500, color: expiredCount > 0 ? "var(--rose)" : "var(--text-dim)" }}>{expiredCount}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Expired</div>
              </div>
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)" }}>
              Readiness Score — {activeCount} of {requiredCertIds.length} required certs active
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500, color: scoreColor }}>
              {score}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: "6px" }}>
            <div
              className="progress-fill"
              style={{ width: `${score}%`, background: scoreColor, boxShadow: `0 0 8px ${scoreColor}` }}
            />
          </div>
        </div>
      </div>

      {/* Certifications table */}
      <div className="animate-fade-up-3" style={{ marginBottom: "32px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "12px" }}>
          Certifications ({empCerts.length})
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Certification</th>
                <th>Issuing Body</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Days Left</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {empCerts
                .sort((a, b) => {
                  const order = { Expired: 0, "Expiring Soon": 1, Active: 2 };
                  return order[a.status] - order[b.status];
                })
                .map((ec) => {
                  const cert = getCertById(ec.certId);
                  const expDate = new Date(ec.expiryDate);
                  const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const daysColor =
                    daysLeft < 0 ? "var(--rose)" : daysLeft < 60 ? "var(--amber)" : "var(--emerald)";

                  return (
                    <tr
                      key={ec.recordId}
                      style={{
                        background:
                          ec.status === "Expired"
                            ? "rgba(244,63,94,0.04)"
                            : ec.status === "Expiring Soon"
                            ? "rgba(245,158,11,0.04)"
                            : "transparent",
                      }}
                    >
                      <td>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px" }}>
                          {cert?.name ?? ec.certId}
                        </div>
                        {cert?.isRegulatoryRequirement && (
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.08em", marginTop: "2px" }}>
                            REGULATORY REQUIREMENT
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)" }}>
                        {cert?.issuingBody}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}>
                        {ec.issueDate}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: ec.status === "Expired" ? "var(--rose)" : "var(--text-secondary)" }}>
                        {ec.expiryDate}
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 500, color: daysColor }}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={ec.status} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Missing certs */}
      {missingCerts.length > 0 && (
        <div className="animate-fade-up-4">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--rose)", boxShadow: "0 0 6px var(--rose)" }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--rose)" }}>
              Missing Required Certifications
            </div>
          </div>
          <div className="card card-critical" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {missingCerts.map((cid) => {
                const cert = certifications.find((c) => c.id === cid);
                return (
                  <div
                    key={cid}
                    style={{
                      background: "var(--rose-dim)",
                      border: "1px solid rgba(244,63,94,0.3)",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--rose)",
                    }}
                  >
                    {cert?.name ?? cid}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
