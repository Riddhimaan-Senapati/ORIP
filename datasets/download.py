"""
Download raw datasets for the ORIP project.

Sources:
  1. CMS Provider of Services (POS) -- hospital & non-hospital facility data
     Dataset: "Provider of Services File - Quality Improvement and Evaluation System"
     Catalog:  https://data.cms.gov/data.json  (identifier key: 8ba0f9b4-...)
     API docs: https://data.cms.gov/data-api/v1/dataset/{uuid}/data
               Supports: size, offset, keyword, filter[COLUMN]=VALUE

  2. O*NET Database (Excel) -- occupation skills, knowledge, certifications
     https://www.onetcenter.org/database.html

Usage:
  python download.py
"""

import sys
import zipfile
import requests
from pathlib import Path
from tqdm import tqdm

RAW_DIR = Path(__file__).parent / "raw"
RAW_DIR.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# CMS POS -- "Provider of Services File - Quality Improvement and Evaluation System"
#
# URLs discovered via https://data.cms.gov/data.json (catalog endpoint).
# Each quarterly release has:
#   - A direct CSV download at sites/default/files/{date}/{uuid}/{filename}.csv
#   - A REST API at data-api/v1/dataset/{uuid}/data?size=N&offset=N&filter[COL]=VAL
#
# We prefer the REST API (paginated, filterable by state) and fall back to the
# direct CSV download when the API cannot be reached.
# ---------------------------------------------------------------------------

# Latest quarterly REST API endpoint (Q4 2025, updated 2026-01-12)
# Discovered from data.cms.gov/data.json distribution list.
CMS_API_URL = "https://data.cms.gov/data-api/v1/dataset/8ba0f9b4-9493-4aa0-9f82-44ea9468d1b5/data"

# Direct CSV fallback URLs (newest first, with UUID-based paths from data.json)
CMS_CSV_URLS = [
    # Q4 2025
    "https://data.cms.gov/sites/default/files/2026-01/c500f848-83b3-4f29-a677-562243a2f23b/Hospital_and_other.DATA.Q4_2025.csv",
    # Q3 2025
    "https://data.cms.gov/sites/default/files/2025-12/bba35b60-e5ba-4660-8d0a-c9703192eca3/Hospital_and_other.DATA.Q3_2025.csv",
    # Q2 2025
    "https://data.cms.gov/sites/default/files/2025-08/ab6b6f06-c7e6-49f1-a93d-c4564dfa394f/Hospital_and_Other_data_Q2_2025.csv",
    # Q4 2024
    "https://data.cms.gov/sites/default/files/2025-01/b5fb8b31-8e6e-41d0-8d73-8da1e2185ee2/PQWB.POSQ.OTHER.DATA.DEC24.csv",
]
CMS_OUT = RAW_DIR / "cms_pos_hospitals.csv"

# O*NET -- latest stable release zip (Excel edition)
# Check https://www.onetcenter.org/database.html for the current version.
ONET_ZIP_URLS = [
    "https://www.onetcenter.org/dl_files/database/db_29_0_excel.zip",
    "https://www.onetcenter.org/dl_files/database/db_28_3_excel.zip",
    "https://www.onetcenter.org/dl_files/database/db_28_1_excel.zip",
]
ONET_ZIP_OUT = RAW_DIR / "onet_db.zip"
ONET_DIR = RAW_DIR / "onet"


HEADERS = {"User-Agent": "ORIP-DataPipeline/1.0"}


