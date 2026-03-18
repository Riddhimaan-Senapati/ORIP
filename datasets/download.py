"""
Download raw datasets for the ORIP project.

Sources:
  1. CMS Provider of Services (POS) -- hospital facility data
     https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/provider-of-services-file-hospital-non-hospital-type

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
# CMS POS
# CMS publishes a flat CSV file updated quarterly. We try the three most
# recently known stable download URLs in order; if all fail we print manual
# instructions. The latest version URL can be found at:
#   https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/
#       provider-of-services-file-hospital-non-hospital-type
# ---------------------------------------------------------------------------

# Known quarterly release URLs (newest first). Update this list when CMS
# publishes a new quarterly file.
CMS_CSV_URLS = [
    "https://data.cms.gov/sites/default/files/2024-10/pos_other_oct2024.csv",
    "https://data.cms.gov/sites/default/files/2024-07/pos_other_july2024.csv",
    "https://data.cms.gov/sites/default/files/2024-04/pos_other_april2024.csv",
    "https://data.cms.gov/sites/default/files/2023-10/pos_other_oct2023.csv",
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


def download_file(url: str, dest: Path, desc: str) -> bool:
    """Stream-download a file with a progress bar. Returns True on success."""
    try:
        resp = requests.get(url, stream=True, timeout=90,
                            headers={"User-Agent": "ORIP-DataPipeline/1.0"})
        # Reject HTML responses (CMS sometimes serves a SPA shell instead of data)
        ct = resp.headers.get("content-type", "")
        if resp.status_code == 200 and "text/html" in ct:
            print(f"  Got HTML instead of data (URL may have changed): {url}")
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
        print(f"  HTTP {e.response.status_code}: {url}")
        return False
    except requests.ConnectionError:
        print(f"  Connection failed -- check your internet connection.")
        return False


def download_cms_pos():
    """Try each known CMS flat-file URL in order, stop on first success."""
    if CMS_OUT.exists():
        print(f"[CMS]  Already downloaded: {CMS_OUT.name}  (delete to re-download)")
        return

    print("[CMS]  Fetching CMS Provider of Services file ...")
    for url in CMS_CSV_URLS:
        print(f"  Trying: {url.split('/')[-1]}")
        ok = download_file(url, CMS_OUT, "CMS POS CSV")
        if ok:
            size = CMS_OUT.stat().st_size
            print(f"[CMS]  Saved {size:,} bytes -> {CMS_OUT}")
            return
        # Clean up partial download
        if CMS_OUT.exists():
            CMS_OUT.unlink()

    print("[CMS]  All automatic URLs failed.")
    print("       Manual download steps:")
    print("  1. Open in browser:")
    print("     https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/")
    print("     provider-of-services-file-hospital-non-hospital-type")
    print(f"  2. Click 'Download'  ->  save CSV as:")
    print(f"     {CMS_OUT}")


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
