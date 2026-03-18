"""
Clean the CMS Provider of Services (POS) file.

Input:  datasets/raw/cms_pos_hospitals.csv
Output: datasets/clean/facilities.csv
        datasets/clean/facilities.json

What this does:
  - Selects the columns relevant to the Facility ontology object
  - Filters to hospitals in Massachusetts (for the demo scenario)
  - Normalises facility type names
  - Derives accreditation_status from CMS certification fields
  - Outputs a clean CSV and JSON ready to load into Foundry
"""

import sys
import json
import pandas as pd
from pathlib import Path

RAW_CSV = Path(__file__).parent / "raw" / "cms_pos_hospitals.csv"
CLEAN_DIR = Path(__file__).parent / "clean"
CLEAN_DIR.mkdir(exist_ok=True)


# Column mapping: CMS POS columns we care about -> our ontology field names.
# Run the following to inspect actual column names if the schema has changed:
#   python -c "import pandas as pd; print(pd.read_csv('raw/cms_pos_hospitals.csv', nrows=0).columns.tolist())"

COLUMN_MAP = {
    # Provider identifiers
    "PRVDR_NUM": "cms_provider_number",
    "FAC_NAME": "name",
    # Address
    "ST_ADR": "street_address",
    "CITY_NAME": "city",
    "STATE_CD": "state",
    "ZIP_CD": "zip",
    # Facility characteristics
    "PRVDR_CTGRY_CD": "cms_category_code",
    "PRVDR_CTGRY_SBTYP_CD": "cms_subtype_code",
    "BED_CNT": "bed_count",
    # Certification / compliance
    "CRTFCTN_DT": "certification_date",
    "TRMNTN_EXPRTN_DT": "termination_date",
    "ACRDTN_TYPE_1_CD": "accreditation_code_1",
    "ACRDTN_TYPE_2_CD": "accreditation_code_2",
}

# CMS category subtype -> human-readable facility type
SUBTYPE_MAP = {
    "01": "Short-Term Acute Care",
    "02": "Long-Term Care",
    "03": "Psychiatric",
    "04": "Rehabilitation",
    "05": "Children's",
    "06": "Distinct Part Psychiatric",
    "07": "Distinct Part Rehabilitation",
    "08": "Swing Bed Approved",
    "11": "Religious Non-Medical Health Care",
    "22": "Critical Access Hospital",
}

# CMS accreditation codes -> readable labels
ACCREDITATION_MAP = {
    "A": "The Joint Commission (TJC)",
    "B": "American Osteopathic Association (AOA)",
    "C": "DNV Healthcare",
    "D": "Center for Improvement in Healthcare Quality (CIHQ)",
    "E": "Healthcare Facilities Accreditation Program (HFAP)",
}


def load_raw(path: Path) -> pd.DataFrame:
    print(f"[CMS]  Loading raw file: {path}")
    try:
        df = pd.read_csv(path, dtype=str, low_memory=False)
    except FileNotFoundError:
        sys.exit(
            f"ERROR: {path} not found.\n"
            "Run  python download.py  first, or manually place the CMS POS CSV at that path."
        )
    print(f"       {len(df):,} rows, {len(df.columns)} columns")
    return df


def select_and_rename(df: pd.DataFrame) -> pd.DataFrame:
    """Keep only columns present in COLUMN_MAP (skip missing ones gracefully)."""
    available = {k: v for k, v in COLUMN_MAP.items() if k in df.columns}
    missing = set(COLUMN_MAP) - set(available)
    if missing:
        print(f"  NOTE: {len(missing)} expected columns not found in raw file: {missing}")
    df = df[list(available.keys())].rename(columns=available)
    return df


def filter_hospitals(df: pd.DataFrame) -> pd.DataFrame:
    """
    Keep only:
      - Massachusetts hospitals (STATE_CD == MA) -- demo scenario is MA-based
      - Active providers (no termination date)
    """
    if "state" in df.columns:
        before = len(df)
        df = df[df["state"].str.strip().str.upper() == "MA"]
        print(f"  Filtered to MA: {before:,} -> {len(df):,} rows")

    if "termination_date" in df.columns:
        before = len(df)
        df = df[df["termination_date"].isna() | (df["termination_date"].str.strip() == "")]
        print(f"  Filtered to active: {before:,} -> {len(df):,} rows")

    return df


def clean_fields(df: pd.DataFrame) -> pd.DataFrame:
    """Normalise and derive fields."""

    # Trim whitespace everywhere
    str_cols = df.select_dtypes(include="object").columns
    df[str_cols] = df[str_cols].apply(lambda c: c.str.strip())

    # Combine address parts
    if {"street_address", "city", "state", "zip"}.issubset(df.columns):
        df["address"] = (
            df["street_address"].fillna("") + ", "
            + df["city"].fillna("") + ", "
            + df["state"].fillna("") + " "
            + df["zip"].fillna("").str[:5]
        ).str.strip(", ")

    # Map subtype code -> human-readable facility type
    if "cms_subtype_code" in df.columns:
        df["type"] = df["cms_subtype_code"].map(SUBTYPE_MAP).fillna("Hospital")

    # Bed count -> integer (keep NaN as 0)
    if "bed_count" in df.columns:
        df["bed_count"] = pd.to_numeric(df["bed_count"], errors="coerce").fillna(0).astype(int)

    # Accreditation status
    if "accreditation_code_1" in df.columns:
        df["accreditation_body"] = df["accreditation_code_1"].map(ACCREDITATION_MAP).fillna("Unknown")
        df["accreditation_status"] = df["accreditation_code_1"].apply(
            lambda x: "Active" if pd.notna(x) and str(x).strip() != "" else "Not Accredited"
        )
    else:
        df["accreditation_status"] = "Unknown"

    return df


def assign_facility_ids(df: pd.DataFrame) -> pd.DataFrame:
    """Add a stable FAC-XXXX id for the ontology."""
    df = df.reset_index(drop=True)
    df.insert(0, "facility_id", df.index.map(lambda i: f"FAC-{i+1:04d}"))
    return df


def select_output_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Keep only the final ontology-aligned columns."""
    want = [
        "facility_id",
        "name",
        "address",
        "type",
        "bed_count",
        "accreditation_status",
        "accreditation_body",
        "cms_provider_number",
        "certification_date",
    ]
    return df[[c for c in want if c in df.columns]]


def main():
    print("=" * 60)
    print("CMS POS Cleaner")
    print("=" * 60)

    df = load_raw(RAW_CSV)
    df = select_and_rename(df)
    df = filter_hospitals(df)
    df = clean_fields(df)
    df = assign_facility_ids(df)
    df = select_output_columns(df)

    csv_out = CLEAN_DIR / "facilities.csv"
    json_out = CLEAN_DIR / "facilities.json"

    df.to_csv(csv_out, index=False)
    print(f"\n[OUT]  facilities.csv  -> {csv_out}  ({len(df):,} rows)")

    records = df.to_dict(orient="records")
    with open(json_out, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, default=str)
    print(f"[OUT]  facilities.json -> {json_out}  ({len(records):,} objects)")

    print("\n-- Summary --")
    if "type" in df.columns:
        print(df["type"].value_counts().to_string())
    print(f"\nBed count range: {df['bed_count'].min()} - {df['bed_count'].max()}")
    print(f"Accredited: {(df['accreditation_status'] == 'Active').sum()} / {len(df)}")


if __name__ == "__main__":
    main()
