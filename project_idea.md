# Clinical Workforce Readiness Platform (ORIP)

## Project Overview

An ontology-driven workforce readiness platform built on Palantir AIP that connects clinical staff competency data to operational outcomes — enabling hospital leaders to move beyond tracking course completions toward understanding whether their organization can actually execute safely.

**Stack:** Palantir Foundry + AIP (Ontology, Agent Studio, Logic, Evals), Next.js frontend connected via Palantir Ontology MCP/APIs, built with Claude Code.

**Timeline:** 2 days

**Industry vertical:** Healthcare — clinical staff certification and skill readiness across a hospital network.

---

## The Problem

Hospital networks must ensure clinical staff are properly certified and skilled across facilities. Expired certifications mean compliance violations, patient safety risk, and potential loss of accreditation (e.g., Joint Commission). Today this is largely tracked in spreadsheets or disconnected HR systems. No one has a real-time, queryable view of organizational readiness — and when something goes wrong, there's no fast way to trace whether a training gap contributed.

---

## Public Dataset

### CMS Provider of Services (POS) File

- **Source:** Centers for Medicare & Medicaid Services (CMS)
- **URL:** https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/provider-of-services-file-hospital-non-hospital-type
- **What it contains:** Facility-level data for hospitals, including facility name, address, type, bed count, staffing levels, certification status, and compliance indicators.
- **Use for:** Populating the Facility ontology objects with real hospital data (names, locations, sizes, departments).

### O*NET Database (Skills & Occupation Data)

- **Source:** U.S. Department of Labor
- **URL:** https://www.onetcenter.org/database.html
- **What it contains:** Skill requirements, abilities, knowledge areas, education/training requirements for every standard occupation code in the U.S.
- **Use for:** Mapping required skills and certifications to clinical roles (RN, LPN, Respiratory Therapist, Radiology Tech, etc.). Filter to healthcare SOC codes (29-XXXX series).
- **Key files to download:**
  - `Skills.xlsx` — skill importance and level by occupation
  - `Knowledge.xlsx` — knowledge domain requirements by occupation
  - `Education, Training, and Experience.xlsx` — education and certification requirements
  - `Occupation Data.xlsx` — occupation titles and descriptions

### Synthetic Employee Data (You Generate This)

Since real employee-level healthcare data is protected (HIPAA), generate a synthetic dataset using an LLM. Use the structure below.

---

## Ontology Design

### Objects (5 total)

#### 1. Facility
| Property | Type | Example |
|----------|------|---------|
| facility_id | string | `FAC-001` |
| name | string | `Metro General Hospital` |
| address | string | `123 Main St, Boston, MA` |
| type | string | `Acute Care` |
| bed_count | integer | `350` |
| accreditation_status | string | `Active` |

**Source:** CMS Provider of Services file (use real hospital names/data).

#### 2. Employee
| Property | Type | Example |
|----------|------|---------|
| employee_id | string | `EMP-0042` |
| first_name | string | `Sarah` |
| last_name | string | `Chen` |
| role_id | string (link) | `ROLE-RN` |
| facility_id | string (link) | `FAC-001` |
| department | string | `ICU` |
| hire_date | date | `2021-03-15` |
| employment_status | string | `Active` |

**Source:** Synthetic. Generate ~50 employees across 3 facilities and ~6 departments.

#### 3. Role
| Property | Type | Example |
|----------|------|---------|
| role_id | string | `ROLE-RN` |
| title | string | `Registered Nurse` |
| department | string | `Nursing` |
| onet_soc_code | string | `29-1141.00` |
| required_skill_ids | string[] (links) | `[SKILL-001, SKILL-005]` |
| required_cert_ids | string[] (links) | `[CERT-BLS, CERT-ACLS]` |

**Source:** O*NET occupation data filtered to healthcare codes. Map required skills and certifications per role.

**Roles to include (~10):**
- Registered Nurse (29-1141.00)
- Licensed Practical Nurse (29-2061.00)
- Physician — Emergency Medicine (29-1211.00)
- Physician Assistant (29-1071.00)
- Respiratory Therapist (29-1126.00)
- Radiologic Technologist (29-2034.00)
- Pharmacy Technician (29-2052.00)
- Medical Lab Technician (29-2012.00)
- Surgical Technologist (29-2055.00)
- Nursing Assistant (31-1131.00)

#### 4. Skill
| Property | Type | Example |
|----------|------|---------|
| skill_id | string | `SKILL-001` |
| name | string | `Critical Thinking` |
| category | string | `Clinical` |
| onet_element_id | string | `2.A.1.b` |
| description | string | `Using logic and reasoning to identify strengths and weaknesses of alternative solutions.` |

**Source:** O*NET Skills.xlsx. Filter to skills relevant to healthcare roles.

**Skill categories:**
- Clinical (patient assessment, medication administration, wound care)
- Technical (equipment operation, lab procedures, imaging)
- Regulatory (HIPAA compliance, infection control, documentation)
- Interpersonal (communication, teamwork, patient education)

