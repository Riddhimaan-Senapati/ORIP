"""
Clean O*NET database files for clinical roles.

Inputs:  datasets/raw/onet/
           Occupation Data.xlsx
           Skills.xlsx
           Knowledge.xlsx
           Education, Training, and Experience.xlsx

Outputs: datasets/clean/
           roles.csv / roles.json         -- Role ontology objects
           skills.csv / skills.json       -- Skill ontology objects
           role_skills.csv                -- many-to-many: role <-> skill
           role_certs.csv                 -- many-to-many: role <-> required cert (inferred)

Healthcare SOC codes in scope:
  29-XXXX  Healthcare Practitioners and Technical Occupations
  31-XXXX  Healthcare Support Occupations

O*NET importance score threshold: >= 3.0 (out of 5) to be "required".
"""

import json
import sys
import pandas as pd
from pathlib import Path

ONET_DIR = Path(__file__).parent / "raw" / "onet"
CLEAN_DIR = Path(__file__).parent / "clean"
CLEAN_DIR.mkdir(exist_ok=True)

# Healthcare SOC codes we care about (from project_idea.md)
TARGET_SOC = {
    "29-1141.00": "Registered Nurse",
    "29-2061.00": "Licensed Practical Nurse",
    "29-1211.00": "Emergency Medicine Physician",
    "29-1071.00": "Physician Assistant",
    "29-1126.00": "Respiratory Therapist",
    "29-2034.00": "Radiologic Technologist",
    "29-2052.00": "Pharmacy Technician",
    "29-2012.00": "Medical Lab Technician",
    "29-2055.00": "Surgical Technologist",
    "31-1131.00": "Nursing Assistant",
}

SOC_TO_ROLE_ID = {
    "29-1141.00": "ROLE-RN",
    "29-2061.00": "ROLE-LPN",
    "29-1211.00": "ROLE-MD-EM",
    "29-1071.00": "ROLE-PA",
    "29-1126.00": "ROLE-RT",
    "29-2034.00": "ROLE-RAD",
    "29-2052.00": "ROLE-PHARM",
    "29-2012.00": "ROLE-MLT",
    "29-2055.00": "ROLE-ST",
    "31-1131.00": "ROLE-NA",
}

# Skill categories assigned by O*NET element ID prefix
SKILL_CATEGORY_MAP = {
    "2.A.1": "Clinical",      # Critical Thinking, Active Learning, Reading Comprehension
    "2.A.4": "Interpersonal", # Speaking, Writing, Active Listening
    "2.B.3": "Technical",     # Equipment operation, Technology
    "2.B.4": "Technical",
    "2.B.2": "Regulatory",    # Monitoring, Quality Control
}

# Minimum importance score (out of 5) to include a skill as "required"
IMPORTANCE_THRESHOLD = 3.0

# Cert requirements per role -- inferred from regulatory standards
# (AHA, CMS, state nursing boards, OSHA, ARRT, etc.)
ROLE_CERT_MAP = {
    "ROLE-RN":    ["CERT-BLS", "CERT-ACLS", "CERT-RN-LIC", "CERT-HIPAA", "CERT-IC", "CERT-BBP"],
    "ROLE-LPN":   ["CERT-BLS", "CERT-LPN-LIC", "CERT-HIPAA", "CERT-IC", "CERT-BBP"],
    "ROLE-MD-EM": ["CERT-BLS", "CERT-ACLS", "CERT-PALS", "CERT-DEA", "CERT-HIPAA"],
    "ROLE-PA":    ["CERT-BLS", "CERT-ACLS", "CERT-DEA", "CERT-HIPAA", "CERT-IC"],
    "ROLE-RT":    ["CERT-BLS", "CERT-ACLS", "CERT-RT-LIC", "CERT-HIPAA", "CERT-IC", "CERT-BBP"],
    "ROLE-RAD":   ["CERT-BLS", "CERT-ARRT", "CERT-HIPAA", "CERT-BBP"],
    "ROLE-PHARM": ["CERT-BLS", "CERT-PTCB", "CERT-HIPAA"],
    "ROLE-MLT":   ["CERT-BLS", "CERT-HIPAA", "CERT-BBP", "CERT-IC"],
    "ROLE-ST":    ["CERT-BLS", "CERT-NBSTSA", "CERT-HIPAA", "CERT-IC", "CERT-BBP"],
    "ROLE-NA":    ["CERT-BLS", "CERT-CNA", "CERT-HIPAA", "CERT-BBP"],
}