def download_file(url: str, dest: Path, desc: str) -> bool:
    """Stream-download a file with a progress bar. Returns True on success."""
    try:
        resp = requests.get(url, stream=True, timeout=90, headers=HEADERS)
        ct = resp.headers.get("content-type", "")
        # Reject HTML responses (CMS portal serves SPA shell for bad URLs)
        if resp.status_code == 200 and "text/html" in ct:
            print(f"  Got HTML instead of data -- URL may have changed")
            return False
        resp.raise_for_status()
        total = int(resp.headers.get("content-length", 0))
        with open(dest, "wb") as f, tqdm(
            desc=desc,
            total=total,
            unit="B",
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for chunk in resp.iter_content(chunk_size=65536):
                f.write(chunk)
                bar.update(len(chunk))
        return True
    except requests.HTTPError as e:
        print(f"  HTTP {e.response.status_code}: {url[-60:]}")
        return False
    except requests.ConnectionError:
        print(f"  Connection failed -- check your internet connection.")
        return False


def download_cms_pos_via_api() -> bool:
    """
    Pull CMS POS data via the REST API (paginated, MA-filtered).
    API discovered from data.cms.gov/data.json distribution list.
    Supports:  ?size=N&offset=N&filter[COLUMN]=VALUE
    Returns True on success, False on any failure.
    """
    import pandas as pd

    print("[CMS]  Trying REST API (paginated, MA filter) ...")
    all_records = []
    offset = 0
    size = 2000

    while True:
        params = {
            "size": size,
            "offset": offset,
            "filter[STATE_CD]": "MA",   # filter to Massachusetts
        }
        try:
            resp = requests.get(CMS_API_URL, params=params, timeout=60, headers=HEADERS)
            resp.raise_for_status()
            batch = resp.json()
        except Exception as e:
            print(f"  API failed at offset {offset}: {e}")
            return False

        if not batch:
            break
        all_records.extend(batch)
        print(f"  Fetched {len(all_records):,} records ...", end="\r")
        if len(batch) < size:
            break
        offset += size

    if not all_records:
        print("  API returned 0 records.")
        return False

    df = pd.DataFrame(all_records)
    df.to_csv(CMS_OUT, index=False)
    print(f"\n[CMS]  API: saved {len(df):,} MA hospital records -> {CMS_OUT.name}")
    return True


def download_cms_pos():
    """
    Download CMS POS file. Strategy:
      1. REST API (filtered to MA, paginated) -- fast, small result set
      2. Direct CSV fallback (full national file ~50 MB, filter later in clean step)
    """
    if CMS_OUT.exists():
        print(f"[CMS]  Already downloaded: {CMS_OUT.name}  (delete to re-download)")
        return

    # Try API first
    if download_cms_pos_via_api():
        return

    # Fall back to direct CSV download
    print("[CMS]  Falling back to direct CSV download (~50 MB) ...")
    for url in CMS_CSV_URLS:
        fname = url.split("/")[-1]
        print(f"  Trying: {fname}")
        ok = download_file(url, CMS_OUT, "CMS POS CSV")
        if ok:
            size = CMS_OUT.stat().st_size
            print(f"[CMS]  Saved {size:,} bytes -> {CMS_OUT.name}")
            return
        if CMS_OUT.exists():
            CMS_OUT.unlink()

    print("[CMS]  All download methods failed.")
    print("  Manual steps:")
    print("  1. Open: https://data.cms.gov/data.json")
    print("     Search for 'Provider of Services File - Quality Improvement'")
    print("  2. Copy a text/csv distributionURL and download it")
    print(f"  3. Save as: {CMS_OUT}")


def download_onet():
    """
    Download the O*NET database zip (Excel edition) and extract it.
    The zip contains all occupation data files nested in a versioned folder
    such as  db_29_0_excel/Skills.xlsx.
    """
    ONET_DIR.mkdir(exist_ok=True)

    needed = [
        "Occupation Data.xlsx",
        "Skills.xlsx",
        "Knowledge.xlsx",
        "Education, Training, and Experience.xlsx",
    ]
    existing = [f for f in needed if (ONET_DIR / f).exists()]
    if len(existing) == len(needed):
        print(f"[ONET] All files already extracted ({ONET_DIR.name}/)")
        return
    if existing:
        print(f"[ONET] Partial extraction found ({len(existing)}/{len(needed)} files). Resuming ...")

    # Download zip if not already on disk
    if not ONET_ZIP_OUT.exists():
        print("[ONET] Downloading O*NET database zip ...")
        ok = False
        for url in ONET_ZIP_URLS:
            print(f"  Trying: {url.split('/')[-1]}")
            ok = download_file(url, ONET_ZIP_OUT, "O*NET db zip")
            if ok:
                break
            if ONET_ZIP_OUT.exists():
                ONET_ZIP_OUT.unlink()
        if not ok:
            print("[ONET] Download failed. Manual steps:")
            print("  1. Go to https://www.onetcenter.org/database.html#onet-database")
            print("  2. Download 'Excel' format of the latest release")
            print(f"  3. Extract the following files to  datasets/raw/onet/ :")
            for f in needed:
                print(f"       {f}")
            return
    else:
        print(f"[ONET] Using existing zip: {ONET_ZIP_OUT.name}")

    # Extract only the files we need
    print("[ONET] Extracting from zip ...")
    with zipfile.ZipFile(ONET_ZIP_OUT, "r") as zf:
        names = zf.namelist()
        for target in needed:
            dest_path = ONET_DIR / target
            if dest_path.exists():
                print(f"  Skip (exists): {target}")
                continue
            # Match the versioned folder path exactly: db_XX_X_excel/<target>
            # Use exact basename match to avoid e.g. "Technology Skills.xlsx"
            # matching when target is "Skills.xlsx"
            matches = [n for n in names if n.split("/")[-1] == target]
            if not matches:
                print(f"  WARNING: '{target}' not found in zip")
                continue
            with zf.open(matches[0]) as src, open(dest_path, "wb") as dst:
                dst.write(src.read())
            print(f"  Extracted: {dest_path.name}")

    print(f"[ONET] Done -> {ONET_DIR}/")


def main():
    print("=" * 60)
    print("ORIP Dataset Downloader")
    print("=" * 60)
    download_cms_pos()
    print()
    download_onet()
    print()
    print("Download complete. Run clean_cms.py and clean_onet.py next.")


if __name__ == "__main__":
    main()