#### 5. Certification
| Property | Type | Example |
|----------|------|---------|
| cert_id | string | `CERT-BLS` |
| name | string | `Basic Life Support (BLS)` |
| issuing_body | string | `American Heart Association` |
| validity_months | integer | `24` |
| is_regulatory_requirement | boolean | `true` |

**Certifications to include (~15):**
- BLS (Basic Life Support) — required for all clinical staff
- ACLS (Advanced Cardiovascular Life Support) — required for RNs, MDs, PAs
- PALS (Pediatric Advanced Life Support) — required for ER/Peds staff
- NRP (Neonatal Resuscitation Program) — required for NICU staff
- State RN License — required for all RNs
- State LPN License — required for all LPNs
- DEA Registration — required for prescribing providers
- HIPAA Compliance Training — required for all staff (annual)
- Infection Control Certification — required for all clinical staff (annual)
- Blood-Borne Pathogen Training — required for all clinical staff (annual)
- Respiratory Therapy License — required for RTs
- Radiology Certification (ARRT) — required for Rad Techs
- Pharmacy Technician Certification (PTCB) — required for Pharm Techs
- Surgical Tech Certification (NBSTSA) — required for Surg Techs
- CNA Certification — required for Nursing Assistants

### Link Object: EmployeeCertification

| Property | Type | Example |
|----------|------|---------|
| record_id | string | `EC-00123` |
| employee_id | string (link) | `EMP-0042` |
| cert_id | string (link) | `CERT-BLS` |
| issue_date | date | `2024-06-15` |
| expiry_date | date | `2026-06-15` |
| status | string | `Active` / `Expiring Soon` / `Expired` |

**Source:** Synthetic. Generate ~200 records. Intentionally include:
- ~15% expired certifications (to show risk)
- ~20% expiring within 60 days (to show upcoming risk)
- ~65% active and compliant
- Cluster some gaps in specific departments/facilities to create interesting patterns (e.g., ICU at Facility 2 has high expiration rate)

### Ontology Relationships
```
Facility --has_many--> Employee
Employee --has_role--> Role
Role --requires--> Skill (many-to-many)
Role --requires--> Certification (many-to-many)
Employee --holds--> EmployeeCertification --references--> Certification
```

---

## Readiness Score Calculation

Each entity gets a readiness score from 0–100:

### Employee Readiness Score
```
score = (number of active required certs / total required certs for role) × 100
```
- 100 = fully compliant
- 80–99 = minor gaps (yellow)
- Below 80 = critical gaps (red)

### Team/Department Readiness Score
```
score = average of all employee readiness scores in that department
```

### Facility Readiness Score
```
score = average of all department readiness scores in that facility
```

---

## AIP Agent (Agent Studio)

Build one agent that managers and L&D leads interact with via natural language.

### Agent Name
`Clinical Readiness Advisor`

### Agent Capabilities
The agent should be able to answer queries like:
- "Which ICU nurses at Metro General have certifications expiring in the next 30 days?"
- "What's the overall readiness score for Facility 2?"
- "Who is qualified to cover a shift in the ER right now?"
- "Show me all staff with expired ACLS certifications."
- "What are the biggest compliance gaps across the network?"
- "If I need to staff a trauma team, who's available and fully certified?"

### Agent Grounding
The agent must be grounded in the Ontology — it queries Employee, Role, Certification, and EmployeeCertification objects to answer. It should never hallucinate staff names, cert statuses, or readiness scores.

### AIP Logic Workflows
- **Auto-flag expiring certs:** When a certification's expiry_date is within 60 days, automatically update EmployeeCertification status to `Expiring Soon`.
- **Auto-flag expired certs:** When expiry_date has passed, update status to `Expired` and reduce employee readiness score.
- **Alert generation:** When a department's readiness score drops below 80, generate an alert for the department manager.

---

## Next.js Frontend (via Ontology MCP / APIs)

### Pages

#### 1. Network Overview Dashboard (`/`)
- 3 facility cards showing readiness score (color-coded green/yellow/red)
- Total employees, total expired certs, total expiring soon
- Bar chart: readiness score by department across the network

#### 2. Facility Detail (`/facility/[id]`)
- Department-level readiness breakdown
- List of employees with critical gaps (expired certs)
- Upcoming expirations timeline (next 30/60/90 days)

#### 3. Employee Detail (`/employee/[id]`)
- Employee profile: role, facility, department, hire date
- Certification table: cert name, status, issue date, expiry date (color-coded rows)
- Individual readiness score with breakdown

#### 4. Agent Chat (`/advisor`)
- Chat interface to the Clinical Readiness Advisor AIP agent
- Manager types natural language queries, gets responses grounded in ontology data

### Connection to Palantir
- Use **Ontology MCP** or **Ontology SDK (@osdk)** to connect the Next.js app to Foundry
- All data reads come from the ontology — the frontend does not have its own database
- Authentication via Palantir's OAuth flow or service token for the prototype