def read_onet(filename: str) -> pd.DataFrame:
    path = ONET_DIR / filename
    if not path.exists():
        sys.exit(
            f"ERROR: {path} not found.\n"
            "Run  python download.py  first to extract O*NET files."
        )
    print(f"  Reading {filename} ...")
    df = pd.read_excel(path, dtype=str)
    df.columns = df.columns.str.strip()
    return df


def find_col(df: pd.DataFrame, *substrings: str) -> str | None:
    """Return the first column name that contains any of the given substrings (case-insensitive)."""
    for sub in substrings:
        for col in df.columns:
            if sub.lower() in col.lower():
                return col
    return None


def clean_occupation_data() -> pd.DataFrame:
    """Extract the 10 target roles from Occupation Data.xlsx."""
    df = read_onet("Occupation Data.xlsx")

    soc_col = find_col(df, "SOC Code", "O*NET-SOC")
    title_col = find_col(df, "Title")
    desc_col = find_col(df, "Description")

    if not soc_col:
        sys.exit("ERROR: Could not find SOC code column in 'Occupation Data.xlsx'")

    df = df[df[soc_col].isin(TARGET_SOC.keys())].copy()

    roles = pd.DataFrame({
        "role_id": df[soc_col].map(SOC_TO_ROLE_ID),
        "title": df[title_col] if title_col else df[soc_col].map(TARGET_SOC),
        "onet_soc_code": df[soc_col],
        "description": df[desc_col].fillna("") if desc_col else "",
    })

    dept_map = {
        "ROLE-RN": "Nursing",
        "ROLE-LPN": "Nursing",
        "ROLE-MD-EM": "Emergency",
        "ROLE-PA": "General Medicine",
        "ROLE-RT": "ICU",
        "ROLE-RAD": "Radiology",
        "ROLE-PHARM": "Pharmacy",
        "ROLE-MLT": "Lab",
        "ROLE-ST": "Surgery",
        "ROLE-NA": "General Medicine",
    }
    roles["department"] = roles["role_id"].map(dept_map)
    return roles.reset_index(drop=True)


def clean_skills() -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Extract skills relevant to target healthcare occupations.

    Returns:
        skills_df   -- deduplicated Skill ontology objects
        role_skills -- many-to-many role <-> skill mapping
    """
    df = read_onet("Skills.xlsx")

    soc_col = find_col(df, "SOC Code", "O*NET-SOC")
    elem_id_col = find_col(df, "Element ID")
    elem_name_col = find_col(df, "Element Name")
    scale_col = find_col(df, "Scale ID")
    value_col = find_col(df, "Data Value")

    if not all([soc_col, elem_id_col, elem_name_col, scale_col, value_col]):
        sys.exit("ERROR: Missing expected columns in 'Skills.xlsx'")

    # Filter to target SOC codes and Importance scale only
    df = df[df[soc_col].isin(TARGET_SOC.keys())].copy()
    df = df[df[scale_col].str.strip() == "IM"].copy()

    df["importance"] = pd.to_numeric(df[value_col], errors="coerce")
    df = df[df["importance"] >= IMPORTANCE_THRESHOLD]
    df = df.rename(columns={
        soc_col: "onet_soc_code",
        elem_id_col: "onet_element_id",
        elem_name_col: "name",
    })

    def categorise(element_id: str) -> str:
        for prefix, cat in SKILL_CATEGORY_MAP.items():
            if str(element_id).startswith(prefix):
                return cat
        return "Clinical"

    df["category"] = df["onet_element_id"].apply(categorise)

    skills_unique = (
        df.groupby(["onet_element_id", "name", "category"])
        .size()
        .reset_index(name="_")
        .drop(columns="_")
    ).reset_index(drop=True)
    skills_unique.insert(0, "skill_id", skills_unique.index.map(lambda i: f"SKILL-{i+1:03d}"))

    role_skills = df[["onet_soc_code", "onet_element_id", "importance"]].copy()
    role_skills["role_id"] = role_skills["onet_soc_code"].map(SOC_TO_ROLE_ID)
    role_skills = role_skills.merge(
        skills_unique[["skill_id", "onet_element_id"]],
        on="onet_element_id",
        how="left",
    )
    role_skills = role_skills[["role_id", "skill_id", "importance"]].dropna(subset=["skill_id"])
    role_skills["importance"] = role_skills["importance"].round(2)

    return skills_unique, role_skills


def clean_knowledge() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Extract knowledge domains relevant to target occupations."""
    df = read_onet("Knowledge.xlsx")

    soc_col = find_col(df, "SOC Code", "O*NET-SOC")
    elem_id_col = find_col(df, "Element ID")
    elem_name_col = find_col(df, "Element Name")
    scale_col = find_col(df, "Scale ID")
    value_col = find_col(df, "Data Value")

    if not all([soc_col, elem_id_col, elem_name_col, scale_col, value_col]):
        sys.exit("ERROR: Missing expected columns in 'Knowledge.xlsx'")

    df = df[df[soc_col].isin(TARGET_SOC.keys())].copy()
    df = df[df[scale_col].str.strip() == "IM"].copy()
    df["importance"] = pd.to_numeric(df[value_col], errors="coerce")
    df = df[df["importance"] >= IMPORTANCE_THRESHOLD]
    df = df.rename(columns={
        soc_col: "onet_soc_code",
        elem_id_col: "onet_element_id",
        elem_name_col: "name",
    })
    df["category"] = "Clinical"

    knowledge_unique = (
        df.groupby(["onet_element_id", "name", "category"])
        .size()
        .reset_index(name="_")
        .drop(columns="_")
    ).reset_index(drop=True)
    knowledge_unique.insert(0, "knowledge_id", knowledge_unique.index.map(lambda i: f"KNW-{i+1:03d}"))

    role_knowledge = df[["onet_soc_code", "onet_element_id", "importance"]].copy()
    role_knowledge["role_id"] = role_knowledge["onet_soc_code"].map(SOC_TO_ROLE_ID)
    role_knowledge = role_knowledge.merge(
        knowledge_unique[["knowledge_id", "onet_element_id"]],
        on="onet_element_id",
        how="left",
    )
    role_knowledge = role_knowledge[["role_id", "knowledge_id", "importance"]].dropna(subset=["knowledge_id"])
    role_knowledge["importance"] = role_knowledge["importance"].round(2)

    return knowledge_unique, role_knowledge


