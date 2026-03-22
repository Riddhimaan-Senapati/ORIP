import { unstable_noStore as noStore } from "next/cache";
import { getFoundryClient } from "./foundry";

// Dynamic import — same reason as foundry.ts: Turbopack bundles static imports
// and evaluates them immediately, triggering module-level OSDK initialization.
let _sdk: typeof import("@orip-frontend/sdk") | undefined;
async function getSdk() {
  if (!_sdk) _sdk = await import("@orip-frontend/sdk");
  return _sdk;
}
import type { Facility, Employee, EmployeeCertification, Certification, Department, Role } from "./data";
import { facilities as mockFacilities, roles as mockRoles } from "./data";

// ─── Raw OSDK fetchers ────────────────────────────────────────────────────────

async function fetchRawFacilities() {
  noStore();
  const [client, { facility: $facility }] = await Promise.all([getFoundryClient(), getSdk()]);
  const { data } = await client($facility).fetchPage({ $pageSize: 50 });
  return data;
}

async function fetchRawEmployees() {
  noStore();
  const [client, { employee: $employee }] = await Promise.all([getFoundryClient(), getSdk()]);
  const { data } = await client($employee).fetchPage({ $pageSize: 500 });
  return data;
}

async function fetchRawEmpCerts() {
  noStore();
  const [client, { employeeCertification: $empCert }] = await Promise.all([getFoundryClient(), getSdk()]);
  const { data } = await client($empCert).fetchPage({ $pageSize: 500 });
  return data;
}

async function fetchRawCertifications() {
  noStore();
  const [client, { certification: $certification }] = await Promise.all([getFoundryClient(), getSdk()]);
  const { data } = await client($certification).fetchPage({ $pageSize: 100 });
  return data;
}

async function fetchRawRoles() {
  noStore();
  const [client, { role: $role }] = await Promise.all([getFoundryClient(), getSdk()]);
  const { data } = await client($role).fetchPage({ $pageSize: 50 });
  return data;
}

