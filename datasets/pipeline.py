"""
Full data pipeline -- download then clean both datasets.

Usage:
  python pipeline.py                 # full run
  python pipeline.py --skip-download # clean only (if raw files already present)
"""

import sys
import argparse
import importlib
import traceback
from pathlib import Path


def run_step(module_name: str, label: str) -> bool:
    print(f"\n{'='*60}")
    print(f"  STEP: {label}")
    print(f"{'='*60}")
    try:
        mod = importlib.import_module(module_name)
        mod.main()
        return True
    except SystemExit as e:
        print(f"\n[ERROR] {label} exited: {e}")
        return False
    except Exception:
        print(f"\n[ERROR] {label} failed:")
        traceback.print_exc()
        return False


def main():
    parser = argparse.ArgumentParser(description="ORIP data pipeline")
    parser.add_argument(
        "--skip-download",
        action="store_true",
        help="Skip download step (use existing raw files)",
    )
    args = parser.parse_args()

    # Change cwd to datasets/ so relative paths in sub-modules resolve correctly
    datasets_dir = Path(__file__).parent
    import os
    os.chdir(datasets_dir)
    sys.path.insert(0, str(datasets_dir))

    steps = []
    if not args.skip_download:
        steps.append(("download", "Download raw datasets"))
    steps += [
        ("clean_cms", "Clean CMS POS -> facilities"),
        ("clean_onet", "Clean O*NET -> roles, skills, knowledge, role_certs"),
    ]

    failed = []
    for module, label in steps:
        ok = run_step(module, label)
        if not ok:
            failed.append(label)

    print(f"\n{'='*60}")
    if failed:
        print(f"  Pipeline finished with {len(failed)} error(s):")
        for f in failed:
            print(f"    FAILED: {f}")
        sys.exit(1)
    else:
        print("  Pipeline complete. All steps succeeded.")
        clean_dir = datasets_dir / "clean"
        if clean_dir.exists():
            print(f"\n  Output files in: {clean_dir}/")
            for f in sorted(clean_dir.glob("*")):
                size = f.stat().st_size
                print(f"    {f.name:<40} {size:>10,} bytes")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