def build_role_certs() -> pd.DataFrame:
    """
    Build the role <-> certification many-to-many table from domain knowledge.
    O*NET does not contain specific cert requirements, so this is inferred from
    regulatory standards (AHA, CMS, state nursing boards, OSHA, ARRT, etc.).
    """
    rows = []
    for role_id, cert_ids in ROLE_CERT_MAP.items():
        for cert_id in cert_ids:
            rows.append({"role_id": role_id, "cert_id": cert_id, "is_mandatory": True})
    return pd.DataFrame(rows)


def save(df: pd.DataFrame, stem: str) -> None:
    csv_path = CLEAN_DIR / f"{stem}.csv"
    json_path = CLEAN_DIR / f"{stem}.json"
    df.to_csv(csv_path, index=False)
    records = df.to_dict(orient="records")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, default=str)
    print(f"  -> {stem}.csv  ({len(df):,} rows)")
    print(f"  -> {stem}.json ({len(records):,} objects)")


def main():
    print("=" * 60)
    print("O*NET Cleaner")
    print("=" * 60)

    print("\n[ROLES]")
    roles = clean_occupation_data()
    save(roles, "roles")
    print(f"  Roles extracted: {len(roles)}")

    print("\n[SKILLS]")
    skills, role_skills = clean_skills()
    save(skills, "skills")
    save(role_skills, "role_skills")
    print(f"  Unique skills: {len(skills)},  Role-skill edges: {len(role_skills)}")

    print("\n[KNOWLEDGE]")
    knowledge, role_knowledge = clean_knowledge()
    save(knowledge, "knowledge")
    save(role_knowledge, "role_knowledge")
    print(f"  Unique knowledge domains: {len(knowledge)},  Role-knowledge edges: {len(role_knowledge)}")

    print("\n[ROLE-CERT MAPPING]")
    role_certs = build_role_certs()
    save(role_certs, "role_certs")
    print(f"  Role-cert edges: {len(role_certs)}")

    print("\n-- Skills by category --")
    print(skills["category"].value_counts().to_string())
    print("\n-- Skills per role --")
    per_role = role_skills.groupby("role_id")["skill_id"].count().sort_values(ascending=False)
    print(per_role.to_string())
    print("\n-- Certs per role --")
    per_role_cert = role_certs.groupby("role_id")["cert_id"].count().sort_values(ascending=False)
    print(per_role_cert.to_string())

    print("\nDone. Files written to datasets/clean/")


if __name__ == "__main__":
    main()