---

## Synthetic Data Generation Prompt

Use this prompt with an LLM to generate the synthetic employee and certification data:

```
Generate a JSON dataset for a healthcare workforce readiness demo with the following structure:

3 Facilities:
- Metro General Hospital (Boston, MA) — 350 beds, Acute Care
- Riverside Community Medical Center (Cambridge, MA) — 180 beds, General
- Harbor View Specialty Clinic (Quincy, MA) — 60 beds, Specialty

50 Employees spread across these facilities with realistic:
- Names (diverse, realistic)
- Roles from this list: Registered Nurse, Licensed Practical Nurse, Emergency Medicine Physician, Physician Assistant, Respiratory Therapist, Radiologic Technologist, Pharmacy Technician, Medical Lab Technician, Surgical Technologist, Nursing Assistant
- Departments: ICU, Emergency, Surgery, Radiology, Pharmacy, General Medicine
- Hire dates between 2018–2025

For each employee, generate EmployeeCertification records based on what their role requires. Use these certifications:
BLS, ACLS, PALS, NRP, State RN License, State LPN License, DEA Registration, HIPAA Compliance, Infection Control, Blood-Borne Pathogen Training, Respiratory Therapy License, ARRT Certification, PTCB Certification, NBSTSA Certification, CNA Certification

IMPORTANT — create realistic gaps:
- ~15% of certs should be expired (expiry_date in the past)
- ~20% should be expiring within the next 60 days
- ~65% should be active and valid
- Cluster expired certs in the ICU department at Riverside to create an interesting pattern
- Have at least 2 employees with ALL certs expired (critical risk individuals)
- Have at least 5 employees with perfect compliance

Output as JSON with arrays for: facilities, employees, certifications, employee_certifications.
Include all IDs so relationships are explicit.
```

---

## Two-Day Build Plan

### Day 1 — Data & Infrastructure

**Morning (4 hours):**
1. Download O*NET data files, filter to healthcare SOC codes (29-XXXX)
2. Generate synthetic employee/certification data using the prompt above
3. Create ontology in Foundry: define the 5 object types and relationships
4. Load all data into Foundry ontology

**Afternoon (4 hours):**
5. Scaffold Next.js app using Claude Code (`npx create-next-app`)
6. Connect to Foundry via Ontology SDK or MCP
7. Build the Network Overview Dashboard page — get facility readiness scores rendering
8. Build the Facility Detail page with department breakdown

### Day 2 — Agent & Polish

**Morning (4 hours):**
9. Build the Clinical Readiness Advisor agent in AIP Agent Studio
10. Ground it in the ontology objects
11. Test with the sample queries listed above
12. Build the Agent Chat page in Next.js, wire it to the AIP agent

**Afternoon (4 hours):**
13. Build the Employee Detail page
14. Add AIP Logic workflows (auto-flag expiring/expired certs, alert generation)
15. Polish UI — color coding, loading states, responsive layout
16. Write a 3-minute demo script and record a walkthrough

---

## Demo Script (3 minutes)

1. **Open Dashboard (30 sec):** "This is our network overview. Three facilities. Metro General is green at 92% readiness. Riverside is red at 71%. That immediately tells leadership where to focus."

2. **Drill into Riverside (45 sec):** "Clicking into Riverside, we see the ICU department is the problem — 58% readiness. 6 nurses have expired ACLS certifications. This is a patient safety risk and a Joint Commission compliance issue."

3. **View an Employee (30 sec):** "Here's Sarah Chen — ICU nurse at Riverside. Her BLS expired 3 months ago, and her ACLS expires next week. Her readiness score is 40%. She shouldn't be on the schedule until these are renewed."

4. **Ask the Agent (60 sec):** "Now I can ask our AI advisor: 'Who in the ICU at Riverside is fully certified and can cover shifts while others recertify?' The agent queries the ontology and gives me 3 qualified nurses. I can also ask 'What's the fastest way to get the ICU back to 90% readiness?' and it prioritizes the certifications with the most impact."

5. **Close (15 sec):** "This is what ontology-driven operational readiness looks like. Not just tracking who completed a course — but knowing whether your organization can execute safely, right now."

---

## Why This Would Impress Palantir

1. **Ontology-first thinking** — The project models a real-world domain as interconnected objects with relationships, which is exactly how Palantir thinks about every problem.
2. **Operational, not analytical** — This isn't a dashboard that shows historical trends. It answers "can we execute right now?" which is the core Palantir value proposition.
3. **AIP-native** — Uses Agent Studio, Logic workflows, and ontology grounding — not just bolting a chatbot onto a database.
4. **Real business pain** — Healthcare compliance and workforce readiness is a billion-dollar problem with regulatory teeth (Joint Commission, CMS).
5. **Built with modern tools** — Next.js + Ontology MCP + Claude Code shows you can ship fast with current-gen tooling.
6. **Uses public data** — O*NET and CMS data show you can work with real government datasets, not just toy examples.