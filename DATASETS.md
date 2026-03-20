# ORIP Dataset Schema Reference

This document describes all datasets backing the **ORIP — Clinical Workforce Readiness** ontology in Palantir Foundry. Each dataset maps to one or more Object Types in the ontology. All datasets live in the project folder `/Personal Projects/ORIP — Clinical Workforce Readiness`.

---

## Entity Relationship Overview

```
orip_facilities ──< orip_employees >── orip_roles ──< orip_role_certs >── orip_certifications
                                                  └──< orip_role_skills >── orip_skills
orip_employees ──< orip_employee_certifications >── orip_certifications
```

---

## 1. `orip_facilities`

**RID:** `ri.foundry.main.dataset.756ce78e-e014-4945-89eb-6c3311faf707`
**Object Type:** `facility`
**Rows:** 377

### Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `facility_id` | `string` | **Primary Key** | Zero-padded 4-digit ID, e.g. `FAC-0001` |
| `name` | `string` | NOT NULL | Full facility name in uppercase |
| `address` | `string` | | Full street address |
| `type` | `string` | | Facility category, e.g. `Short-Term Acute Care` |
| `bed_count` | `integer` | | Licensed bed capacity |
| `accreditation_status` | `string` | | e.g. `Active`, `Pending` |
| `accreditation_body` | `string` | | e.g. `The Joint Commission` |
| `cms_provider_number` | `string` | | CMS Medicare certification number |
| `certification_date` | `string` | YYYYMMDD format | CMS certification date as integer string, e.g. `19930414` |

### Sample Data

| facility_id | name | type | bed_count | accreditation_status |
|---|---|---|---|---|
| FAC-0001 | HEALTH ALLIANCE - CLINTON HOSPITAL | Short-Term Acute Care | 150 | Active |
| FAC-0002 | MOUNT AUBURN HOSPITAL | Short-Term Acute Care | 217 | Active |
| FAC-0003 | STURDY MEMORIAL HOSPITAL | Short-Term Acute Care | 126 | Active |

### Notes
- `certification_date` is stored as a `YYYYMMDD` integer string — cast to date before comparisons.
- Only 3 of 377 facilities (`FAC-0001`, `FAC-0002`, `FAC-0003`) are used by the synthetic employee dataset. The remaining facilities are real CMS provider data for Massachusetts.

---

## 2. `orip_employees`

**RID:** `ri.foundry.main.dataset.44e0c19f-8743-4e56-a0b1-350d4b5e8344`
**Object Type:** `employee`
**Rows:** 25 (synthetic)

### Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `employee_id` | `string` | **Primary Key** | e.g. `EMP-001` through `EMP-025` |
| `first_name` | `string` | NOT NULL | |
| `last_name` | `string` | NOT NULL | |
| `role_id` | `string` | FK → `orip_roles.role_id` | e.g. `ROLE-RN` |
| `facility_id` | `string` | FK → `orip_facilities.facility_id` | Zero-padded format: `FAC-0001`, `FAC-0002`, `FAC-0003` |
| `department` | `string` | | e.g. `ICU`, `Emergency`, `Surgery`, `Radiology`, `General Medicine`, `Pharmacy` |
| `hire_date` | `date` | ISO 8601 | e.g. `2021-03-15` |
| `employment_status` | `string` | | `Active` or `Inactive` |
| `readiness_score` | `integer` | 0–100 | Computed compliance score (% of required certs that are Active) |

### Sample Data

| employee_id | first_name | last_name | role_id | facility_id | department | readiness_score |
|---|---|---|---|---|---|---|
| EMP-001 | Sarah | Chen | ROLE-RN | FAC-0001 | ICU | 100 |
| EMP-012 | Tyrone | Adams | ROLE-RN | FAC-0002 | ICU | 50 |
| EMP-021 | Olivia | Grant | ROLE-ST | FAC-0003 | Surgery | 100 |

### Readiness Score Formula

```
readiness_score = floor(active_required_certs / total_required_certs * 100)
```

