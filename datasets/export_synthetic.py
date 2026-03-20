"""
Export synthetic employee / certification data to CSV for Foundry upload.

Source: frontend/src/lib/data.ts  (hardcoded mirror -- update if data.ts changes)

Outputs (datasets/clean/):
  employees.csv              -- 25 rows
  certifications.csv         -- 15 rows
  employee_certifications.csv -- 127 rows
"""

import csv
import json
from pathlib import Path

CLEAN_DIR = Path(__file__).parent / "clean"
CLEAN_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------------------------------
# Certifications (15)
# ---------------------------------------------------------------------------

CERTIFICATIONS = [
    {"cert_id": "CERT-BLS",    "name": "Basic Life Support (BLS)",                    "issuing_body": "American Heart Association", "validity_months": 24, "is_mandatory": True},
    {"cert_id": "CERT-ACLS",   "name": "Advanced Cardiovascular Life Support (ACLS)", "issuing_body": "American Heart Association", "validity_months": 24, "is_mandatory": True},
    {"cert_id": "CERT-PALS",   "name": "Pediatric Advanced Life Support (PALS)",      "issuing_body": "American Heart Association", "validity_months": 24, "is_mandatory": True},
    {"cert_id": "CERT-NRP",    "name": "Neonatal Resuscitation Program (NRP)",         "issuing_body": "AAP",                        "validity_months": 24, "is_mandatory": True},
    {"cert_id": "CERT-RN-LIC", "name": "State RN License",                            "issuing_body": "MA Board of Nursing",        "validity_months": 24, "is_mandatory": True},
    {"cert_id": "CERT-LPN-LIC","name": "State LPN License",                           "issuing_body": "MA Board of Nursing",        "validity_months": 24, "is_mandatory": True},
    {"cert_id": "CERT-DEA",    "name": "DEA Registration",                            "issuing_body": "Drug Enforcement Agency",    "validity_months": 36, "is_mandatory": True},
    {"cert_id": "CERT-HIPAA",  "name": "HIPAA Compliance Training",                   "issuing_body": "Internal",                   "validity_months": 12, "is_mandatory": True},
    {"cert_id": "CERT-IC",     "name": "Infection Control Certification",              "issuing_body": "APIC",                       "validity_months": 12, "is_mandatory": True},
    {"cert_id": "CERT-BBP",    "name": "Blood-Borne Pathogen Training",               "issuing_body": "OSHA",                       "validity_months": 12, "is_mandatory": True},
    {"cert_id": "CERT-RT-LIC", "name": "Respiratory Therapy License",                 "issuing_body": "MA DPH",                     "validity_months": 24, "is_mandatory": True},
    {"cert_id": "CERT-ARRT",   "name": "Radiology Certification (ARRT)",              "issuing_body": "ARRT",                       "validity_months": 24, "is_mandatory": True},
    {"cert_id": "CERT-PTCB",   "name": "Pharmacy Technician Certification (PTCB)",    "issuing_body": "PTCB",                       "validity_months": 24, "is_mandatory": True},
    {"cert_id": "CERT-NBSTSA", "name": "Surgical Tech Certification (NBSTSA)",        "issuing_body": "NBSTSA",                     "validity_months": 24, "is_mandatory": True},
    {"cert_id": "CERT-CNA",    "name": "CNA Certification",                           "issuing_body": "MA DPH",                     "validity_months": 24, "is_mandatory": True},
]


# ---------------------------------------------------------------------------
# Employees (25)
# ---------------------------------------------------------------------------