// ─── Type mappers ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEmployee(e: any): Employee {
  const rawFacilityId: string = e.facilityId ?? "";
  // Normalize FAC-001 → FAC-0001 (old dataset uses 3-digit, mockFacilities uses 4-digit)
  const facilityId = rawFacilityId.replace(/^([A-Za-z]+-?)(\d+)$/, (_, prefix: string, num: string) =>
    `${prefix}${num.padStart(4, "0")}`
  );
  return {
    id: e.employeeId ?? "",
    firstName: e.firstName ?? "",
    lastName: e.lastName ?? "",
    roleId: e.roleId ?? "",
    facilityId,
    department: e.department ?? "",
    hireDate: e.hireDate ?? "",
    employmentStatus: e.employmentStatus ?? "Active",
    readinessScore: e.readinessScore ?? 0,
    // flaggedForReview and reviewNotes are edit-only props added in SDK v0.2.0
    flaggedForReview: e.flaggedForReview ?? false,
    reviewNotes: e.reviewNotes ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEmpCert(ec: any): EmployeeCertification {
  const expiryDate = ec.expirationDate ?? "";
  // Always recompute status from expiration date — the stored value is stale
  // (it was set at dataset upload time and never refreshed).
  const daysLeft = expiryDate
    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86_400_000)
    : 9999;
  const status: "Active" | "Expiring Soon" | "Expired" =
    daysLeft < 0 ? "Expired" : daysLeft < 60 ? "Expiring Soon" : "Active";
  return {
    recordId: ec.recordId ?? "",
    employeeId: ec.employeeId ?? "",
    certId: ec.certId ?? "",
    issueDate: ec.issueDate ?? "",
    expiryDate,
    status,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCertification(c: any): Certification {
  return {
    id: c.certId ?? "",
    name: c.certName ?? "",
    issuingBody: c.issuingBody ?? "",
    validityMonths: c.validityMonths ?? 24,
    isRegulatoryRequirement: c.isMandatory ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRole(r: any): Role {
  // requiredCertIds come from roleCert join table — populated from mockRoles until roleCert
  // object type is merged and SDK is regenerated with the new type.
  const mock = mockRoles.find((m) => m.id === (r.roleId ?? ""));
  return {
    id: r.roleId ?? "",
    title: r.title ?? r.roleId ?? "",
    department: r.department ?? "",
    requiredCertIds: mock?.requiredCertIds ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toFacility(f: any, employees: Employee[]): Facility {
  const emps = employees.filter((e) => e.facilityId === f.facilityId);
  const readinessScore =
    emps.length > 0
      ? Math.round(emps.reduce((sum, e) => sum + e.readinessScore, 0) / emps.length)
      : 0;
  return {
    id: f.facilityId ?? "",
    name: f.name ?? "",
    address: f.address ?? "",
    type: f.type ?? "",
    bedCount: f.bedCount ?? 0,
    accreditationStatus: f.accreditationStatus ?? "",
    readinessScore,
  };
}

// Compute readiness live from active certs vs role-required certs.
// The stored readinessScore in the Foundry dataset is always 0 (not pre-computed).
function computeReadinessScore(
  emp: Employee,
  certs: EmployeeCertification[],
  roleMap: Map<string, Role>
): number {
  const required = roleMap.get(emp.roleId)?.requiredCertIds ?? [];
  if (required.length === 0) return 100;
  // Count both Active and Expiring Soon — cert is still valid, just needs renewal
  const activeCertIds = certs
    .filter((c) => c.employeeId === emp.id && (c.status === "Active" || c.status === "Expiring Soon"))
    .map((c) => c.certId);
  const matched = required.filter((r) => activeCertIds.includes(r));
  return Math.round((matched.length / required.length) * 100);
}

function computeDepartments(
  employees: Employee[],
  certs: EmployeeCertification[]
): Department[] {
  const byKey = new Map<
    string,
    { facilityId: string; scores: number[]; expired: number; expiring: number }
  >();

  for (const emp of employees) {
    const key = `${emp.facilityId}::${emp.department}`;
    if (!byKey.has(key)) {
      byKey.set(key, { facilityId: emp.facilityId, scores: [], expired: 0, expiring: 0 });
    }
    const d = byKey.get(key)!;
    d.scores.push(emp.readinessScore);
    for (const c of certs.filter((c) => c.employeeId === emp.id)) {
      if (c.status === "Expired") d.expired++;
      else if (c.status === "Expiring Soon") d.expiring++;
    }
  }

  return [...byKey.entries()].map(([key, d]) => ({
    name: key.split("::")[1],
    facilityId: d.facilityId,
    readinessScore: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
    employeeCount: d.scores.length,
    expiredCount: d.expired,
    expiringCount: d.expiring,
  }));
}

// ─── Page-level query functions ───────────────────────────────────────────────

export async function getNetworkPageData() {
  const [rawEmployees, rawCerts, rawRoles] = await Promise.all([
    fetchRawEmployees(),
    fetchRawEmpCerts(),
    fetchRawRoles(),
  ]);

  const employees = rawEmployees.map(toEmployee);
  const employeeCertifications = rawCerts.map(toEmpCert);
  const roles = rawRoles.map(toRole);

  // Override stored readinessScore with live computation from certifications
  const roleMap = new Map(roles.map((r) => [r.id, r]));
  for (const emp of employees) {
    emp.readinessScore = computeReadinessScore(emp, employeeCertifications, roleMap);
  }

  // Diagnostic: log first employee's score breakdown
  if (employees.length > 0) {
    const sample = employees[0];
    const sampleRole = roleMap.get(sample.roleId);
    const sampleActiveCerts = employeeCertifications
      .filter((c) => c.employeeId === sample.id && c.status === "Active")
      .map((c) => c.certId);
    console.log("[osdk-queries] sample employee:", sample.id, sample.roleId,
      "| facilityId:", sample.facilityId,
      "| roleFound:", !!sampleRole,
      "| requiredCerts:", sampleRole?.requiredCertIds,
      "| activeCerts:", sampleActiveCerts,
      "| score:", sample.readinessScore,
      "| totalCerts:", employeeCertifications.length,
      "| totalRoles:", roles.length);
  }

  // Facility metadata from Foundry (FAC-0001/0002/0003 now match employee facilityId).
  // Readiness scores are computed live from OSDK employee data.
  const facilities: Facility[] = mockFacilities.map((f) => ({
    ...f,
    readinessScore: (() => {
      const emps = employees.filter((e) => e.facilityId === f.id);
      return emps.length > 0
        ? Math.round(emps.reduce((sum, e) => sum + e.readinessScore, 0) / emps.length)
        : 0;
    })(),
  }));

  const departments = computeDepartments(employees, employeeCertifications);

  return { facilities, employees, employeeCertifications, departments, roles };
}

export async function getFacilityPageData(facilityId: string) {
  const mockFacility = mockFacilities.find((f) => f.id === facilityId);
  if (!mockFacility) return null;

  const [rawEmployees, rawCerts, rawCertifications, rawRoles] = await Promise.all([
    fetchRawEmployees(),
    fetchRawEmpCerts(),
    fetchRawCertifications(),
    fetchRawRoles(),
  ]);

  const employees = rawEmployees.map(toEmployee);
  const allCerts = rawCerts.map(toEmpCert);
  const allCertifications = rawCertifications.map(toCertification);
  const roles = rawRoles.map(toRole);

  // Override stored readinessScore with live computation from certifications
  const roleMap = new Map(roles.map((r) => [r.id, r]));
  for (const emp of employees) {
    emp.readinessScore = computeReadinessScore(emp, allCerts, roleMap);
  }

  const facilityEmployees = employees.filter((e) => e.facilityId === facilityId);
  const facilityCerts = allCerts.filter((ec) =>
    facilityEmployees.some((e) => e.id === ec.employeeId)
  );

  const readinessScore =
    facilityEmployees.length > 0
      ? Math.round(facilityEmployees.reduce((sum, e) => sum + e.readinessScore, 0) / facilityEmployees.length)
      : 0;
  const facility: Facility = { ...mockFacility, readinessScore };

  const departments = computeDepartments(facilityEmployees, facilityCerts);
  const certMap = new Map(allCertifications.map((c) => [c.id, c]));
  // roleMap already built above for score computation — reuse it

  return { facility, departments, facilityEmployees, facilityCerts, certMap, roleMap };
}

export async function getEmployeePageData(employeeId: string) {
  const [rawEmployees, rawCerts, rawCertifications, rawRoles] = await Promise.all([
    fetchRawEmployees(),
    fetchRawEmpCerts(),
    fetchRawCertifications(),
    fetchRawRoles(),
  ]);

  const employees = rawEmployees.map(toEmployee);
  const allCerts = rawCerts.map(toEmpCert);
  const allCertifications = rawCertifications.map(toCertification);
  const roles = rawRoles.map(toRole);

  // Override stored readinessScore with live computation from certifications
  const roleMap = new Map(roles.map((r) => [r.id, r]));
  for (const emp of employees) {
    emp.readinessScore = computeReadinessScore(emp, allCerts, roleMap);
  }

  const employee = employees.find((e) => e.id === employeeId);
  if (!employee) return null;

  const role = roles.find((r) => r.id === employee.roleId);

  const mockFacility = mockFacilities.find((f) => f.id === employee.facilityId);
  const facility: Facility | undefined = mockFacility
    ? {
        ...mockFacility,
        readinessScore: (() => {
          const emps = employees.filter((e) => e.facilityId === employee.facilityId);
          return emps.length > 0
            ? Math.round(emps.reduce((sum, e) => sum + e.readinessScore, 0) / emps.length)
            : 0;
        })(),
      }
    : undefined;

  const empCerts = allCerts.filter((c) => c.employeeId === employeeId);
  const certMap = new Map(allCertifications.map((c) => [c.id, c]));

  return { employee, facility, empCerts, certMap, allCertifications, role };
}
