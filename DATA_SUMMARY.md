# ORIP — Dataset Summary

This document summarizes all datasets currently available in the project. Data lives in `datasets/` and feeds the ontology objects used by the platform and the Next.js frontend.

---

## Repository Layout

```
certReady/
├── datasets/
│   ├── raw/                         # Downloaded source files (not committed)
│   │   ├── cms_pos_hospitals.csv    # CMS POS API response (735 MA records)
│   │   ├── onet_db.zip              # O*NET Excel archive (44.9 MB)
│   │   └── onet/
│   │       ├── Occupation Data.xlsx
│   │       ├── Skills.xlsx
│   │       ├── Knowledge.xlsx
│   │       └── Education, Training, and Experience.xlsx
│   ├── clean/                       # Processed, ontology-ready files
│   │   ├── facilities.csv / .json
│   │   ├── roles.csv / .json
│   │   ├── skills.csv / .json
│   │   ├── knowledge.csv / .json
│   │   ├── role_skills.csv / .json
│   │   ├── role_knowledge.csv / .json
│   │   └── role_certs.csv / .json
│   ├── download.py
│   ├── clean_cms.py
│   ├── clean_onet.py
│   ├── pipeline.py
│   └── requirements.txt
├── frontend/                        # Next.js 16 dashboard app
└── project_idea.md
```

---

## 1. CMS Provider of Services (POS) File

