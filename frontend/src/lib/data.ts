export type Facility = {
  id: string;
  name: string;
  address: string;
  type: string;
  bedCount: number;
  accreditationStatus: string;
  readinessScore: number;
};

export type Department = {
  name: string;
  facilityId: string;
  readinessScore: number;
  employeeCount: number;
  expiredCount: number;
  expiringCount: number;
};

export type Role = {
  id: string;
  title: string;
  department: string;
  requiredCertIds: string[];
};

export type Certification = {
  id: string;
  name: string;
  issuingBody: string;
  validityMonths: number;
  isRegulatoryRequirement: boolean;
};

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  roleId: string;
  facilityId: string;
  department: string;
  hireDate: string;
  employmentStatus: string;
  readinessScore: number;
  /** Written by flag-employee-for-review action; not in v0.1.0 SDK backing dataset */
  flaggedForReview?: boolean;
  reviewNotes?: string;
};

export type EmployeeCertification = {
  recordId: string;
  employeeId: string;
  certId: string;
  issueDate: string;
  expiryDate: string;
  status: "Active" | "Expiring Soon" | "Expired";
};

// ─── FACILITIES ───────────────────────────────────────────────────────────────

export const facilities: Facility[] = [
  {
    id: "FAC-0001",
    name: "Health Alliance - Clinton Hospital",
    address: "201 Highland St, Clinton, MA",
    type: "Short-Term Acute Care",
    bedCount: 150,
    accreditationStatus: "Active",
    readinessScore: 0,
  },
  {
    id: "FAC-0002",
    name: "Mount Auburn Hospital",
    address: "330 Mount Auburn St, Cambridge, MA",
    type: "Short-Term Acute Care",
    bedCount: 217,
    accreditationStatus: "Active",
    readinessScore: 0,
  },
  {
    id: "FAC-0003",
    name: "Sturdy Memorial Hospital",
    address: "211 Park St, Attleboro, MA",
    type: "Short-Term Acute Care",
    bedCount: 126,
    accreditationStatus: "Active",
    readinessScore: 0,
  },
];

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────────

// Departments are computed dynamically from OSDK data in osdk-queries.ts
export const departments: Department[] = [];

// ─── ROLES ────────────────────────────────────────────────────────────────────

export const roles: Role[] = [
  { id: "ROLE-RN", title: "Registered Nurse", department: "Nursing", requiredCertIds: ["CERT-BLS", "CERT-ACLS", "CERT-RN-LIC", "CERT-HIPAA", "CERT-IC", "CERT-BBP"] },
  { id: "ROLE-LPN", title: "Licensed Practical Nurse", department: "Nursing", requiredCertIds: ["CERT-BLS", "CERT-LPN-LIC", "CERT-HIPAA", "CERT-IC", "CERT-BBP"] },
  { id: "ROLE-MD-EM", title: "Emergency Medicine Physician", department: "Emergency", requiredCertIds: ["CERT-BLS", "CERT-ACLS", "CERT-PALS", "CERT-DEA", "CERT-HIPAA"] },
  { id: "ROLE-PA", title: "Physician Assistant", department: "General Medicine", requiredCertIds: ["CERT-BLS", "CERT-ACLS", "CERT-DEA", "CERT-HIPAA", "CERT-IC"] },
  { id: "ROLE-RT", title: "Respiratory Therapist", department: "ICU", requiredCertIds: ["CERT-BLS", "CERT-ACLS", "CERT-RT-LIC", "CERT-HIPAA", "CERT-IC", "CERT-BBP"] },
  { id: "ROLE-RAD", title: "Radiologic Technologist", department: "Radiology", requiredCertIds: ["CERT-BLS", "CERT-ARRT", "CERT-HIPAA", "CERT-BBP"] },
  { id: "ROLE-PHARM", title: "Pharmacy Technician", department: "Pharmacy", requiredCertIds: ["CERT-BLS", "CERT-PTCB", "CERT-HIPAA"] },
  { id: "ROLE-MLT", title: "Medical Lab Technician", department: "Lab", requiredCertIds: ["CERT-BLS", "CERT-HIPAA", "CERT-BBP", "CERT-IC"] },
  { id: "ROLE-ST", title: "Surgical Technologist", department: "Surgery", requiredCertIds: ["CERT-BLS", "CERT-NBSTSA", "CERT-HIPAA", "CERT-IC", "CERT-BBP"] },
  { id: "ROLE-NA", title: "Nursing Assistant", department: "General Medicine", requiredCertIds: ["CERT-BLS", "CERT-CNA", "CERT-HIPAA", "CERT-BBP"] },
];

// ─── CERTIFICATIONS ───────────────────────────────────────────────────────────

