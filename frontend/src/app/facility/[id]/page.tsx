import Link from "next/link";
import { notFound } from "next/navigation";
import ScoreRing from "@/components/ScoreRing";
import StatusBadge from "@/components/StatusBadge";
import { getFacilityPageData } from "@/lib/osdk-queries";

export default async function FacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getFacilityPageData(id);
  if (!data) notFound();

  const { facility, departments: depts, facilityEmployees, facilityCerts, certMap, roleMap } = data;

  // Upcoming expirations (within 90 days from today)
  const today = new Date();
  const in90 = new Date(today);
  in90.setDate(in90.getDate() + 90);

  const upcomingExp = facilityCerts
    .filter((ec) => {
      const exp = new Date(ec.expiryDate);
      return exp >= today && exp <= in90;
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    .slice(0, 8);

  const criticalEmployees = facilityEmployees
    .filter((e) => e.readinessScore < 80)
    .sort((a, b) => a.readinessScore - b.readinessScore);

  const isRed = facility.readinessScore < 80;
  const isYellow = facility.readinessScore >= 80 && facility.readinessScore < 90;

  const expiredCount = facilityCerts.filter((c) => c.status === "Expired").length;
  const expiringCount = facilityCerts.filter((c) => c.status === "Expiring Soon").length;

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 64px" }}>
      {/* Breadcrumb */}
      <div className="animate-fade-up-1" style={{ marginBottom: "24px" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-dim)",
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          ← Network Overview
        </Link>
      </div>

      {/* Header */}
      <div
        className="animate-fade-up-2"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "40px",
          gap: "24px",
        }}
      >
        <div>
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
            {facility.id} · {facility.type}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "32px",
              color: "var(--text-primary)",
              margin: "0 0 6px",
            }}
          >
            {facility.name}
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
            {facility.address} · {facility.bedCount} beds · Accreditation: {facility.accreditationStatus}
          </p>
        </div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <ScoreRing score={facility.readinessScore} size={96} label="Readiness" />
        </div>
      </div>

      {/* Stats row */}
      <div
        className="animate-fade-up-3"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {[
          { label: "Total Staff", value: facilityEmployees.length, color: "var(--cyan)" },
          { label: "Departments", value: depts.length, color: "var(--text-primary)" },
          { label: "Expired Certs", value: expiredCount, color: expiredCount > 0 ? "var(--rose)" : "var(--emerald)" },
          { label: "Expiring Soon", value: expiringCount, color: expiringCount > 0 ? "var(--amber)" : "var(--emerald)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "18px 22px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "8px" }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
        {/* Department breakdown */}
        <div className="animate-fade-up-4">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "12px" }}>
            Department Readiness
          </div>
          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            {depts.map((dept, i) => {
              const dColor =
                dept.readinessScore >= 90 ? "var(--emerald)" : dept.readinessScore >= 80 ? "var(--amber)" : "var(--rose)";
              const deptEmps = facilityEmployees.filter((e) => e.department === dept.name);
              return (
                <div
                  key={dept.name}
                  style={{
                    padding: "16px 20px",
                    borderBottom: i < depts.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                        {dept.name}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)", marginLeft: "8px" }}>
                        {deptEmps.length} staff
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "16px", color: dColor }}>
                      {dept.readinessScore}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${dept.readinessScore}%`, background: dColor, boxShadow: `0 0 6px ${dColor}` }}
                    />
                  </div>
                  {(dept.expiredCount > 0 || dept.expiringCount > 0) && (
                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      {dept.expiredCount > 0 && (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--rose)" }}>
                          {dept.expiredCount} expired
                        </span>
                      )}
                      {dept.expiringCount > 0 && (
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--amber)" }}>
                          {dept.expiringCount} expiring soon
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming expirations */}
        <div className="animate-fade-up-4">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "12px" }}>
            Upcoming Expirations (Next 90 Days)
          </div>
          <div className={`card ${upcomingExp.length > 0 ? "card-warning" : ""}`} style={{ overflow: "hidden" }}>
            {upcomingExp.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-dim)" }}>
                No upcoming expirations
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Certification</th>
                    <th>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingExp.map((ec) => {
                    const emp = facilityEmployees.find((e) => e.id === ec.employeeId);
                    const cert = certMap.get(ec.certId);
                    const daysLeft = Math.ceil(
                      (new Date(ec.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr key={ec.recordId}>
                        <td>
                          <Link href={`/employee/${ec.employeeId}`} style={{ textDecoration: "none", color: "var(--cyan)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px" }}>
                            {emp?.firstName} {emp?.lastName}
                          </Link>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)" }}>
                          {cert?.name.split("(")[0].trim()}
                        </td>
                        <td>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--amber)" }}>
                            {daysLeft}d
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Critical staff */}
      {criticalEmployees.length > 0 && (
        <div className="animate-fade-up-5">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--rose)", boxShadow: "0 0 8px var(--rose)" }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--rose)" }}>
              Critical Risk Staff
            </div>
          </div>
          <div className="card card-critical">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Readiness</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {criticalEmployees.map((emp) => {
                  const role = roleMap?.get(emp.roleId);
                  const empCerts = facilityCerts.filter((c) => c.employeeId === emp.id);
                  const expired = empCerts.filter((c) => c.status === "Expired").length;
                  return (
                    <tr key={emp.id}>
                      <td>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
                          {emp.firstName} {emp.lastName}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)" }}>
                        {role?.title ?? emp.roleId}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{emp.department}</td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "15px", color: emp.readinessScore < 50 ? "var(--rose)" : "var(--amber)" }}>
                          {emp.readinessScore}%
                        </span>
                        {expired > 0 && (
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--rose)", marginLeft: "8px" }}>
                            ({expired} expired)
                          </span>
                        )}
                      </td>
                      <td>
                        <Link href={`/employee/${emp.id}`} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", textDecoration: "none", padding: "4px 10px", border: "1px solid rgba(0,210,255,0.25)", borderRadius: "4px", background: "rgba(0,210,255,0.07)" }}>
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
      )}

      {/* All staff */}
      <div className="animate-fade-up-6" style={{ marginTop: "40px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "12px" }}>
          All Staff ({facilityEmployees.length})
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Dept</th>
                <th>Hire Date</th>
                <th>Readiness</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {facilityEmployees
                .sort((a, b) => a.readinessScore - b.readinessScore)
                .map((emp) => {
                  const role = roleMap?.get(emp.roleId);
                  const sc = emp.readinessScore;
                  const scoreColor = sc >= 90 ? "var(--emerald)" : sc >= 80 ? "var(--amber)" : "var(--rose)";
                  return (
                    <tr key={emp.id}>
                      <td>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
                          {emp.firstName} {emp.lastName}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)" }}>
                        {role?.title ?? emp.roleId}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{emp.department}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}>
                        {emp.hireDate}
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: scoreColor }}>
                          {sc}%
                        </span>
                      </td>
                      <td>
                        <Link href={`/employee/${emp.id}`} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--cyan)", textDecoration: "none" }}>
                          →
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