EMPLOYEES = [
    # FAC-001 Metro General
    {"employee_id": "EMP-001", "first_name": "Sarah",    "last_name": "Chen",      "role_id": "ROLE-RN",    "facility_id": "FAC-001", "department": "ICU",             "hire_date": "2021-03-15", "employment_status": "Active", "readiness_score": 100},
    {"employee_id": "EMP-002", "first_name": "Marcus",   "last_name": "Johnson",   "role_id": "ROLE-RN",    "facility_id": "FAC-001", "department": "ICU",             "hire_date": "2019-07-22", "employment_status": "Active", "readiness_score": 83},
    {"employee_id": "EMP-003", "first_name": "Priya",    "last_name": "Patel",     "role_id": "ROLE-RT",    "facility_id": "FAC-001", "department": "ICU",             "hire_date": "2022-01-10", "employment_status": "Active", "readiness_score": 100},
    {"employee_id": "EMP-004", "first_name": "James",    "last_name": "Rivera",    "role_id": "ROLE-MD-EM", "facility_id": "FAC-001", "department": "Emergency",       "hire_date": "2018-11-05", "employment_status": "Active", "readiness_score": 100},
    {"employee_id": "EMP-005", "first_name": "Aisha",    "last_name": "Williams",  "role_id": "ROLE-RN",    "facility_id": "FAC-001", "department": "Emergency",       "hire_date": "2020-04-18", "employment_status": "Active", "readiness_score": 83},
    {"employee_id": "EMP-006", "first_name": "Daniel",   "last_name": "Kim",       "role_id": "ROLE-ST",    "facility_id": "FAC-001", "department": "Surgery",         "hire_date": "2023-02-28", "employment_status": "Active", "readiness_score": 100},
    {"employee_id": "EMP-007", "first_name": "Natalie",  "last_name": "Torres",    "role_id": "ROLE-RAD",   "facility_id": "FAC-001", "department": "Radiology",       "hire_date": "2021-09-14", "employment_status": "Active", "readiness_score": 75},
    {"employee_id": "EMP-008", "first_name": "Leon",     "last_name": "Brooks",    "role_id": "ROLE-LPN",   "facility_id": "FAC-001", "department": "ICU",             "hire_date": "2022-06-30", "employment_status": "Active", "readiness_score": 100},
    {"employee_id": "EMP-009", "first_name": "Hannah",   "last_name": "Fischer",   "role_id": "ROLE-PA",    "facility_id": "FAC-001", "department": "Emergency",       "hire_date": "2019-12-01", "employment_status": "Active", "readiness_score": 100},
    {"employee_id": "EMP-010", "first_name": "Carlos",   "last_name": "Moreno",    "role_id": "ROLE-NA",    "facility_id": "FAC-001", "department": "ICU",             "hire_date": "2024-01-08", "employment_status": "Active", "readiness_score": 100},
    # FAC-002 Riverside
    {"employee_id": "EMP-011", "first_name": "Diana",    "last_name": "Nguyen",    "role_id": "ROLE-RN",    "facility_id": "FAC-002", "department": "ICU",             "hire_date": "2020-08-15", "employment_status": "Active", "readiness_score": 33},
    {"employee_id": "EMP-012", "first_name": "Tyrone",   "last_name": "Adams",     "role_id": "ROLE-RN",    "facility_id": "FAC-002", "department": "ICU",             "hire_date": "2019-03-20", "employment_status": "Active", "readiness_score": 50},
    {"employee_id": "EMP-013", "first_name": "Mei",      "last_name": "Lin",       "role_id": "ROLE-RT",    "facility_id": "FAC-002", "department": "ICU",             "hire_date": "2021-11-12", "employment_status": "Active", "readiness_score": 40},
    {"employee_id": "EMP-014", "first_name": "Kevin",    "last_name": "O'Brien",   "role_id": "ROLE-MD-EM", "facility_id": "FAC-002", "department": "Emergency",       "hire_date": "2018-06-01", "employment_status": "Active", "readiness_score": 80},
    {"employee_id": "EMP-015", "first_name": "Fatima",   "last_name": "Hassan",    "role_id": "ROLE-RN",    "facility_id": "FAC-002", "department": "Emergency",       "hire_date": "2022-09-03", "employment_status": "Active", "readiness_score": 83},
    {"employee_id": "EMP-016", "first_name": "Roberto",  "last_name": "Fernandez", "role_id": "ROLE-PA",    "facility_id": "FAC-002", "department": "General Medicine","hire_date": "2020-02-17", "employment_status": "Active", "readiness_score": 80},
    {"employee_id": "EMP-017", "first_name": "Sandra",   "last_name": "Mitchell",  "role_id": "ROLE-PHARM", "facility_id": "FAC-002", "department": "Pharmacy",        "hire_date": "2023-05-22", "employment_status": "Active", "readiness_score": 100},
    {"employee_id": "EMP-018", "first_name": "Jaylen",   "last_name": "Carter",    "role_id": "ROLE-LPN",   "facility_id": "FAC-002", "department": "General Medicine","hire_date": "2021-07-04", "employment_status": "Active", "readiness_score": 80},
    {"employee_id": "EMP-019", "first_name": "Ingrid",   "last_name": "Sorensen",  "role_id": "ROLE-NA",    "facility_id": "FAC-002", "department": "General Medicine","hire_date": "2024-03-11", "employment_status": "Active", "readiness_score": 75},
    {"employee_id": "EMP-020", "first_name": "Ahmad",    "last_name": "Khalil",    "role_id": "ROLE-RN",    "facility_id": "FAC-002", "department": "ICU",             "hire_date": "2020-05-29", "employment_status": "Active", "readiness_score": 17},
    # FAC-003 Harbor View
    {"employee_id": "EMP-021", "first_name": "Olivia",   "last_name": "Grant",     "role_id": "ROLE-ST",    "facility_id": "FAC-003", "department": "Surgery",         "hire_date": "2021-04-01", "employment_status": "Active", "readiness_score": 100},
    {"employee_id": "EMP-022", "first_name": "Nathan",   "last_name": "Park",      "role_id": "ROLE-RAD",   "facility_id": "FAC-003", "department": "Radiology",       "hire_date": "2022-10-18", "employment_status": "Active", "readiness_score": 75},
    {"employee_id": "EMP-023", "first_name": "Grace",    "last_name": "Okonkwo",   "role_id": "ROLE-NA",    "facility_id": "FAC-003", "department": "General Medicine","hire_date": "2023-08-07", "employment_status": "Active", "readiness_score": 100},
    {"employee_id": "EMP-024", "first_name": "Ethan",    "last_name": "Walsh",     "role_id": "ROLE-LPN",   "facility_id": "FAC-003", "department": "General Medicine","hire_date": "2019-01-15", "employment_status": "Active", "readiness_score": 80},
    {"employee_id": "EMP-025", "first_name": "Sofia",    "last_name": "Reyes",     "role_id": "ROLE-ST",    "facility_id": "FAC-003", "department": "Surgery",         "hire_date": "2020-12-03", "employment_status": "Active", "readiness_score": 80},
]