Where `active_required_certs` = count of the employee's EmployeeCertification records with `status = 'Active'` whose `cert_id` appears in `orip_role_certs` for their `role_id`.

### Facility Distribution
- **FAC-0001** (Health Alliance - Clinton Hospital): EMP-001 through EMP-010 (10 staff)
- **FAC-0002** (Mount Auburn Hospital): EMP-011 through EMP-020 (10 staff — highest compliance risk)
- **FAC-0003** (Sturdy Memorial Hospital): EMP-021 through EMP-025 (5 staff)

---

## 3. `orip_certifications`

**RID:** `ri.foundry.main.dataset.4f856c8a-cc04-481d-99f7-c44b4e668430`
**Object Type:** `certification`
**Rows:** 15

### Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `cert_id` | `string` | **Primary Key** | e.g. `CERT-BLS`, `CERT-ACLS` |
| `name` | `string` | NOT NULL | Full certification name |
| `issuing_body` | `string` | | Certifying organization |
| `validity_months` | `integer` | | How long the cert is valid (months) |
| `is_mandatory` | `boolean` | | Whether this is a regulatory/mandatory cert |

### Complete Certification Catalog

| cert_id | name | issuing_body | validity_months | is_mandatory |
|---|---|---|---|---|
| CERT-BLS | Basic Life Support (BLS) | American Heart Association | 24 | true |
| CERT-ACLS | Advanced Cardiovascular Life Support (ACLS) | American Heart Association | 24 | true |
| CERT-PALS | Pediatric Advanced Life Support (PALS) | American Heart Association | 24 | true |
| CERT-NRP | Neonatal Resuscitation Program (NRP) | AAP | 24 | true |
| CERT-RN-LIC | State RN License | MA Board of Nursing | 24 | true |
| CERT-LPN-LIC | State LPN License | MA Board of Nursing | 24 | true |
| CERT-DEA | DEA Registration | Drug Enforcement Agency | 36 | true |
| CERT-HIPAA | HIPAA Compliance Training | Internal | 12 | true |
| CERT-IC | Infection Control Certification | APIC | 12 | true |
| CERT-BBP | Blood-Borne Pathogen Training | OSHA | 12 | true |
| CERT-RT-LIC | Respiratory Therapy License | MA DPH | 24 | true |
| CERT-ARRT | Radiology Certification (ARRT) | ARRT | 24 | true |
| CERT-PTCB | Pharmacy Technician Certification (PTCB) | PTCB | 24 | true |
| CERT-NBSTSA | Surgical Tech Certification (NBSTSA) | NBSTSA | 24 | true |
| CERT-CNA | CNA Certification | MA DPH | 24 | true |

---

## 4. `orip_employee_certifications`

**RID:** `ri.foundry.main.dataset.273e28d0-b70e-4cc5-ae14-574fd9bf68ed`
**Object Type:** `employeeCertification`
**Rows:** 127

### Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `record_id` | `string` | **Primary Key** | e.g. `EC-001` through `EC-127` |
| `employee_id` | `string` | FK → `orip_employees.employee_id` | |
| `cert_id` | `string` | FK → `orip_certifications.cert_id` | |
| `issue_date` | `date` | ISO 8601 | Date certification was issued |
| `expiration_date` | `date` | ISO 8601 | Date certification expires |
| `status` | `string` | Enum | One of: `Active`, `Expiring Soon`, `Expired` |

### Status Logic

| Status | Condition |
|---|---|
| `Active` | `expiration_date` > today + 60 days |
| `Expiring Soon` | today ≤ `expiration_date` ≤ today + 60 days |
| `Expired` | `expiration_date` < today |

### Sample Data

| record_id | employee_id | cert_id | issue_date | expiration_date | status |
|---|---|---|---|---|---|
| EC-001 | EMP-001 | CERT-BLS | 2024-06-01 | 2026-06-01 | Active |
| EC-059 | EMP-012 | CERT-BLS | 2023-03-01 | 2025-03-01 | Expired |
| EC-095 | EMP-019 | CERT-BLS | 2024-03-11 | 2026-03-11 | Expiring Soon |