export const certifications: Certification[] = [
  { id: "CERT-BLS", name: "Basic Life Support (BLS)", issuingBody: "American Heart Association", validityMonths: 24, isRegulatoryRequirement: true },
  { id: "CERT-ACLS", name: "Advanced Cardiovascular Life Support (ACLS)", issuingBody: "American Heart Association", validityMonths: 24, isRegulatoryRequirement: true },
  { id: "CERT-PALS", name: "Pediatric Advanced Life Support (PALS)", issuingBody: "American Heart Association", validityMonths: 24, isRegulatoryRequirement: true },
  { id: "CERT-NRP", name: "Neonatal Resuscitation Program (NRP)", issuingBody: "AAP", validityMonths: 24, isRegulatoryRequirement: true },
  { id: "CERT-RN-LIC", name: "State RN License", issuingBody: "MA Board of Nursing", validityMonths: 24, isRegulatoryRequirement: true },
  { id: "CERT-LPN-LIC", name: "State LPN License", issuingBody: "MA Board of Nursing", validityMonths: 24, isRegulatoryRequirement: true },
  { id: "CERT-DEA", name: "DEA Registration", issuingBody: "Drug Enforcement Agency", validityMonths: 36, isRegulatoryRequirement: true },
  { id: "CERT-HIPAA", name: "HIPAA Compliance Training", issuingBody: "Internal", validityMonths: 12, isRegulatoryRequirement: true },
  { id: "CERT-IC", name: "Infection Control Certification", issuingBody: "APIC", validityMonths: 12, isRegulatoryRequirement: true },
  { id: "CERT-BBP", name: "Blood-Borne Pathogen Training", issuingBody: "OSHA", validityMonths: 12, isRegulatoryRequirement: true },
  { id: "CERT-RT-LIC", name: "Respiratory Therapy License", issuingBody: "MA DPH", validityMonths: 24, isRegulatoryRequirement: true },
  { id: "CERT-ARRT", name: "Radiology Certification (ARRT)", issuingBody: "ARRT", validityMonths: 24, isRegulatoryRequirement: true },
  { id: "CERT-PTCB", name: "Pharmacy Technician Certification (PTCB)", issuingBody: "PTCB", validityMonths: 24, isRegulatoryRequirement: true },
  { id: "CERT-NBSTSA", name: "Surgical Tech Certification (NBSTSA)", issuingBody: "NBSTSA", validityMonths: 24, isRegulatoryRequirement: true },
  { id: "CERT-CNA", name: "CNA Certification", issuingBody: "MA DPH", validityMonths: 24, isRegulatoryRequirement: true },
];

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────

