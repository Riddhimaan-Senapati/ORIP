# datasets/

Data pipeline for the ORIP Clinical Workforce Readiness Platform. Downloads and cleans two public datasets into ontology-ready CSV and JSON files.

---

## Quick Start

```bash
# Install dependencies (Python 3.10+)
pip install -r requirements.txt

# Download + clean everything
python pipeline.py

# Or run steps individually
python download.py        # download raw files
python clean_cms.py       # clean CMS -> facilities.csv
python clean_onet.py      # clean O*NET -> roles, skills, etc.

# Skip download if raw files already exist
python pipeline.py --skip-download
```

---

## Directory Structure

```
datasets/
├── raw/                              # Downloaded source files (gitignored)
│   ├── cms_pos_hospitals.csv         # CMS REST API response (~735 rows for MA)
│   ├── onet_db.zip                   # O*NET Excel archive (44.9 MB)
│   └── onet/                         # Extracted O*NET workbooks
│       ├── Occupation Data.xlsx
│       ├── Skills.xlsx
│       ├── Knowledge.xlsx
│       └── Education, Training, and Experience.xlsx
│
├── clean/                            # Processed, ontology-aligned output
│   ├── facilities.csv / .json        # Facility objects (CMS)
│   ├── roles.csv / .json             # Role objects (O*NET)
│   ├── skills.csv / .json            # Skill objects (O*NET)
│   ├── knowledge.csv / .json         # Knowledge domain objects (O*NET)
│   ├── role_skills.csv / .json       # Role <-> Skill edges
│   ├── role_knowledge.csv / .json    # Role <-> Knowledge edges
│   └── role_certs.csv / .json        # Role <-> Certification edges
│
├── download.py                       # Downloader (CMS API + O*NET zip)
├── clean_cms.py                      # CMS POS cleaner
├── clean_onet.py                     # O*NET cleaner
├── pipeline.py                       # Orchestrator
└── requirements.txt
```

---

## Source 1 — CMS Provider of Services (POS)

**Dataset:** Provider of Services File — Quality Improvement and Evaluation System
**Publisher:** Centers for Medicare & Medicaid Services
**License:** Public domain (U.S. government)
**Update frequency:** Quarterly

### Discovery

The CMS portal (`data.cms.gov`) is a JavaScript SPA and cannot be scraped directly. The machine-readable catalog is available at:

```
GET https://data.cms.gov/data.json
```

This returns 152 datasets as a DCAT-compliant JSON catalog. The POS dataset was located by searching for `"Provider of Services File"` in the title field.

### API Access

Each dataset in the catalog exposes a REST API endpoint under `data-api/v1/dataset/{uuid}/data`:

```
GET https://data.cms.gov/data-api/v1/dataset/8ba0f9b4-9493-4aa0-9f82-44ea9468d1b5/data
    ?size=2000
    &offset=0
    &filter[STATE_CD]=MA
```

**Query parameters:**

| Parameter | Description |
|-----------|-------------|
| `size` | Records per page (max 2000) |
| `offset` | Pagination offset |
| `filter[COLUMN]=VALUE` | Filter by any column value |

We use `filter[STATE_CD]=MA` to pull only Massachusetts hospitals, reducing the response from ~60,000 national records to 735 MA records.

### CSV Fallback

Each quarterly release also has a direct CSV download (UUID-based path from the catalog):

```
https://data.cms.gov/sites/default/files/2026-01/c500f848-83b3-4f29-a677-562243a2f23b/Hospital_and_other.DATA.Q4_2025.csv
```

The `download.py` script tries the API first, then falls back to the CSV if the API fails.

### Key Columns Used

| Raw Column | Clean Column | Description |
|------------|--------------|-------------|
| `FAC_NAME` | `name` | Facility name |
| `ST_ADR`, `CITY_NAME`, `STATE_CD`, `ZIP_CD` | `address` | Full address (combined) |
| `PRVDR_CTGRY_SBTYP_CD` | `type` | Facility subtype (mapped to readable name) |
| `BED_CNT` | `bed_count` | Licensed bed count |
| `ACRDTN_TYPE_CD` | `accreditation_status` | Active / Not Accredited |
| `PRVDR_NUM` | `cms_provider_number` | CMS Certification Number |
| `TRMNTN_EXPRTN_DT` | *(filter)* | Blank = active provider |

### Cleaning Steps (`clean_cms.py`)

1. Load CSV (473 columns total)
2. Select and rename 13 relevant columns
3. Filter to Massachusetts (`STATE_CD == MA`)
4. Drop terminated providers (`TRMNTN_EXPRTN_DT` is non-empty)
5. Map `PRVDR_CTGRY_SBTYP_CD` codes to readable facility type names
6. Parse `ACRDTN_TYPE_CD` → `accreditation_status` + `accreditation_body`
7. Coerce `BED_CNT` to integer
8. Combine address fields into a single `address` string
9. Assign sequential `FAC-XXXX` IDs
10. Export `facilities.csv` and `facilities.json`