### Write Operations (Action Types)
- **`renewCertification`** — updates `expiration_date`, `issue_date`, sets `status = 'Active'`
- **`updateCertStatus`** — overrides `status` field manually
- **`addCertificationRecord`** — inserts a new row

---

## 5. `orip_roles`

**RID:** `ri.foundry.main.dataset.a06be38e-f261-47f7-aa92-9851ddafcc59`
**Object Type:** `role`
**Rows:** 10

### Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `role_id` | `string` | **Primary Key** | e.g. `ROLE-RN`, `ROLE-MD-EM` |
| `title` | `string` | NOT NULL | Job title |
| `onet_soc_code` | `string` | | O*NET Standard Occupational Classification code |
| `description` | `string` | | Full role description |
| `department` | `string` | | Primary department assignment |

### Complete Role Catalog

| role_id | title | department | onet_soc_code |
|---|---|---|---|
| ROLE-RN | Registered Nurse | Nursing | 29-1141.00 |
| ROLE-LPN | Licensed Practical Nurse | Nursing | 29-2061.00 |
| ROLE-MD-EM | Emergency Medicine Physician | Emergency | 29-1228.00 |
| ROLE-PA | Physician Assistant | General Medicine | 29-1071.00 |
| ROLE-RT | Respiratory Therapist | ICU | 29-1126.00 |
| ROLE-RAD | Radiologic Technologist | Radiology | 29-2034.00 |
| ROLE-PHARM | Pharmacy Technician | Pharmacy | 29-2052.00 |
| ROLE-MLT | Medical Lab Technician | Lab | 29-2012.00 |
| ROLE-ST | Surgical Technologist | Surgery | 29-2055.00 |
| ROLE-NA | Nursing Assistant | General Medicine | 31-1131.00 |

---

## 6. `orip_role_certs`

**RID:** `ri.foundry.main.dataset.01fa34d4-bf4b-438d-8cd5-7ffc157b6a27`
**Object Type:** `roleCert`
**Rows:** 47

### Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `role_id` | `string` | PK (composite), FK → `orip_roles.role_id` | |
| `cert_id` | `string` | PK (composite), FK → `orip_certifications.cert_id` | |
| `is_mandatory` | `boolean` | | Whether cert is required (vs. recommended) for this role |

### Sample Data

| role_id | cert_id | is_mandatory |
|---|---|---|
| ROLE-RN | CERT-BLS | true |
| ROLE-RN | CERT-ACLS | true |
| ROLE-RN | CERT-RN-LIC | true |
| ROLE-RN | CERT-HIPAA | true |
| ROLE-RT | CERT-BLS | true |
| ROLE-RT | CERT-ACLS | true |
| ROLE-RT | CERT-RT-LIC | true |

### Required Certs by Role

| Role | Required Cert IDs |
|---|---|
| ROLE-RN | CERT-BLS, CERT-ACLS, CERT-RN-LIC, CERT-HIPAA, CERT-IC, CERT-BBP |
| ROLE-LPN | CERT-BLS, CERT-LPN-LIC, CERT-HIPAA, CERT-IC, CERT-BBP |
| ROLE-MD-EM | CERT-BLS, CERT-ACLS, CERT-PALS, CERT-DEA, CERT-HIPAA |
| ROLE-PA | CERT-BLS, CERT-ACLS, CERT-DEA, CERT-HIPAA, CERT-IC |
| ROLE-RT | CERT-BLS, CERT-ACLS, CERT-RT-LIC, CERT-HIPAA, CERT-IC, CERT-BBP |
| ROLE-RAD | CERT-BLS, CERT-ARRT, CERT-HIPAA, CERT-BBP |
| ROLE-PHARM | CERT-BLS, CERT-PTCB, CERT-HIPAA |
| ROLE-MLT | CERT-BLS, CERT-HIPAA, CERT-BBP, CERT-IC |
| ROLE-ST | CERT-BLS, CERT-NBSTSA, CERT-HIPAA, CERT-IC, CERT-BBP |
| ROLE-NA | CERT-BLS, CERT-CNA, CERT-HIPAA, CERT-BBP |

