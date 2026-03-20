import Link from "next/link";
import ScoreRing from "@/components/ScoreRing";
import { getNetworkPageData } from "@/lib/osdk-queries";
import type { Facility, Department, Employee, EmployeeCertification } from "@/lib/data";

export const dynamic = "force-dynamic";

function FacilityCard({
  facility,
  delay,
  allEmployees,
  allCerts,
  allDepts,
}: {
  facility: Facility;
  delay: string;
  allEmployees: Employee[];
  allCerts: EmployeeCertification[];
  allDepts: Department[];
}) {
  const score = facility.readinessScore;
  const isRed = score < 80;
  const isYellow = score >= 80 && score < 90;
  const cardClass = isRed ? "card card-critical" : isYellow ? "card card-warning" : "card card-good";

  const depts = allDepts.filter((d) => d.facilityId === facility.id);
  const emps = allEmployees.filter((e) => e.facilityId === facility.id);
  const certs = allCerts.filter((ec) =>
    emps.some((e) => e.id === ec.employeeId)
  );
  const expiredCount = certs.filter((c) => c.status === "Expired").length;
  const expiringSoonCount = certs.filter((c) => c.status === "Expiring Soon").length;

  return (
    <Link
      href={`/facility/${facility.id}`}
      style={{ textDecoration: "none" }}
      className={`animate-fade-up-${delay}`}
    >
      <div
        className={cardClass}
        style={{
          padding: "28px",
          cursor: "pointer",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: "var(--text-dim)",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              {facility.type} · {facility.bedCount} beds
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "18px",
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {facility.name}
            </h2>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              {facility.address}
            </div>
          </div>
          <ScoreRing score={score} size={72} label="Readiness" />
        </div>

        {/* Department bar chart */}
        <div style={{ marginBottom: "20px" }}>
          {depts.map((dept) => {
            const dColor =
              dept.readinessScore >= 90
                ? "var(--emerald)"
                : dept.readinessScore >= 80
                ? "var(--amber)"
                : "var(--rose)";
            return (
              <div key={dept.name} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {dept.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: dColor,
                      fontWeight: 500,
                    }}
                  >
                    {dept.readinessScore}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${dept.readinessScore}%`,
                      background: dColor,
                      boxShadow: `0 0 6px ${dColor}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer stats */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <Stat label="Staff" value={emps.length} />
          <Stat label="Expired" value={expiredCount} color={expiredCount > 0 ? "var(--rose)" : undefined} />
          <Stat label="Expiring Soon" value={expiringSoonCount} color={expiringSoonCount > 0 ? "var(--amber)" : undefined} />
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "18px",
          fontWeight: 500,
          color: color ?? "var(--text-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-dim)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginTop: "3px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default async function NetworkDashboard() {
  const { facilities, employees, employeeCertifications, departments } = await getNetworkPageData();

  const totalEmployees = employees.length;
  const expired = employeeCertifications.filter((ec) => ec.status === "Expired").length;
  const expiringSoon = employeeCertifications.filter((ec) => ec.status === "Expiring Soon").length;
  const avgReadiness =
    employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + e.readinessScore, 0) / employees.length)
      : 0;
  const stats = { totalEmployees, expired, expiringSoon, avgReadiness };

  // Critical employees (score < 80)
  const criticalEmployees = employees
    .filter((e) => e.readinessScore < 80)
    .sort((a, b) => a.readinessScore - b.readinessScore)
    .slice(0, 5);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 64px" }}>
      {/* Page header */}
      <div className="animate-fade-up-1" style={{ marginBottom: "40px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--cyan)",
            marginBottom: "8px",
          }}
        >
          Network Overview
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "36px",
            color: "var(--text-primary)",
            margin: "0 0 8px",
            letterSpacing: "-0.01em",
          }}
        >
          Workforce Readiness
        </h1>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
          Real-time certification and compliance status across {facilities.length} facilities
        </p>
      </div>

      {/* KPI bar */}
      <div
        className="animate-fade-up-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {[
          { label: "Network Readiness", value: `${stats.avgReadiness}%`, sub: "avg score", color: stats.avgReadiness >= 90 ? "var(--emerald)" : stats.avgReadiness >= 80 ? "var(--amber)" : "var(--rose)" },
          { label: "Clinical Staff", value: stats.totalEmployees, sub: "active employees", color: "var(--cyan)" },
          { label: "Expired Certs", value: stats.expired, sub: "require immediate action", color: stats.expired > 0 ? "var(--rose)" : "var(--emerald)" },
          { label: "Expiring Soon", value: stats.expiringSoon, sub: "within 60 days", color: stats.expiringSoon > 0 ? "var(--amber)" : "var(--emerald)" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="card"
            style={{ padding: "20px 24px" }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
                marginBottom: "10px",
              }}
            >
              {kpi.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "32px",
                fontWeight: 500,
                color: kpi.color,
                lineHeight: 1,
                marginBottom: "4px",
              }}
            >
              {kpi.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-secondary)",
              }}
            >
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Facility cards */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--text-dim)",
          marginBottom: "16px",
        }}
      >
        Facilities — click to drill down
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "48px",
        }}
      >
        {facilities.map((facility, i) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            delay={String(i + 3)}
            allEmployees={employees}
            allCerts={employeeCertifications}
            allDepts={departments}
          />
        ))}
      </div>

      {/* Critical staff table */}
      <div className="animate-fade-up-6">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--rose)",
              boxShadow: "0 0 8px var(--rose)",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--rose)",
            }}
          >
            Critical Risk — Staff Below 80% Readiness
          </div>
        </div>
        <div className="card card-critical">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Facility</th>
                <th>Department</th>
                <th>Readiness</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {criticalEmployees.map((emp) => {
                const fac = facilities.find((f) => f.id === emp.facilityId);
                const scoreColor =
                  emp.readinessScore < 50 ? "var(--rose)" : "var(--amber)";
                return (
                  <tr key={emp.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {emp.firstName} {emp.lastName}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {emp.roleId.replace("ROLE-", "")}
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                      {fac?.name.split(" ").slice(0, 2).join(" ")}
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                      {emp.department}
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontWeight: 500,
                          color: scoreColor,
                          fontSize: "15px",
                        }}
                      >
                        {emp.readinessScore}%
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/employee/${emp.id}`}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          color: "var(--cyan)",
                          textDecoration: "none",
                          padding: "4px 10px",
                          border: "1px solid rgba(0,210,255,0.25)",
                          borderRadius: "4px",
                          background: "rgba(0,210,255,0.07)",
                          transition: "all 0.15s",
                        }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