**Output:** 377 active MA hospital and non-hospital facilities.

---

## Source 2 — O*NET Database

**Dataset:** O*NET 29.0 Database (Excel Edition)
**Publisher:** U.S. Department of Labor / O*NET Resource Center
**License:** Creative Commons CC BY 4.0
**URL:** `https://www.onetcenter.org/database.html`

### Download

The full database is distributed as a zip archive:

```
https://www.onetcenter.org/dl_files/database/db_29_0_excel.zip  (44.9 MB)
```

> **Note:** The zip contains `Technology Skills.xlsx` whose filename ends with `Skills.xlsx`, which would conflict with the core `Skills.xlsx` if using `str.endswith()` matching. The downloader uses exact basename matching (`n.split("/")[-1] == target`) to extract the correct files.

### Scope

Filtered to 10 healthcare occupation SOC codes (29-XXXX and 31-XXXX series):

```
29-1071.00  Physician Assistants
29-1126.00  Respiratory Therapists
29-1141.00  Registered Nurses
29-1211.00  Emergency Medicine Physicians
29-2012.00  Medical Lab Technicians
29-2034.00  Radiologic Technologists
29-2052.00  Pharmacy Technicians
29-2055.00  Surgical Technologists
29-2061.00  Licensed Practical Nurses
31-1131.00  Nursing Assistants
```

### Files Used

| File | Purpose |
|------|---------|
| `Occupation Data.xlsx` | Role title, SOC code, description |
| `Skills.xlsx` | Skill importance and level by occupation (Scale ID = `IM`) |
| `Knowledge.xlsx` | Knowledge domain importance by occupation (Scale ID = `IM`) |
| `Education, Training, and Experience.xlsx` | Education requirements (not yet used) |

### Importance Score Threshold

O*NET rates each skill/knowledge item on a 1–5 importance scale. Only items with `importance >= 3.0` are included, treating them as required competencies.

### Cleaning Steps (`clean_onet.py`)

**Roles:**
1. Read `Occupation Data.xlsx`, filter to target SOC codes
2. Map SOC → `ROLE-XX` IDs and add `department` from domain model
3. Export `roles.csv`

**Skills:**
1. Read `Skills.xlsx`, filter to target SOC codes + Scale ID `IM`
2. Drop skills below importance threshold 3.0
3. Assign category by O*NET element ID prefix (`2.A.1.x` → Clinical, `2.B.3.x` → Technical, etc.)
4. Deduplicate to unique skill objects → `skills.csv`
5. Write role ↔ skill importance edges → `role_skills.csv`

**Knowledge:**
1. Same process as Skills using `Knowledge.xlsx`
2. All knowledge domains categorised as `Clinical` for healthcare context
3. Outputs `knowledge.csv` and `role_knowledge.csv`

**Role → Cert mapping:**
- O*NET does not encode certification requirements directly
- `role_certs.csv` is derived from regulatory standards:
  - American Heart Association (BLS, ACLS, PALS)
  - CMS / State nursing boards (RN license, LPN license, CNA)
  - DEA (prescribing providers)
  - OSHA (Blood-Borne Pathogen Training)
  - APIC (Infection Control)
  - ARRT, PTCB, NBSTSA (specialty certifications)

### Output Summary

| File | Rows | Description |
|------|------|-------------|
| `roles.csv` | 10 | Clinical role objects |
| `skills.csv` | 27 | Occupational skill objects |
| `knowledge.csv` | 17 | Knowledge domain objects |
| `role_skills.csv` | 167 | Role ↔ Skill importance edges |
| `role_knowledge.csv` | 87 | Role ↔ Knowledge importance edges |
| `role_certs.csv` | 47 | Role ↔ required Certification edges |

---

## Output Schema Reference

### `facilities.csv`

```
facility_id, name, address, type, bed_count,
accreditation_status, accreditation_body, cms_provider_number, certification_date
```

### `roles.csv`

```
role_id, title, onet_soc_code, description, department
```

### `skills.csv`

```
skill_id, onet_element_id, name, category
```

### `knowledge.csv`

```
knowledge_id, onet_element_id, name, category
```

### `role_skills.csv` / `role_knowledge.csv`

```
role_id, skill_id | knowledge_id, importance
```

### `role_certs.csv`

```
role_id, cert_id, is_mandatory
```

---

## Updating for a New Quarterly Release

When CMS publishes a new POS quarter:

1. Open `download.py`
2. Update `CMS_API_URL` with the new dataset UUID from `data.cms.gov/data.json`
3. Prepend the new CSV URL to `CMS_CSV_URLS`
4. Delete `raw/cms_pos_hospitals.csv` and re-run `python pipeline.py`

To find the new UUID:
```python
import requests, json
r = requests.get("https://data.cms.gov/data.json")
datasets = r.json()["dataset"]
pos = next(d for d in datasets if "Provider of Services File - Quality" in d["title"])
print(pos["distribution"][0])  # newest release is first
```