---

## 7. `orip_role_skills`

**RID:** `ri.foundry.main.dataset.acbb51c8-4ccb-4625-a04e-cc605e4dab2b`
**Rows:** 167 (junction table, no Object Type yet)

### Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `role_id` | `string` | PK (composite), FK → `orip_roles.role_id` | |
| `skill_id` | `string` | PK (composite), FK → `orip_skills.skill_id` | |
| `importance` | `float` | 0.0–5.0 | Skill importance score from O*NET |

---

## 8. `orip_skills`

**RID:** `ri.foundry.main.dataset.382f917e-0a08-465f-bf98-31f49f677849`
**Rows:** 27

### Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `skill_id` | `string` | **Primary Key** | e.g. `SKILL-001` |
| `onet_element_id` | `string` | | O*NET element identifier, e.g. `2.A.1.a` |
| `name` | `string` | NOT NULL | Skill name |
| `category` | `string` | | e.g. `Clinical` |

---

## 9. `orip_knowledge`

**RID:** `ri.foundry.main.dataset.505c68c9-d540-4b85-84ef-b8049c4acd5c`
**Rows:** 17

### Schema

| Column | Type | Constraints | Description |
|---|---|---|---|
| `knowledge_id` | `string` | **Primary Key** | e.g. `KNW-001` |
| `onet_element_id` | `string` | | O*NET element identifier |
| `name` | `string` | NOT NULL | Knowledge domain name |
| `category` | `string` | | e.g. `Clinical` |

### Note
No `orip_role_knowledge` junction table exists yet. To model role→knowledge requirements, create a junction table with schema `(role_id, knowledge_id, importance float)` mirroring `orip_role_skills`.

---

## Object Type → Dataset Mapping

| Object Type API Name | Backing Dataset | Primary Key Property |
|---|---|---|
| `facility` | `orip_facilities` | `facilityId` |
| `employee` | `orip_employees` | `employeeId` |
| `certification` | `orip_certifications` | `certId` |
| `employeeCertification` | `orip_employee_certifications` | `recordId` |
| `role` | `orip_roles` | `roleId` |
| `roleCert` | `orip_role_certs` | *(composite: roleId + certId)* |

## OSDK Property Name Mapping (snake_case → camelCase)

| Dataset Column | OSDK Property |
|---|---|
| `facility_id` | `facilityId` |
| `employee_id` | `employeeId` |
| `cert_id` | `certId` |
| `cert_name` | `certName` |
| `record_id` | `recordId` |
| `role_id` | `roleId` |
| `first_name` | `firstName` |
| `last_name` | `lastName` |
| `hire_date` | `hireDate` |
| `employment_status` | `employmentStatus` |
| `readiness_score` | `readinessScore` |
| `expiration_date` | `expirationDate` |
| `issue_date` | `issueDate` |
| `bed_count` | `bedCount` |
| `accreditation_status` | `accreditationStatus` |
| `accreditation_body` | `accreditationBody` |
| `cms_provider_number` | `cmsProviderNumber` |
| `certification_date` | `certificationDate` |
| `is_mandatory` | `isMandatory` |
| `validity_months` | `validityMonths` |
| `issuing_body` | `issuingBody` |
| `onet_soc_code` | `onetSocCode` |
| `onet_element_id` | `onetElementId` |

---

## Action Types

| Action Type | Target Object | Parameters | Effect |
|---|---|---|---|
| `renewCertification` | `employeeCertification` | `recordId`, `newIssueDate`, `newExpiryDate` | Updates dates, sets `status = 'Active'` |
| `flagEmployeeForReview` | `employee` | `employeeId`, `reviewNotes?` | Sets `flaggedForReview = true`, stores notes |
| `addCertificationRecord` | `employeeCertification` | `employeeId`, `certId`, `issueDate`, `expiryDate` | Creates new record with `status = 'Active'` |
| `updateCertStatus` | `employeeCertification` | `recordId`, `status` | Manually overrides status field |