export const employees: Employee[] = [
  // FAC-001 Metro General
  { id: "EMP-001", firstName: "Sarah", lastName: "Chen", roleId: "ROLE-RN", facilityId: "FAC-0001", department: "ICU", hireDate: "2021-03-15", employmentStatus: "Active", readinessScore: 100 },
  { id: "EMP-002", firstName: "Marcus", lastName: "Johnson", roleId: "ROLE-RN", facilityId: "FAC-0001", department: "ICU", hireDate: "2019-07-22", employmentStatus: "Active", readinessScore: 83 },
  { id: "EMP-003", firstName: "Priya", lastName: "Patel", roleId: "ROLE-RT", facilityId: "FAC-0001", department: "ICU", hireDate: "2022-01-10", employmentStatus: "Active", readinessScore: 100 },
  { id: "EMP-004", firstName: "James", lastName: "Rivera", roleId: "ROLE-MD-EM", facilityId: "FAC-0001", department: "Emergency", hireDate: "2018-11-05", employmentStatus: "Active", readinessScore: 100 },
  { id: "EMP-005", firstName: "Aisha", lastName: "Williams", roleId: "ROLE-RN", facilityId: "FAC-0001", department: "Emergency", hireDate: "2020-04-18", employmentStatus: "Active", readinessScore: 83 },
  { id: "EMP-006", firstName: "Daniel", lastName: "Kim", roleId: "ROLE-ST", facilityId: "FAC-0001", department: "Surgery", hireDate: "2023-02-28", employmentStatus: "Active", readinessScore: 100 },
  { id: "EMP-007", firstName: "Natalie", lastName: "Torres", roleId: "ROLE-RAD", facilityId: "FAC-0001", department: "Radiology", hireDate: "2021-09-14", employmentStatus: "Active", readinessScore: 75 },
  { id: "EMP-008", firstName: "Leon", lastName: "Brooks", roleId: "ROLE-LPN", facilityId: "FAC-0001", department: "ICU", hireDate: "2022-06-30", employmentStatus: "Active", readinessScore: 100 },
  { id: "EMP-009", firstName: "Hannah", lastName: "Fischer", roleId: "ROLE-PA", facilityId: "FAC-0001", department: "Emergency", hireDate: "2019-12-01", employmentStatus: "Active", readinessScore: 100 },
  { id: "EMP-010", firstName: "Carlos", lastName: "Moreno", roleId: "ROLE-NA", facilityId: "FAC-0001", department: "ICU", hireDate: "2024-01-08", employmentStatus: "Active", readinessScore: 100 },

  // FAC-002 Riverside — ICU intentionally clustered with expired certs
  { id: "EMP-011", firstName: "Diana", lastName: "Nguyen", roleId: "ROLE-RN", facilityId: "FAC-0002", department: "ICU", hireDate: "2020-08-15", employmentStatus: "Active", readinessScore: 33 },
  { id: "EMP-012", firstName: "Tyrone", lastName: "Adams", roleId: "ROLE-RN", facilityId: "FAC-0002", department: "ICU", hireDate: "2019-03-20", employmentStatus: "Active", readinessScore: 50 },
  { id: "EMP-013", firstName: "Mei", lastName: "Lin", roleId: "ROLE-RT", facilityId: "FAC-0002", department: "ICU", hireDate: "2021-11-12", employmentStatus: "Active", readinessScore: 40 },
  { id: "EMP-014", firstName: "Kevin", lastName: "O'Brien", roleId: "ROLE-MD-EM", facilityId: "FAC-0002", department: "Emergency", hireDate: "2018-06-01", employmentStatus: "Active", readinessScore: 80 },
  { id: "EMP-015", firstName: "Fatima", lastName: "Hassan", roleId: "ROLE-RN", facilityId: "FAC-0002", department: "Emergency", hireDate: "2022-09-03", employmentStatus: "Active", readinessScore: 83 },
  { id: "EMP-016", firstName: "Roberto", lastName: "Fernandez", roleId: "ROLE-PA", facilityId: "FAC-0002", department: "General Medicine", hireDate: "2020-02-17", employmentStatus: "Active", readinessScore: 80 },
  { id: "EMP-017", firstName: "Sandra", lastName: "Mitchell", roleId: "ROLE-PHARM", facilityId: "FAC-0002", department: "Pharmacy", hireDate: "2023-05-22", employmentStatus: "Active", readinessScore: 100 },
  { id: "EMP-018", firstName: "Jaylen", lastName: "Carter", roleId: "ROLE-LPN", facilityId: "FAC-0002", department: "General Medicine", hireDate: "2021-07-04", employmentStatus: "Active", readinessScore: 80 },
  { id: "EMP-019", firstName: "Ingrid", lastName: "Sorensen", roleId: "ROLE-NA", facilityId: "FAC-0002", department: "General Medicine", hireDate: "2024-03-11", employmentStatus: "Active", readinessScore: 75 },
  { id: "EMP-020", firstName: "Ahmad", lastName: "Khalil", roleId: "ROLE-RN", facilityId: "FAC-0002", department: "ICU", hireDate: "2020-05-29", employmentStatus: "Active", readinessScore: 17 },

  // FAC-003 Harbor View
  { id: "EMP-021", firstName: "Olivia", lastName: "Grant", roleId: "ROLE-ST", facilityId: "FAC-0003", department: "Surgery", hireDate: "2021-04-01", employmentStatus: "Active", readinessScore: 100 },
  { id: "EMP-022", firstName: "Nathan", lastName: "Park", roleId: "ROLE-RAD", facilityId: "FAC-0003", department: "Radiology", hireDate: "2022-10-18", employmentStatus: "Active", readinessScore: 75 },
  { id: "EMP-023", firstName: "Grace", lastName: "Okonkwo", roleId: "ROLE-NA", facilityId: "FAC-0003", department: "General Medicine", hireDate: "2023-08-07", employmentStatus: "Active", readinessScore: 100 },
  { id: "EMP-024", firstName: "Ethan", lastName: "Walsh", roleId: "ROLE-LPN", facilityId: "FAC-0003", department: "General Medicine", hireDate: "2019-01-15", employmentStatus: "Active", readinessScore: 80 },
  { id: "EMP-025", firstName: "Sofia", lastName: "Reyes", roleId: "ROLE-ST", facilityId: "FAC-0003", department: "Surgery", hireDate: "2020-12-03", employmentStatus: "Active", readinessScore: 80 },
];

// ─── EMPLOYEE CERTIFICATIONS ──────────────────────────────────────────────────