# ---------------------------------------------------------------------------
# Employee Certifications (127)
# ---------------------------------------------------------------------------

EMPLOYEE_CERTIFICATIONS = [
    # EMP-001 Sarah Chen
    {"record_id": "EC-001", "employee_id": "EMP-001", "cert_id": "CERT-BLS",    "issue_date": "2024-06-01", "expiration_date": "2026-06-01", "status": "Active"},
    {"record_id": "EC-002", "employee_id": "EMP-001", "cert_id": "CERT-ACLS",   "issue_date": "2024-06-01", "expiration_date": "2026-06-01", "status": "Active"},
    {"record_id": "EC-003", "employee_id": "EMP-001", "cert_id": "CERT-RN-LIC", "issue_date": "2024-01-01", "expiration_date": "2026-01-01", "status": "Active"},
    {"record_id": "EC-004", "employee_id": "EMP-001", "cert_id": "CERT-HIPAA",  "issue_date": "2025-01-15", "expiration_date": "2026-01-15", "status": "Active"},
    {"record_id": "EC-005", "employee_id": "EMP-001", "cert_id": "CERT-IC",     "issue_date": "2025-02-01", "expiration_date": "2026-02-01", "status": "Active"},
    {"record_id": "EC-006", "employee_id": "EMP-001", "cert_id": "CERT-BBP",    "issue_date": "2025-02-01", "expiration_date": "2026-02-01", "status": "Active"},
    # EMP-002 Marcus Johnson
    {"record_id": "EC-007", "employee_id": "EMP-002", "cert_id": "CERT-BLS",    "issue_date": "2024-05-01", "expiration_date": "2026-05-01", "status": "Active"},
    {"record_id": "EC-008", "employee_id": "EMP-002", "cert_id": "CERT-ACLS",   "issue_date": "2023-08-10", "expiration_date": "2025-08-10", "status": "Expired"},
    {"record_id": "EC-009", "employee_id": "EMP-002", "cert_id": "CERT-RN-LIC", "issue_date": "2024-03-01", "expiration_date": "2026-03-01", "status": "Active"},
    {"record_id": "EC-010", "employee_id": "EMP-002", "cert_id": "CERT-HIPAA",  "issue_date": "2025-01-10", "expiration_date": "2026-01-10", "status": "Active"},
    {"record_id": "EC-011", "employee_id": "EMP-002", "cert_id": "CERT-IC",     "issue_date": "2025-01-10", "expiration_date": "2026-01-10", "status": "Active"},
    {"record_id": "EC-012", "employee_id": "EMP-002", "cert_id": "CERT-BBP",    "issue_date": "2025-01-10", "expiration_date": "2026-01-10", "status": "Active"},
    # EMP-003 Priya Patel
    {"record_id": "EC-013", "employee_id": "EMP-003", "cert_id": "CERT-BLS",    "issue_date": "2024-07-01", "expiration_date": "2026-07-01", "status": "Active"},
    {"record_id": "EC-014", "employee_id": "EMP-003", "cert_id": "CERT-ACLS",   "issue_date": "2024-07-01", "expiration_date": "2026-07-01", "status": "Active"},
    {"record_id": "EC-015", "employee_id": "EMP-003", "cert_id": "CERT-RT-LIC", "issue_date": "2024-02-01", "expiration_date": "2026-02-01", "status": "Active"},
    {"record_id": "EC-016", "employee_id": "EMP-003", "cert_id": "CERT-HIPAA",  "issue_date": "2025-03-01", "expiration_date": "2026-03-01", "status": "Expiring Soon"},
    {"record_id": "EC-017", "employee_id": "EMP-003", "cert_id": "CERT-IC",     "issue_date": "2025-03-01", "expiration_date": "2026-03-01", "status": "Expiring Soon"},
    {"record_id": "EC-018", "employee_id": "EMP-003", "cert_id": "CERT-BBP",    "issue_date": "2025-03-01", "expiration_date": "2026-05-01", "status": "Active"},
    # EMP-004 James Rivera
    {"record_id": "EC-019", "employee_id": "EMP-004", "cert_id": "CERT-BLS",    "issue_date": "2024-09-01", "expiration_date": "2026-09-01", "status": "Active"},
    {"record_id": "EC-020", "employee_id": "EMP-004", "cert_id": "CERT-ACLS",   "issue_date": "2024-09-01", "expiration_date": "2026-09-01", "status": "Active"},
    {"record_id": "EC-021", "employee_id": "EMP-004", "cert_id": "CERT-PALS",   "issue_date": "2024-09-01", "expiration_date": "2026-09-01", "status": "Active"},
    {"record_id": "EC-022", "employee_id": "EMP-004", "cert_id": "CERT-DEA",    "issue_date": "2023-06-01", "expiration_date": "2026-06-01", "status": "Active"},
    {"record_id": "EC-023", "employee_id": "EMP-004", "cert_id": "CERT-HIPAA",  "issue_date": "2025-06-01", "expiration_date": "2026-06-01", "status": "Active"},
    # EMP-005 Aisha Williams
    {"record_id": "EC-024", "employee_id": "EMP-005", "cert_id": "CERT-BLS",    "issue_date": "2024-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    {"record_id": "EC-025", "employee_id": "EMP-005", "cert_id": "CERT-ACLS",   "issue_date": "2024-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    {"record_id": "EC-026", "employee_id": "EMP-005", "cert_id": "CERT-RN-LIC", "issue_date": "2024-01-01", "expiration_date": "2026-01-01", "status": "Active"},
    {"record_id": "EC-027", "employee_id": "EMP-005", "cert_id": "CERT-HIPAA",  "issue_date": "2024-12-01", "expiration_date": "2025-12-01", "status": "Expired"},
    {"record_id": "EC-028", "employee_id": "EMP-005", "cert_id": "CERT-IC",     "issue_date": "2025-01-01", "expiration_date": "2026-01-01", "status": "Active"},
    {"record_id": "EC-029", "employee_id": "EMP-005", "cert_id": "CERT-BBP",    "issue_date": "2025-01-01", "expiration_date": "2026-01-01", "status": "Active"},
    # EMP-006 Daniel Kim
    {"record_id": "EC-030", "employee_id": "EMP-006", "cert_id": "CERT-BLS",    "issue_date": "2024-10-01", "expiration_date": "2026-10-01", "status": "Active"},
    {"record_id": "EC-031", "employee_id": "EMP-006", "cert_id": "CERT-NBSTSA", "issue_date": "2024-10-01", "expiration_date": "2026-10-01", "status": "Active"},
    {"record_id": "EC-032", "employee_id": "EMP-006", "cert_id": "CERT-HIPAA",  "issue_date": "2025-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    {"record_id": "EC-033", "employee_id": "EMP-006", "cert_id": "CERT-IC",     "issue_date": "2025-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    {"record_id": "EC-034", "employee_id": "EMP-006", "cert_id": "CERT-BBP",    "issue_date": "2025-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    # EMP-007 Natalie Torres
    {"record_id": "EC-035", "employee_id": "EMP-007", "cert_id": "CERT-BLS",    "issue_date": "2024-03-01", "expiration_date": "2026-03-01", "status": "Expiring Soon"},
    {"record_id": "EC-036", "employee_id": "EMP-007", "cert_id": "CERT-ARRT",   "issue_date": "2023-09-01", "expiration_date": "2025-09-01", "status": "Expired"},
    {"record_id": "EC-037", "employee_id": "EMP-007", "cert_id": "CERT-HIPAA",  "issue_date": "2025-05-01", "expiration_date": "2026-05-01", "status": "Active"},
    {"record_id": "EC-038", "employee_id": "EMP-007", "cert_id": "CERT-BBP",    "issue_date": "2025-05-01", "expiration_date": "2026-05-01", "status": "Active"},
    # EMP-008 Leon Brooks
    {"record_id": "EC-039", "employee_id": "EMP-008", "cert_id": "CERT-BLS",    "issue_date": "2024-08-01", "expiration_date": "2026-08-01", "status": "Active"},
    {"record_id": "EC-040", "employee_id": "EMP-008", "cert_id": "CERT-LPN-LIC","issue_date": "2024-08-01", "expiration_date": "2026-08-01", "status": "Active"},
    {"record_id": "EC-041", "employee_id": "EMP-008", "cert_id": "CERT-HIPAA",  "issue_date": "2025-07-01", "expiration_date": "2026-07-01", "status": "Active"},
    {"record_id": "EC-042", "employee_id": "EMP-008", "cert_id": "CERT-IC",     "issue_date": "2025-07-01", "expiration_date": "2026-07-01", "status": "Active"},
    {"record_id": "EC-043", "employee_id": "EMP-008", "cert_id": "CERT-BBP",    "issue_date": "2025-07-01", "expiration_date": "2026-07-01", "status": "Active"},
    # EMP-009 Hannah Fischer
    {"record_id": "EC-044", "employee_id": "EMP-009", "cert_id": "CERT-BLS",    "issue_date": "2024-11-01", "expiration_date": "2026-11-01", "status": "Active"},
    {"record_id": "EC-045", "employee_id": "EMP-009", "cert_id": "CERT-ACLS",   "issue_date": "2024-11-01", "expiration_date": "2026-11-01", "status": "Active"},
    {"record_id": "EC-046", "employee_id": "EMP-009", "cert_id": "CERT-DEA",    "issue_date": "2023-11-01", "expiration_date": "2026-11-01", "status": "Active"},
    {"record_id": "EC-047", "employee_id": "EMP-009", "cert_id": "CERT-HIPAA",  "issue_date": "2025-08-01", "expiration_date": "2026-08-01", "status": "Active"},
    {"record_id": "EC-048", "employee_id": "EMP-009", "cert_id": "CERT-IC",     "issue_date": "2025-08-01", "expiration_date": "2026-08-01", "status": "Active"},
    # EMP-010 Carlos Moreno
    {"record_id": "EC-049", "employee_id": "EMP-010", "cert_id": "CERT-BLS",    "issue_date": "2024-01-08", "expiration_date": "2026-01-08", "status": "Active"},
    {"record_id": "EC-050", "employee_id": "EMP-010", "cert_id": "CERT-CNA",    "issue_date": "2024-01-08", "expiration_date": "2026-01-08", "status": "Active"},
    {"record_id": "EC-051", "employee_id": "EMP-010", "cert_id": "CERT-HIPAA",  "issue_date": "2025-01-08", "expiration_date": "2026-01-08", "status": "Active"},
    {"record_id": "EC-052", "employee_id": "EMP-010", "cert_id": "CERT-BBP",    "issue_date": "2025-01-08", "expiration_date": "2026-01-08", "status": "Active"},
    # EMP-011 Diana Nguyen
    {"record_id": "EC-053", "employee_id": "EMP-011", "cert_id": "CERT-BLS",    "issue_date": "2023-01-01", "expiration_date": "2025-01-01", "status": "Expired"},
    {"record_id": "EC-054", "employee_id": "EMP-011", "cert_id": "CERT-ACLS",   "issue_date": "2023-01-01", "expiration_date": "2025-01-01", "status": "Expired"},
    {"record_id": "EC-055", "employee_id": "EMP-011", "cert_id": "CERT-RN-LIC", "issue_date": "2024-06-01", "expiration_date": "2026-06-01", "status": "Active"},
    {"record_id": "EC-056", "employee_id": "EMP-011", "cert_id": "CERT-HIPAA",  "issue_date": "2024-06-01", "expiration_date": "2025-06-01", "status": "Expired"},
    {"record_id": "EC-057", "employee_id": "EMP-011", "cert_id": "CERT-IC",     "issue_date": "2025-01-15", "expiration_date": "2026-01-15", "status": "Active"},
    {"record_id": "EC-058", "employee_id": "EMP-011", "cert_id": "CERT-BBP",    "issue_date": "2025-01-15", "expiration_date": "2026-01-15", "status": "Active"},
    # EMP-012 Tyrone Adams
    {"record_id": "EC-059", "employee_id": "EMP-012", "cert_id": "CERT-BLS",    "issue_date": "2023-03-01", "expiration_date": "2025-03-01", "status": "Expired"},
    {"record_id": "EC-060", "employee_id": "EMP-012", "cert_id": "CERT-ACLS",   "issue_date": "2024-05-01", "expiration_date": "2026-05-01", "status": "Active"},
    {"record_id": "EC-061", "employee_id": "EMP-012", "cert_id": "CERT-RN-LIC", "issue_date": "2024-01-01", "expiration_date": "2026-01-01", "status": "Active"},
    {"record_id": "EC-062", "employee_id": "EMP-012", "cert_id": "CERT-HIPAA",  "issue_date": "2024-02-01", "expiration_date": "2025-02-01", "status": "Expired"},
    {"record_id": "EC-063", "employee_id": "EMP-012", "cert_id": "CERT-IC",     "issue_date": "2024-02-01", "expiration_date": "2025-02-01", "status": "Expired"},
    {"record_id": "EC-064", "employee_id": "EMP-012", "cert_id": "CERT-BBP",    "issue_date": "2025-03-01", "expiration_date": "2026-03-01", "status": "Active"},
    # EMP-013 Mei Lin
    {"record_id": "EC-065", "employee_id": "EMP-013", "cert_id": "CERT-BLS",    "issue_date": "2023-05-01", "expiration_date": "2025-05-01", "status": "Expired"},
    {"record_id": "EC-066", "employee_id": "EMP-013", "cert_id": "CERT-ACLS",   "issue_date": "2023-05-01", "expiration_date": "2025-05-01", "status": "Expired"},
    {"record_id": "EC-067", "employee_id": "EMP-013", "cert_id": "CERT-RT-LIC", "issue_date": "2024-08-01", "expiration_date": "2026-08-01", "status": "Active"},
    {"record_id": "EC-068", "employee_id": "EMP-013", "cert_id": "CERT-HIPAA",  "issue_date": "2024-11-01", "expiration_date": "2025-11-01", "status": "Expired"},
    {"record_id": "EC-069", "employee_id": "EMP-013", "cert_id": "CERT-IC",     "issue_date": "2025-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    {"record_id": "EC-070", "employee_id": "EMP-013", "cert_id": "CERT-BBP",    "issue_date": "2025-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    # EMP-014 Kevin O'Brien
    {"record_id": "EC-071", "employee_id": "EMP-014", "cert_id": "CERT-BLS",    "issue_date": "2024-07-01", "expiration_date": "2026-07-01", "status": "Active"},
    {"record_id": "EC-072", "employee_id": "EMP-014", "cert_id": "CERT-ACLS",   "issue_date": "2024-07-01", "expiration_date": "2026-07-01", "status": "Active"},
    {"record_id": "EC-073", "employee_id": "EMP-014", "cert_id": "CERT-PALS",   "issue_date": "2024-07-01", "expiration_date": "2026-07-01", "status": "Active"},
    {"record_id": "EC-074", "employee_id": "EMP-014", "cert_id": "CERT-DEA",    "issue_date": "2023-07-01", "expiration_date": "2026-07-01", "status": "Active"},
    {"record_id": "EC-075", "employee_id": "EMP-014", "cert_id": "CERT-HIPAA",  "issue_date": "2024-06-01", "expiration_date": "2025-06-01", "status": "Expired"},
    # EMP-015 Fatima Hassan
    {"record_id": "EC-076", "employee_id": "EMP-015", "cert_id": "CERT-BLS",    "issue_date": "2024-09-03", "expiration_date": "2026-09-03", "status": "Active"},
    {"record_id": "EC-077", "employee_id": "EMP-015", "cert_id": "CERT-ACLS",   "issue_date": "2024-09-03", "expiration_date": "2026-09-03", "status": "Active"},
    {"record_id": "EC-078", "employee_id": "EMP-015", "cert_id": "CERT-RN-LIC", "issue_date": "2024-09-03", "expiration_date": "2026-09-03", "status": "Active"},
    {"record_id": "EC-079", "employee_id": "EMP-015", "cert_id": "CERT-HIPAA",  "issue_date": "2025-09-03", "expiration_date": "2026-09-03", "status": "Active"},
    {"record_id": "EC-080", "employee_id": "EMP-015", "cert_id": "CERT-IC",     "issue_date": "2024-09-03", "expiration_date": "2025-09-03", "status": "Expired"},
    {"record_id": "EC-081", "employee_id": "EMP-015", "cert_id": "CERT-BBP",    "issue_date": "2025-09-03", "expiration_date": "2026-09-03", "status": "Active"},
    # EMP-016 Roberto Fernandez
    {"record_id": "EC-082", "employee_id": "EMP-016", "cert_id": "CERT-BLS",    "issue_date": "2024-04-17", "expiration_date": "2026-04-17", "status": "Active"},
    {"record_id": "EC-083", "employee_id": "EMP-016", "cert_id": "CERT-ACLS",   "issue_date": "2024-04-17", "expiration_date": "2026-04-17", "status": "Active"},
    {"record_id": "EC-084", "employee_id": "EMP-016", "cert_id": "CERT-DEA",    "issue_date": "2023-04-17", "expiration_date": "2026-04-17", "status": "Active"},
    {"record_id": "EC-085", "employee_id": "EMP-016", "cert_id": "CERT-HIPAA",  "issue_date": "2024-04-17", "expiration_date": "2025-04-17", "status": "Expired"},
    {"record_id": "EC-086", "employee_id": "EMP-016", "cert_id": "CERT-IC",     "issue_date": "2025-04-17", "expiration_date": "2026-04-17", "status": "Active"},
    # EMP-017 Sandra Mitchell
    {"record_id": "EC-087", "employee_id": "EMP-017", "cert_id": "CERT-BLS",    "issue_date": "2024-05-22", "expiration_date": "2026-05-22", "status": "Active"},
    {"record_id": "EC-088", "employee_id": "EMP-017", "cert_id": "CERT-PTCB",   "issue_date": "2024-05-22", "expiration_date": "2026-05-22", "status": "Active"},
    {"record_id": "EC-089", "employee_id": "EMP-017", "cert_id": "CERT-HIPAA",  "issue_date": "2025-05-22", "expiration_date": "2026-05-22", "status": "Active"},
    # EMP-018 Jaylen Carter
    {"record_id": "EC-090", "employee_id": "EMP-018", "cert_id": "CERT-BLS",    "issue_date": "2024-07-04", "expiration_date": "2026-07-04", "status": "Active"},
    {"record_id": "EC-091", "employee_id": "EMP-018", "cert_id": "CERT-LPN-LIC","issue_date": "2024-07-04", "expiration_date": "2026-07-04", "status": "Active"},
    {"record_id": "EC-092", "employee_id": "EMP-018", "cert_id": "CERT-HIPAA",  "issue_date": "2024-07-04", "expiration_date": "2025-07-04", "status": "Expired"},
    {"record_id": "EC-093", "employee_id": "EMP-018", "cert_id": "CERT-IC",     "issue_date": "2025-07-04", "expiration_date": "2026-07-04", "status": "Active"},
    {"record_id": "EC-094", "employee_id": "EMP-018", "cert_id": "CERT-BBP",    "issue_date": "2025-07-04", "expiration_date": "2026-07-04", "status": "Active"},
    # EMP-019 Ingrid Sorensen
    {"record_id": "EC-095", "employee_id": "EMP-019", "cert_id": "CERT-BLS",    "issue_date": "2024-03-11", "expiration_date": "2026-03-11", "status": "Expiring Soon"},
    {"record_id": "EC-096", "employee_id": "EMP-019", "cert_id": "CERT-CNA",    "issue_date": "2024-03-11", "expiration_date": "2026-03-11", "status": "Active"},
    {"record_id": "EC-097", "employee_id": "EMP-019", "cert_id": "CERT-HIPAA",  "issue_date": "2025-03-11", "expiration_date": "2026-03-11", "status": "Expiring Soon"},
    {"record_id": "EC-098", "employee_id": "EMP-019", "cert_id": "CERT-BBP",    "issue_date": "2025-03-11", "expiration_date": "2026-03-11", "status": "Active"},
    # EMP-020 Ahmad Khalil
    {"record_id": "EC-099", "employee_id": "EMP-020", "cert_id": "CERT-BLS",    "issue_date": "2022-09-01", "expiration_date": "2024-09-01", "status": "Expired"},
    {"record_id": "EC-100", "employee_id": "EMP-020", "cert_id": "CERT-ACLS",   "issue_date": "2022-09-01", "expiration_date": "2024-09-01", "status": "Expired"},
    {"record_id": "EC-101", "employee_id": "EMP-020", "cert_id": "CERT-RN-LIC", "issue_date": "2024-05-29", "expiration_date": "2026-05-29", "status": "Active"},
    {"record_id": "EC-102", "employee_id": "EMP-020", "cert_id": "CERT-HIPAA",  "issue_date": "2023-05-29", "expiration_date": "2024-05-29", "status": "Expired"},
    {"record_id": "EC-103", "employee_id": "EMP-020", "cert_id": "CERT-IC",     "issue_date": "2023-05-29", "expiration_date": "2024-05-29", "status": "Expired"},
    {"record_id": "EC-104", "employee_id": "EMP-020", "cert_id": "CERT-BBP",    "issue_date": "2023-05-29", "expiration_date": "2024-05-29", "status": "Expired"},
    # EMP-021 Olivia Grant
    {"record_id": "EC-105", "employee_id": "EMP-021", "cert_id": "CERT-BLS",    "issue_date": "2024-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    {"record_id": "EC-106", "employee_id": "EMP-021", "cert_id": "CERT-NBSTSA", "issue_date": "2024-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    {"record_id": "EC-107", "employee_id": "EMP-021", "cert_id": "CERT-HIPAA",  "issue_date": "2025-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    {"record_id": "EC-108", "employee_id": "EMP-021", "cert_id": "CERT-IC",     "issue_date": "2025-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    {"record_id": "EC-109", "employee_id": "EMP-021", "cert_id": "CERT-BBP",    "issue_date": "2025-04-01", "expiration_date": "2026-04-01", "status": "Active"},
    # EMP-022 Nathan Park
    {"record_id": "EC-110", "employee_id": "EMP-022", "cert_id": "CERT-BLS",    "issue_date": "2024-10-18", "expiration_date": "2026-10-18", "status": "Active"},
    {"record_id": "EC-111", "employee_id": "EMP-022", "cert_id": "CERT-ARRT",   "issue_date": "2023-10-18", "expiration_date": "2025-10-18", "status": "Expired"},
    {"record_id": "EC-112", "employee_id": "EMP-022", "cert_id": "CERT-HIPAA",  "issue_date": "2025-10-18", "expiration_date": "2026-10-18", "status": "Active"},
    {"record_id": "EC-113", "employee_id": "EMP-022", "cert_id": "CERT-BBP",    "issue_date": "2025-10-18", "expiration_date": "2026-10-18", "status": "Active"},
    # EMP-023 Grace Okonkwo
    {"record_id": "EC-114", "employee_id": "EMP-023", "cert_id": "CERT-BLS",    "issue_date": "2024-08-07", "expiration_date": "2026-08-07", "status": "Active"},
    {"record_id": "EC-115", "employee_id": "EMP-023", "cert_id": "CERT-CNA",    "issue_date": "2024-08-07", "expiration_date": "2026-08-07", "status": "Active"},
    {"record_id": "EC-116", "employee_id": "EMP-023", "cert_id": "CERT-HIPAA",  "issue_date": "2025-08-07", "expiration_date": "2026-08-07", "status": "Active"},
    {"record_id": "EC-117", "employee_id": "EMP-023", "cert_id": "CERT-BBP",    "issue_date": "2025-08-07", "expiration_date": "2026-08-07", "status": "Active"},
    # EMP-024 Ethan Walsh
    {"record_id": "EC-118", "employee_id": "EMP-024", "cert_id": "CERT-BLS",    "issue_date": "2024-01-15", "expiration_date": "2026-01-15", "status": "Active"},
    {"record_id": "EC-119", "employee_id": "EMP-024", "cert_id": "CERT-LPN-LIC","issue_date": "2024-01-15", "expiration_date": "2026-01-15", "status": "Active"},
    {"record_id": "EC-120", "employee_id": "EMP-024", "cert_id": "CERT-HIPAA",  "issue_date": "2024-01-15", "expiration_date": "2025-01-15", "status": "Expired"},
    {"record_id": "EC-121", "employee_id": "EMP-024", "cert_id": "CERT-IC",     "issue_date": "2025-01-15", "expiration_date": "2026-01-15", "status": "Active"},
    {"record_id": "EC-122", "employee_id": "EMP-024", "cert_id": "CERT-BBP",    "issue_date": "2025-01-15", "expiration_date": "2026-01-15", "status": "Active"},
    # EMP-025 Sofia Reyes
    {"record_id": "EC-123", "employee_id": "EMP-025", "cert_id": "CERT-BLS",    "issue_date": "2024-12-03", "expiration_date": "2026-12-03", "status": "Active"},
    {"record_id": "EC-124", "employee_id": "EMP-025", "cert_id": "CERT-NBSTSA", "issue_date": "2024-12-03", "expiration_date": "2026-12-03", "status": "Active"},
    {"record_id": "EC-125", "employee_id": "EMP-025", "cert_id": "CERT-HIPAA",  "issue_date": "2024-12-03", "expiration_date": "2025-12-03", "status": "Expired"},
    {"record_id": "EC-126", "employee_id": "EMP-025", "cert_id": "CERT-IC",     "issue_date": "2025-12-03", "expiration_date": "2026-12-03", "status": "Active"},
    {"record_id": "EC-127", "employee_id": "EMP-025", "cert_id": "CERT-BBP",    "issue_date": "2025-12-03", "expiration_date": "2026-12-03", "status": "Active"},
]


# ---------------------------------------------------------------------------
# Write helpers
# ---------------------------------------------------------------------------

def write_csv(path: Path, rows: list[dict]) -> None:
    if not rows:
        print(f"  SKIP (empty): {path.name}")
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"  [OUT] {path.name}  ({len(rows)} rows)")


def write_json(path: Path, rows: list[dict]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2)
    print(f"  [OUT] {path.name}  ({len(rows)} objects)")


def main():
    print("=" * 60)
    print("Synthetic Data Exporter")
    print("=" * 60)

    write_csv(CLEAN_DIR / "certifications.csv", CERTIFICATIONS)
    write_json(CLEAN_DIR / "certifications.json", CERTIFICATIONS)

    write_csv(CLEAN_DIR / "employees.csv", EMPLOYEES)
    write_json(CLEAN_DIR / "employees.json", EMPLOYEES)

    write_csv(CLEAN_DIR / "employee_certifications.csv", EMPLOYEE_CERTIFICATIONS)
    write_json(CLEAN_DIR / "employee_certifications.json", EMPLOYEE_CERTIFICATIONS)

    print()
    print(f"Certifications:         {len(CERTIFICATIONS)}")
    print(f"Employees:              {len(EMPLOYEES)}")
    print(f"Employee Certs:         {len(EMPLOYEE_CERTIFICATIONS)}")
    print()
    print("Done. Files written to datasets/clean/")


if __name__ == "__main__":
    main()
