import { unstable_noStore as noStore } from "next/cache";
import { foundryClient } from "./foundry";
import {
  facility as $facility,
  employee as $employee,
  employeeCertification as $empCert,
  certification as $certification,
  role as $role,
} from "@orip-frontend/sdk";
import type { Facility, Employee, EmployeeCertification, Certification, Department, Role } from "./data";
import { facilities as mockFacilities, roles as mockRoles } from "./data";

// ─── Raw OSDK fetchers ────────────────────────────────────────────────────────

async function fetchRawFacilities() {
  noStore();
  const { data } = await foundryClient($facility).fetchPage({ $pageSize: 50 });
  return data;
}

async function fetchRawEmployees() {
  noStore();
  const { data } = await foundryClient($employee).fetchPage({ $pageSize: 500 });
  return data;
}

async function fetchRawEmpCerts() {
  noStore();
  const { data } = await foundryClient($empCert).fetchPage({ $pageSize: 500 });
  return data;
}

async function fetchRawCertifications() {
  noStore();
  const { data } = await foundryClient($certification).fetchPage({ $pageSize: 100 });
  return data;
}

async function fetchRawRoles() {
  noStore();
  const { data } = await foundryClient($role).fetchPage({ $pageSize: 50 });
  return data;
}

// ─── Type mappers ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEmployee(e: any): Employee {
  return {
    id: e.employeeId ?? "",
    firstName: e.firstName ?? "",
    lastName: e.lastName ?? "",
    roleId: e.roleId ?? "",
    facilityId: e.facilityId ?? "",
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
  return {
    recordId: ec.recordId ?? "",
    employeeId: ec.employeeId ?? "",
    certId: ec.certId ?? "",
    issueDate: ec.issueDate ?? "",
    expiryDate: ec.expirationDate ?? "",
    status: (ec.status ?? "Active") as "Active" | "Expiring Soon" | "Expired",
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
  const facilityEmployees = employees.filter((e) => e.facilityId === facilityId);
  const allCerts = rawCerts.map(toEmpCert);
  const allCertifications = rawCertifications.map(toCertification);
  const facilityCerts = allCerts.filter((ec) =>
    facilityEmployees.some((e) => e.id === ec.employeeId)
  );
  const roles = rawRoles.map(toRole);

  const readinessScore =
    facilityEmployees.length > 0
      ? Math.round(facilityEmployees.reduce((sum, e) => sum + e.readinessScore, 0) / facilityEmployees.length)
      : 0;
  const facility: Facility = { ...mockFacility, readinessScore };

  const departments = computeDepartments(facilityEmployees, facilityCerts);
  const certMap = new Map(allCertifications.map((c) => [c.id, c]));
  const roleMap = new Map(roles.map((r) => [r.id, r]));

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
  const employee = employees.find((e) => e.id === employeeId);
  if (!employee) return null;

  const allCerts = rawCerts.map(toEmpCert);
  const allCertifications = rawCertifications.map(toCertification);
  const roles = rawRoles.map(toRole);
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