export const employeeCertifications: EmployeeCertification[] = [
  // EMP-001 Sarah Chen (FAC-001, ICU, RN) — PERFECT COMPLIANCE
  { recordId: "EC-001", employeeId: "EMP-001", certId: "CERT-BLS", issueDate: "2024-06-01", expiryDate: "2026-06-01", status: "Active" },
  { recordId: "EC-002", employeeId: "EMP-001", certId: "CERT-ACLS", issueDate: "2024-06-01", expiryDate: "2026-06-01", status: "Active" },
  { recordId: "EC-003", employeeId: "EMP-001", certId: "CERT-RN-LIC", issueDate: "2024-01-01", expiryDate: "2026-01-01", status: "Active" },
  { recordId: "EC-004", employeeId: "EMP-001", certId: "CERT-HIPAA", issueDate: "2025-01-15", expiryDate: "2026-01-15", status: "Active" },
  { recordId: "EC-005", employeeId: "EMP-001", certId: "CERT-IC", issueDate: "2025-02-01", expiryDate: "2026-02-01", status: "Active" },
  { recordId: "EC-006", employeeId: "EMP-001", certId: "CERT-BBP", issueDate: "2025-02-01", expiryDate: "2026-02-01", status: "Active" },

  // EMP-002 Marcus Johnson (FAC-001, ICU, RN) — 1 gap
  { recordId: "EC-007", employeeId: "EMP-002", certId: "CERT-BLS", issueDate: "2024-05-01", expiryDate: "2026-05-01", status: "Active" },
  { recordId: "EC-008", employeeId: "EMP-002", certId: "CERT-ACLS", issueDate: "2023-08-10", expiryDate: "2025-08-10", status: "Expired" },
  { recordId: "EC-009", employeeId: "EMP-002", certId: "CERT-RN-LIC", issueDate: "2024-03-01", expiryDate: "2026-03-01", status: "Active" },
  { recordId: "EC-010", employeeId: "EMP-002", certId: "CERT-HIPAA", issueDate: "2025-01-10", expiryDate: "2026-01-10", status: "Active" },
  { recordId: "EC-011", employeeId: "EMP-002", certId: "CERT-IC", issueDate: "2025-01-10", expiryDate: "2026-01-10", status: "Active" },
  { recordId: "EC-012", employeeId: "EMP-002", certId: "CERT-BBP", issueDate: "2025-01-10", expiryDate: "2026-01-10", status: "Active" },

  // EMP-003 Priya Patel (FAC-001, ICU, RT) — PERFECT
  { recordId: "EC-013", employeeId: "EMP-003", certId: "CERT-BLS", issueDate: "2024-07-01", expiryDate: "2026-07-01", status: "Active" },
  { recordId: "EC-014", employeeId: "EMP-003", certId: "CERT-ACLS", issueDate: "2024-07-01", expiryDate: "2026-07-01", status: "Active" },
  { recordId: "EC-015", employeeId: "EMP-003", certId: "CERT-RT-LIC", issueDate: "2024-02-01", expiryDate: "2026-02-01", status: "Active" },
  { recordId: "EC-016", employeeId: "EMP-003", certId: "CERT-HIPAA", issueDate: "2025-03-01", expiryDate: "2026-03-01", status: "Expiring Soon" },
  { recordId: "EC-017", employeeId: "EMP-003", certId: "CERT-IC", issueDate: "2025-03-01", expiryDate: "2026-03-01", status: "Expiring Soon" },
  { recordId: "EC-018", employeeId: "EMP-003", certId: "CERT-BBP", issueDate: "2025-03-01", expiryDate: "2026-05-01", status: "Active" },

  // EMP-004 James Rivera (FAC-001, Emergency, MD) — PERFECT
  { recordId: "EC-019", employeeId: "EMP-004", certId: "CERT-BLS", issueDate: "2024-09-01", expiryDate: "2026-09-01", status: "Active" },
  { recordId: "EC-020", employeeId: "EMP-004", certId: "CERT-ACLS", issueDate: "2024-09-01", expiryDate: "2026-09-01", status: "Active" },
  { recordId: "EC-021", employeeId: "EMP-004", certId: "CERT-PALS", issueDate: "2024-09-01", expiryDate: "2026-09-01", status: "Active" },
  { recordId: "EC-022", employeeId: "EMP-004", certId: "CERT-DEA", issueDate: "2023-06-01", expiryDate: "2026-06-01", status: "Active" },
  { recordId: "EC-023", employeeId: "EMP-004", certId: "CERT-HIPAA", issueDate: "2025-06-01", expiryDate: "2026-06-01", status: "Active" },

  // EMP-005 Aisha Williams (FAC-001, Emergency, RN) — 1 gap
  { recordId: "EC-024", employeeId: "EMP-005", certId: "CERT-BLS", issueDate: "2024-04-01", expiryDate: "2026-04-01", status: "Active" },
  { recordId: "EC-025", employeeId: "EMP-005", certId: "CERT-ACLS", issueDate: "2024-04-01", expiryDate: "2026-04-01", status: "Active" },
  { recordId: "EC-026", employeeId: "EMP-005", certId: "CERT-RN-LIC", issueDate: "2024-01-01", expiryDate: "2026-01-01", status: "Active" },
  { recordId: "EC-027", employeeId: "EMP-005", certId: "CERT-HIPAA", issueDate: "2024-12-01", expiryDate: "2025-12-01", status: "Expired" },
  { recordId: "EC-028", employeeId: "EMP-005", certId: "CERT-IC", issueDate: "2025-01-01", expiryDate: "2026-01-01", status: "Active" },
  { recordId: "EC-029", employeeId: "EMP-005", certId: "CERT-BBP", issueDate: "2025-01-01", expiryDate: "2026-01-01", status: "Active" },

  // EMP-006 Daniel Kim (FAC-001, Surgery, ST) — PERFECT
  { recordId: "EC-030", employeeId: "EMP-006", certId: "CERT-BLS", issueDate: "2024-10-01", expiryDate: "2026-10-01", status: "Active" },
  { recordId: "EC-031", employeeId: "EMP-006", certId: "CERT-NBSTSA", issueDate: "2024-10-01", expiryDate: "2026-10-01", status: "Active" },
  { recordId: "EC-032", employeeId: "EMP-006", certId: "CERT-HIPAA", issueDate: "2025-04-01", expiryDate: "2026-04-01", status: "Active" },
  { recordId: "EC-033", employeeId: "EMP-006", certId: "CERT-IC", issueDate: "2025-04-01", expiryDate: "2026-04-01", status: "Active" },
  { recordId: "EC-034", employeeId: "EMP-006", certId: "CERT-BBP", issueDate: "2025-04-01", expiryDate: "2026-04-01", status: "Active" },

  // EMP-007 Natalie Torres (FAC-001, Radiology, RAD) — 1 gap
  { recordId: "EC-035", employeeId: "EMP-007", certId: "CERT-BLS", issueDate: "2024-03-01", expiryDate: "2026-03-01", status: "Expiring Soon" },
  { recordId: "EC-036", employeeId: "EMP-007", certId: "CERT-ARRT", issueDate: "2023-09-01", expiryDate: "2025-09-01", status: "Expired" },
  { recordId: "EC-037", employeeId: "EMP-007", certId: "CERT-HIPAA", issueDate: "2025-05-01", expiryDate: "2026-05-01", status: "Active" },
  { recordId: "EC-038", employeeId: "EMP-007", certId: "CERT-BBP", issueDate: "2025-05-01", expiryDate: "2026-05-01", status: "Active" },

  // EMP-008 Leon Brooks (FAC-001, ICU, LPN) — PERFECT
  { recordId: "EC-039", employeeId: "EMP-008", certId: "CERT-BLS", issueDate: "2024-08-01", expiryDate: "2026-08-01", status: "Active" },
  { recordId: "EC-040", employeeId: "EMP-008", certId: "CERT-LPN-LIC", issueDate: "2024-08-01", expiryDate: "2026-08-01", status: "Active" },
  { recordId: "EC-041", employeeId: "EMP-008", certId: "CERT-HIPAA", issueDate: "2025-07-01", expiryDate: "2026-07-01", status: "Active" },
  { recordId: "EC-042", employeeId: "EMP-008", certId: "CERT-IC", issueDate: "2025-07-01", expiryDate: "2026-07-01", status: "Active" },
  { recordId: "EC-043", employeeId: "EMP-008", certId: "CERT-BBP", issueDate: "2025-07-01", expiryDate: "2026-07-01", status: "Active" },

  // EMP-009 Hannah Fischer (FAC-001, Emergency, PA) — PERFECT
  { recordId: "EC-044", employeeId: "EMP-009", certId: "CERT-BLS", issueDate: "2024-11-01", expiryDate: "2026-11-01", status: "Active" },
  { recordId: "EC-045", employeeId: "EMP-009", certId: "CERT-ACLS", issueDate: "2024-11-01", expiryDate: "2026-11-01", status: "Active" },
  { recordId: "EC-046", employeeId: "EMP-009", certId: "CERT-DEA", issueDate: "2023-11-01", expiryDate: "2026-11-01", status: "Active" },
  { recordId: "EC-047", employeeId: "EMP-009", certId: "CERT-HIPAA", issueDate: "2025-08-01", expiryDate: "2026-08-01", status: "Active" },
  { recordId: "EC-048", employeeId: "EMP-009", certId: "CERT-IC", issueDate: "2025-08-01", expiryDate: "2026-08-01", status: "Active" },

  // EMP-010 Carlos Moreno (FAC-001, ICU, NA) — PERFECT
  { recordId: "EC-049", employeeId: "EMP-010", certId: "CERT-BLS", issueDate: "2024-01-08", expiryDate: "2026-01-08", status: "Active" },
  { recordId: "EC-050", employeeId: "EMP-010", certId: "CERT-CNA", issueDate: "2024-01-08", expiryDate: "2026-01-08", status: "Active" },
  { recordId: "EC-051", employeeId: "EMP-010", certId: "CERT-HIPAA", issueDate: "2025-01-08", expiryDate: "2026-01-08", status: "Active" },
  { recordId: "EC-052", employeeId: "EMP-010", certId: "CERT-BBP", issueDate: "2025-01-08", expiryDate: "2026-01-08", status: "Active" },

  // EMP-011 Diana Nguyen (FAC-002, ICU, RN) — CRITICAL (2 expired)
  { recordId: "EC-053", employeeId: "EMP-011", certId: "CERT-BLS", issueDate: "2023-01-01", expiryDate: "2025-01-01", status: "Expired" },
  { recordId: "EC-054", employeeId: "EMP-011", certId: "CERT-ACLS", issueDate: "2023-01-01", expiryDate: "2025-01-01", status: "Expired" },
  { recordId: "EC-055", employeeId: "EMP-011", certId: "CERT-RN-LIC", issueDate: "2024-06-01", expiryDate: "2026-06-01", status: "Active" },
  { recordId: "EC-056", employeeId: "EMP-011", certId: "CERT-HIPAA", issueDate: "2024-06-01", expiryDate: "2025-06-01", status: "Expired" },
  { recordId: "EC-057", employeeId: "EMP-011", certId: "CERT-IC", issueDate: "2025-01-15", expiryDate: "2026-01-15", status: "Active" },
  { recordId: "EC-058", employeeId: "EMP-011", certId: "CERT-BBP", issueDate: "2025-01-15", expiryDate: "2026-01-15", status: "Active" },

  // EMP-012 Tyrone Adams (FAC-002, ICU, RN) — CRITICAL (3 expired)
  { recordId: "EC-059", employeeId: "EMP-012", certId: "CERT-BLS", issueDate: "2023-03-01", expiryDate: "2025-03-01", status: "Expired" },
  { recordId: "EC-060", employeeId: "EMP-012", certId: "CERT-ACLS", issueDate: "2024-05-01", expiryDate: "2026-05-01", status: "Active" },
  { recordId: "EC-061", employeeId: "EMP-012", certId: "CERT-RN-LIC", issueDate: "2024-01-01", expiryDate: "2026-01-01", status: "Active" },
  { recordId: "EC-062", employeeId: "EMP-012", certId: "CERT-HIPAA", issueDate: "2024-02-01", expiryDate: "2025-02-01", status: "Expired" },
  { recordId: "EC-063", employeeId: "EMP-012", certId: "CERT-IC", issueDate: "2024-02-01", expiryDate: "2025-02-01", status: "Expired" },
  { recordId: "EC-064", employeeId: "EMP-012", certId: "CERT-BBP", issueDate: "2025-03-01", expiryDate: "2026-03-01", status: "Active" },

  // EMP-013 Mei Lin (FAC-002, ICU, RT) — CRITICAL (3 expired)
  { recordId: "EC-065", employeeId: "EMP-013", certId: "CERT-BLS", issueDate: "2023-05-01", expiryDate: "2025-05-01", status: "Expired" },
  { recordId: "EC-066", employeeId: "EMP-013", certId: "CERT-ACLS", issueDate: "2023-05-01", expiryDate: "2025-05-01", status: "Expired" },
  { recordId: "EC-067", employeeId: "EMP-013", certId: "CERT-RT-LIC", issueDate: "2024-08-01", expiryDate: "2026-08-01", status: "Active" },
  { recordId: "EC-068", employeeId: "EMP-013", certId: "CERT-HIPAA", issueDate: "2024-11-01", expiryDate: "2025-11-01", status: "Expired" },
  { recordId: "EC-069", employeeId: "EMP-013", certId: "CERT-IC", issueDate: "2025-04-01", expiryDate: "2026-04-01", status: "Active" },
  { recordId: "EC-070", employeeId: "EMP-013", certId: "CERT-BBP", issueDate: "2025-04-01", expiryDate: "2026-04-01", status: "Active" },

  // EMP-014 Kevin O'Brien (FAC-002, Emergency, MD)
  { recordId: "EC-071", employeeId: "EMP-014", certId: "CERT-BLS", issueDate: "2024-07-01", expiryDate: "2026-07-01", status: "Active" },
  { recordId: "EC-072", employeeId: "EMP-014", certId: "CERT-ACLS", issueDate: "2024-07-01", expiryDate: "2026-07-01", status: "Active" },
  { recordId: "EC-073", employeeId: "EMP-014", certId: "CERT-PALS", issueDate: "2024-07-01", expiryDate: "2026-07-01", status: "Active" },
  { recordId: "EC-074", employeeId: "EMP-014", certId: "CERT-DEA", issueDate: "2023-07-01", expiryDate: "2026-07-01", status: "Active" },
  { recordId: "EC-075", employeeId: "EMP-014", certId: "CERT-HIPAA", issueDate: "2024-06-01", expiryDate: "2025-06-01", status: "Expired" },

  // EMP-015 Fatima Hassan (FAC-002, Emergency, RN)
  { recordId: "EC-076", employeeId: "EMP-015", certId: "CERT-BLS", issueDate: "2024-09-03", expiryDate: "2026-09-03", status: "Active" },
  { recordId: "EC-077", employeeId: "EMP-015", certId: "CERT-ACLS", issueDate: "2024-09-03", expiryDate: "2026-09-03", status: "Active" },
  { recordId: "EC-078", employeeId: "EMP-015", certId: "CERT-RN-LIC", issueDate: "2024-09-03", expiryDate: "2026-09-03", status: "Active" },
  { recordId: "EC-079", employeeId: "EMP-015", certId: "CERT-HIPAA", issueDate: "2025-09-03", expiryDate: "2026-09-03", status: "Active" },
  { recordId: "EC-080", employeeId: "EMP-015", certId: "CERT-IC", issueDate: "2024-09-03", expiryDate: "2025-09-03", status: "Expired" },
  { recordId: "EC-081", employeeId: "EMP-015", certId: "CERT-BBP", issueDate: "2025-09-03", expiryDate: "2026-09-03", status: "Active" },

  // EMP-016 Roberto Fernandez (FAC-002, General Medicine, PA)
  { recordId: "EC-082", employeeId: "EMP-016", certId: "CERT-BLS", issueDate: "2024-04-17", expiryDate: "2026-04-17", status: "Active" },
  { recordId: "EC-083", employeeId: "EMP-016", certId: "CERT-ACLS", issueDate: "2024-04-17", expiryDate: "2026-04-17", status: "Active" },
  { recordId: "EC-084", employeeId: "EMP-016", certId: "CERT-DEA", issueDate: "2023-04-17", expiryDate: "2026-04-17", status: "Active" },
  { recordId: "EC-085", employeeId: "EMP-016", certId: "CERT-HIPAA", issueDate: "2024-04-17", expiryDate: "2025-04-17", status: "Expired" },
  { recordId: "EC-086", employeeId: "EMP-016", certId: "CERT-IC", issueDate: "2025-04-17", expiryDate: "2026-04-17", status: "Active" },

  // EMP-017 Sandra Mitchell (FAC-002, Pharmacy, PHARM) — PERFECT
  { recordId: "EC-087", employeeId: "EMP-017", certId: "CERT-BLS", issueDate: "2024-05-22", expiryDate: "2026-05-22", status: "Active" },
  { recordId: "EC-088", employeeId: "EMP-017", certId: "CERT-PTCB", issueDate: "2024-05-22", expiryDate: "2026-05-22", status: "Active" },
  { recordId: "EC-089", employeeId: "EMP-017", certId: "CERT-HIPAA", issueDate: "2025-05-22", expiryDate: "2026-05-22", status: "Active" },

  // EMP-018 Jaylen Carter (FAC-002, General Medicine, LPN)
  { recordId: "EC-090", employeeId: "EMP-018", certId: "CERT-BLS", issueDate: "2024-07-04", expiryDate: "2026-07-04", status: "Active" },
  { recordId: "EC-091", employeeId: "EMP-018", certId: "CERT-LPN-LIC", issueDate: "2024-07-04", expiryDate: "2026-07-04", status: "Active" },
  { recordId: "EC-092", employeeId: "EMP-018", certId: "CERT-HIPAA", issueDate: "2024-07-04", expiryDate: "2025-07-04", status: "Expired" },
  { recordId: "EC-093", employeeId: "EMP-018", certId: "CERT-IC", issueDate: "2025-07-04", expiryDate: "2026-07-04", status: "Active" },
  { recordId: "EC-094", employeeId: "EMP-018", certId: "CERT-BBP", issueDate: "2025-07-04", expiryDate: "2026-07-04", status: "Active" },

  // EMP-019 Ingrid Sorensen (FAC-002, General Medicine, NA)
  { recordId: "EC-095", employeeId: "EMP-019", certId: "CERT-BLS", issueDate: "2024-03-11", expiryDate: "2026-03-11", status: "Expiring Soon" },
  { recordId: "EC-096", employeeId: "EMP-019", certId: "CERT-CNA", issueDate: "2024-03-11", expiryDate: "2026-03-11", status: "Active" },
  { recordId: "EC-097", employeeId: "EMP-019", certId: "CERT-HIPAA", issueDate: "2025-03-11", expiryDate: "2026-03-11", status: "Expiring Soon" },
  { recordId: "EC-098", employeeId: "EMP-019", certId: "CERT-BBP", issueDate: "2025-03-11", expiryDate: "2026-03-11", status: "Active" },

  // EMP-020 Ahmad Khalil (FAC-002, ICU, RN) — MOST CRITICAL (5 expired)
  { recordId: "EC-099", employeeId: "EMP-020", certId: "CERT-BLS", issueDate: "2022-09-01", expiryDate: "2024-09-01", status: "Expired" },
  { recordId: "EC-100", employeeId: "EMP-020", certId: "CERT-ACLS", issueDate: "2022-09-01", expiryDate: "2024-09-01", status: "Expired" },
  { recordId: "EC-101", employeeId: "EMP-020", certId: "CERT-RN-LIC", issueDate: "2024-05-29", expiryDate: "2026-05-29", status: "Active" },
  { recordId: "EC-102", employeeId: "EMP-020", certId: "CERT-HIPAA", issueDate: "2023-05-29", expiryDate: "2024-05-29", status: "Expired" },
  { recordId: "EC-103", employeeId: "EMP-020", certId: "CERT-IC", issueDate: "2023-05-29", expiryDate: "2024-05-29", status: "Expired" },
  { recordId: "EC-104", employeeId: "EMP-020", certId: "CERT-BBP", issueDate: "2023-05-29", expiryDate: "2024-05-29", status: "Expired" },

  // EMP-021 Olivia Grant (FAC-003, Surgery, ST) — PERFECT
  { recordId: "EC-105", employeeId: "EMP-021", certId: "CERT-BLS", issueDate: "2024-04-01", expiryDate: "2026-04-01", status: "Active" },
  { recordId: "EC-106", employeeId: "EMP-021", certId: "CERT-NBSTSA", issueDate: "2024-04-01", expiryDate: "2026-04-01", status: "Active" },
  { recordId: "EC-107", employeeId: "EMP-021", certId: "CERT-HIPAA", issueDate: "2025-04-01", expiryDate: "2026-04-01", status: "Active" },
  { recordId: "EC-108", employeeId: "EMP-021", certId: "CERT-IC", issueDate: "2025-04-01", expiryDate: "2026-04-01", status: "Active" },
  { recordId: "EC-109", employeeId: "EMP-021", certId: "CERT-BBP", issueDate: "2025-04-01", expiryDate: "2026-04-01", status: "Active" },

  // EMP-022 Nathan Park (FAC-003, Radiology, RAD) — 1 expired
  { recordId: "EC-110", employeeId: "EMP-022", certId: "CERT-BLS", issueDate: "2024-10-18", expiryDate: "2026-10-18", status: "Active" },
  { recordId: "EC-111", employeeId: "EMP-022", certId: "CERT-ARRT", issueDate: "2023-10-18", expiryDate: "2025-10-18", status: "Expired" },
  { recordId: "EC-112", employeeId: "EMP-022", certId: "CERT-HIPAA", issueDate: "2025-10-18", expiryDate: "2026-10-18", status: "Active" },
  { recordId: "EC-113", employeeId: "EMP-022", certId: "CERT-BBP", issueDate: "2025-10-18", expiryDate: "2026-10-18", status: "Active" },

  // EMP-023 Grace Okonkwo (FAC-003, General Medicine, NA) — PERFECT
  { recordId: "EC-114", employeeId: "EMP-023", certId: "CERT-BLS", issueDate: "2024-08-07", expiryDate: "2026-08-07", status: "Active" },
  { recordId: "EC-115", employeeId: "EMP-023", certId: "CERT-CNA", issueDate: "2024-08-07", expiryDate: "2026-08-07", status: "Active" },
  { recordId: "EC-116", employeeId: "EMP-023", certId: "CERT-HIPAA", issueDate: "2025-08-07", expiryDate: "2026-08-07", status: "Active" },
  { recordId: "EC-117", employeeId: "EMP-023", certId: "CERT-BBP", issueDate: "2025-08-07", expiryDate: "2026-08-07", status: "Active" },

  // EMP-024 Ethan Walsh (FAC-003, General Medicine, LPN)
  { recordId: "EC-118", employeeId: "EMP-024", certId: "CERT-BLS", issueDate: "2024-01-15", expiryDate: "2026-01-15", status: "Active" },
  { recordId: "EC-119", employeeId: "EMP-024", certId: "CERT-LPN-LIC", issueDate: "2024-01-15", expiryDate: "2026-01-15", status: "Active" },
  { recordId: "EC-120", employeeId: "EMP-024", certId: "CERT-HIPAA", issueDate: "2024-01-15", expiryDate: "2025-01-15", status: "Expired" },
  { recordId: "EC-121", employeeId: "EMP-024", certId: "CERT-IC", issueDate: "2025-01-15", expiryDate: "2026-01-15", status: "Active" },
  { recordId: "EC-122", employeeId: "EMP-024", certId: "CERT-BBP", issueDate: "2025-01-15", expiryDate: "2026-01-15", status: "Active" },

  // EMP-025 Sofia Reyes (FAC-003, Surgery, ST)
  { recordId: "EC-123", employeeId: "EMP-025", certId: "CERT-BLS", issueDate: "2024-12-03", expiryDate: "2026-12-03", status: "Active" },
  { recordId: "EC-124", employeeId: "EMP-025", certId: "CERT-NBSTSA", issueDate: "2024-12-03", expiryDate: "2026-12-03", status: "Active" },
  { recordId: "EC-125", employeeId: "EMP-025", certId: "CERT-HIPAA", issueDate: "2024-12-03", expiryDate: "2025-12-03", status: "Expired" },
  { recordId: "EC-126", employeeId: "EMP-025", certId: "CERT-IC", issueDate: "2025-12-03", expiryDate: "2026-12-03", status: "Active" },
  { recordId: "EC-127", employeeId: "EMP-025", certId: "CERT-BBP", issueDate: "2025-12-03", expiryDate: "2026-12-03", status: "Active" },
];

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