**Source:** Centers for Medicare & Medicaid Services
**Dataset:** Provider of Services File — Quality Improvement and Evaluation System
**Catalog:** [`data.cms.gov/data.json`](https://data.cms.gov/data.json) (identifier: `8ba0f9b4-9493-4aa0-9f82-44ea9468d1b5`)
**Update frequency:** Quarterly
**License:** Public domain (U.S. government)

### How it was accessed

The CMS portal is a JavaScript SPA that cannot be scraped. The machine-readable catalog at `https://data.cms.gov/data.json` exposes all 152 datasets with their distribution URLs. From this catalog we identified two relevant datasets:

- **Provider of Services File — Quality Improvement and Evaluation System** (hospitals & non-hospital facilities)
- **Provider of Services File — Internet Quality Improvement and Evaluation System** (home health, ASC, hospice)

We use the former. Access is via:

| Method | URL |
|--------|-----|
| REST API (used) | `https://data.cms.gov/data-api/v1/dataset/8ba0f9b4-9493-4aa0-9f82-44ea9468d1b5/data` |
| Direct CSV (fallback) | `https://data.cms.gov/sites/default/files/2026-01/c500f848-.../Hospital_and_other.DATA.Q4_2025.csv` |

The API supports `?size=N&offset=N&filter[COLUMN]=VALUE`. We filter to `STATE_CD=MA` to pull only Massachusetts hospitals.

### Clean output: `facilities.csv`

| Column | Type | Description |
|--------|------|-------------|
| `facility_id` | string | Assigned ID (`FAC-0001` … `FAC-0377`) |
| `name` | string | Hospital name |
| `address` | string | Full street address |
| `type` | string | Facility subtype (see below) |
| `bed_count` | integer | Licensed bed count |
| `accreditation_status` | string | `Active` or `Not Accredited` |
| `accreditation_body` | string | TJC, AOA, DNV, CIHQ, HFAP |
| `cms_provider_number` | string | CMS Certification Number (CCN) |
| `certification_date` | string | Date of initial CMS certification |

### Statistics

| Metric | Value |
|--------|-------|
| Total rows (active MA providers) | **377** |
| Accredited | **219 / 377** (58%) |
| Bed count range | 0 – 1,014 |

**Facility types:**

| Type | Count |
|------|-------|
| Short-Term Acute Care | 313 |
| Hospital (unclassified) | 19 |
| Rehabilitation | 19 |
| Long-Term Care | 12 |
| Children's | 6 |
| Religious Non-Medical | 4 |
| Distinct Part Psychiatric | 3 |
| Psychiatric | 1 |

---

## 2. O*NET Database

**Source:** U.S. Department of Labor, Employment and Training Administration
**Version:** db_29_0 (Excel edition)
**Download:** `https://www.onetcenter.org/dl_files/database/db_29_0_excel.zip` (44.9 MB)
**License:** Public domain (Creative Commons CC BY 4.0)

### Scope

Filtered to 10 clinical occupation SOC codes:

| Role ID | SOC Code | Title |
|---------|----------|-------|
| ROLE-RN | 29-1141.00 | Registered Nurses |
| ROLE-LPN | 29-2061.00 | Licensed Practical and Licensed Vocational Nurses |
| ROLE-MD-EM | 29-1211.00 | Emergency Medicine Physicians |
| ROLE-PA | 29-1071.00 | Physician Assistants |
| ROLE-RT | 29-1126.00 | Respiratory Therapists |
| ROLE-RAD | 29-2034.00 | Radiologic Technologists and Technicians |
| ROLE-PHARM | 29-2052.00 | Pharmacy Technicians |
| ROLE-MLT | 29-2012.00 | Medical and Clinical Laboratory Technicians |
| ROLE-ST | 29-2055.00 | Surgical Technologists |
| ROLE-NA | 31-1131.00 | Nursing Assistants |

### Clean outputs

#### `roles.csv` — 10 rows

Role objects with O*NET title, SOC code, description, and assigned department.

#### `skills.csv` — 27 rows

O*NET occupational skills filtered to importance score ≥ 3.0 across target roles.

| Column | Description |
|--------|-------------|
| `skill_id` | `SKILL-001` … `SKILL-027` |
| `onet_element_id` | O*NET element identifier (e.g., `2.A.1.a`) |
| `name` | Skill name |
| `category` | Clinical (19), Technical (7), Regulatory (1) |

**Top 5 skills by average importance across all 10 roles:**

| Skill | Avg Importance (out of 5) |
|-------|--------------------------|
| Active Listening | 3.85 |
| Speaking | 3.64 |
| Critical Thinking | 3.64 |
| Reading Comprehension | 3.62 |
| Monitoring | 3.61 |

#### `knowledge.csv` — 17 rows

O*NET knowledge domains (importance ≥ 3.0). Includes: Medicine and Dentistry, Biology, Chemistry, Psychology, Therapy and Counseling, and 12 others.

#### `role_skills.csv` — 167 rows

Many-to-many: `role_id`, `skill_id`, `importance`. Skills per role range from 8 (Nursing Assistant) to 22 (Physician).

#### `role_knowledge.csv` — 87 rows

Many-to-many: `role_id`, `knowledge_id`, `importance`.

#### `role_certs.csv` — 47 rows

Many-to-many role ↔ certification mapping. Derived from regulatory standards (AHA, CMS, OSHA, state nursing boards) since O*NET does not encode specific certification requirements.

**Required certs per role:**

| Role | Required Certifications |
|------|------------------------|
| ROLE-RN / ROLE-RT | 6 each (BLS, ACLS, license, HIPAA, IC, BBP) |
| ROLE-MD-EM / ROLE-LPN / ROLE-PA / ROLE-ST | 5 each |
| ROLE-MLT / ROLE-NA / ROLE-RAD | 4 each |
| ROLE-PHARM | 3 (BLS, PTCB, HIPAA) |

---

## 3. Synthetic Employee & Certification Data

**Source:** Generated (in `frontend/src/lib/data.ts`)
**Scope:** 25 employees across 3 MA facilities with full certification histories
**Used by:** Next.js frontend (mock data layer, not yet loaded to Foundry)

| Object | Count |
|--------|-------|
| Facilities | 3 |
| Employees | 25 |
| Roles | 10 |
| Certifications | 15 |
| EmployeeCertification records | 127 |

Intentional compliance gaps: ~15% expired certs, ~5% expiring soon, clustered in the ICU department at Riverside Community Medical Center (readiness score: 58%).

---

## Ontology Object Mapping

| Object Type | Source | Clean File |
|-------------|--------|-----------|
| `Facility` | CMS POS (real) | `facilities.csv` |
| `Role` | O*NET (real) | `roles.csv` |
| `Skill` | O*NET (real) | `skills.csv` |
| `Knowledge` | O*NET (real) | `knowledge.csv` |
| `Employee` | Synthetic | `frontend/src/lib/data.ts` |
| `Certification` | Domain knowledge | `frontend/src/lib/data.ts` |
| `EmployeeCertification` | Synthetic | `frontend/src/lib/data.ts` |
| `Role → Skill` | O*NET (real) | `role_skills.csv` |
| `Role → Knowledge` | O*NET (real) | `role_knowledge.csv` |
| `Role → Certification` | Regulatory standards | `role_certs.csv` |