export function getFacilityById(id: string) {
  return facilities.find((f) => f.id === id);
}

export function getEmployeeById(id: string) {
  return employees.find((e) => e.id === id);
}

export function getEmployeesByFacility(facilityId: string) {
  return employees.filter((e) => e.facilityId === facilityId);
}

export function getEmployeesByDepartmentAndFacility(department: string, facilityId: string) {
  return employees.filter((e) => e.facilityId === facilityId && e.department === department);
}

export function getDepartmentsByFacility(facilityId: string) {
  return departments.filter((d) => d.facilityId === facilityId);
}

export function getCertsByEmployee(employeeId: string) {
  return employeeCertifications.filter((ec) => ec.employeeId === employeeId);
}

export function getRoleById(roleId: string) {
  return roles.find((r) => r.id === roleId);
}

export function getCertById(certId: string) {
  return certifications.find((c) => c.id === certId);
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "emerald";
  if (score >= 80) return "amber";
  return "rose";
}

export function getStatusColor(status: string): string {
  if (status === "Active") return "emerald";
  if (status === "Expiring Soon") return "amber";
  return "rose";
}

export function networkStats() {
  const totalEmployees = employees.length;
  const allCerts = employeeCertifications;
  const expired = allCerts.filter((ec) => ec.status === "Expired").length;
  const expiringSoon = allCerts.filter((ec) => ec.status === "Expiring Soon").length;
  const avgReadiness = Math.round(employees.reduce((sum, e) => sum + e.readinessScore, 0) / employees.length);
  return { totalEmployees, expired, expiringSoon, avgReadiness };
}
