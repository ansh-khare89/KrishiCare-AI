"""
KrishiCare - Targeted gap-filler downloader.
Downloads images only for classes that have fewer than MIN_IMAGES in train/.
Uses GitHub raw URLs directly — no HuggingFace dependency.
"""
import argparse, json, os, sys, random, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

MIN_IMAGES   = 150   # download if class has fewer than this in train/
MAX_PER_CLASS = 300
WORKERS       = 16
RETRIES       = 3

GITHUB_API_BASE = "https://api.github.com/repos/spMohanty/PlantVillage-Dataset/contents/raw/color/"
GITHUB_RAW_BASE = "https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/raw/color/"

# GitHub folder name → local folder name
CLASS_MAP = {
    "Apple___Apple_scab":                         "Apple___Apple_scab",
    "Apple___Black_rot":                          "Apple___Black_rot",
    "Apple___Cedar_apple_rust":                   "Apple___Cedar_apple_rust",
    "Apple___healthy":                            "Apple___healthy",
    "Blueberry___healthy":                        "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew":   "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy":          "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_":                "Corn_(maize)___Common_rust",
    "Corn_(maize)___Northern_Leaf_Blight":        "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy":                     "Corn_(maize)___healthy",
    "Grape___Black_rot":                          "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)":               "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy":                            "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)":   "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot":                     "Peach___Bacterial_spot",
    "Peach___healthy":                            "Peach___healthy",
    "Pepper,_bell___Bacterial_spot":              "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy":                     "Pepper,_bell___healthy",
    "Potato___Early_blight":                      "Potato___Early_blight",
    "Potato___Late_blight":                       "Potato___Late_blight",
    "Potato___healthy":                           "Potato___healthy",
    "Soybean___healthy":                          "Soybean___healthy",
    "Squash___Powdery_mildew":                    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch":                   "Strawberry___Leaf_scorch",
    "Strawberry___healthy":                       "Strawberry___healthy",
    "Tomato___Bacterial_spot":                    "Tomato___Bacterial_spot",
    "Tomato___Early_blight":                      "Tomato___Early_blight",
    "Tomato___Late_blight":                       "Tomato___Late_blight",
    "Tomato___Leaf_Mold":                         "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot":                "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite": "Tomato___Spider_mites_Two-spotted_spider_mite",
    "Tomato___Target_Spot":                       "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus":     "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus":               "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy":                           "Tomato___healthy",
}

SPLIT_RATIOS = (0.70, 0.15, 0.15)


def count_train(local_cls: str, base: Path) -> int:
    p = base / "train" / local_cls
    return len(list(p.glob("*"))) if p.exists() else 0


def github_api_list(github_cls: str) -> list:
    encoded = urllib.parse.quote(github_cls, safe="(),_")
    url = GITHUB_API_BASE + encoded
    req = urllib.request.Request(url, headers={"User-Agent": "KrishiCare/2.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
        return [x["name"] for x in data
                if x.get("type") == "file"
                and x["name"].lower().endswith((".jpg", ".jpeg", ".png"))]
    except Exception as e:
        print(f"    API error ({github_cls}): {e}")
        return []


def download_one(url: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 1000:
        return True  # already downloaded
    dest.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(RETRIES):
        try:
            urllib.request.urlretrieve(url, dest)
            if dest.stat().st_size > 1000:
                return True
        except Exception:
            time.sleep(0.5 * (attempt + 1))
        if dest.exists():
            dest.unlink(missing_ok=True)
    return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--min-images",   type=int, default=MIN_IMAGES)
    parser.add_argument("--max-per-class",type=int, default=MAX_PER_CLASS)
    parser.add_argument("--workers",      type=int, default=WORKERS)
    parser.add_argument("--seed",         type=int, default=42)
    parser.add_argument("--force-all",    action="store_true",
                        help="Download all classes regardless of current count")
    args = parser.parse_args()

    random.seed(args.seed)
    base = Path("dataset")

    # Identify which classes need more images
    print("\n📊 Scanning current dataset...\n")
    needs_download = {}
    for gh_cls, local_cls in CLASS_MAP.items():
        current = count_train(local_cls, base)
        if args.force_all or current < args.min_images:
            needs_download[gh_cls] = (local_cls, current)
            status = f"⚠  {current:3d} imgs → will download"
        else:
            status = f"✓  {current:3d} imgs → OK"
        print(f"  {local_cls[:52]:<52} {status}")

    print(f"\n{'='*65}")
    print(f"  {len(needs_download)} classes need more images")
    print(f"{'='*65}\n")

    if not needs_download:
        print("✅ All classes already have sufficient images!")
        print("   Run: python src/train_model.py")
        return

    # Fetch file lists and build download jobs
    all_jobs = []
    for gh_cls, (local_cls, current_count) in needs_download.items():
        print(f"  📋 Fetching list: {local_cls[:50]}", end="", flush=True)
        files = github_api_list(gh_cls)
        if not files:
            print(f" → 0 files from API, skipping")
            continue

        random.shuffle(files)
        files = files[:args.max_per_class]
        n = len(files)
        n_train = max(1, int(n * SPLIT_RATIOS[0]))
        n_val   = max(1, int(n * SPLIT_RATIOS[1]))
        parts = {
            "train": files[:n_train],
            "val":   files[n_train:n_train + n_val],
            "test":  files[n_train + n_val:],
        }
        enc_cls = urllib.parse.quote(gh_cls, safe="(),_ ")
        for split, fnames in parts.items():
            for i, fname in enumerate(fnames):
                url  = GITHUB_RAW_BASE + enc_cls + "/" + urllib.parse.quote(fname)
                dest = base / split / local_cls / f"{i:04d}_{fname}"
                all_jobs.append((url, dest))
        print(f" → {len(files)} files queued")

    print(f"\n📥 Downloading {len(all_jobs)} images with {args.workers} workers...\n")

    ok = fail = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futs = {pool.submit(download_one, url, dest): dest for url, dest in all_jobs}
        for i, fut in enumerate(as_completed(futs), 1):
            if fut.result():
                ok += 1
            else:
                fail += 1
            if i % 100 == 0 or i == len(all_jobs):
                pct = i / len(all_jobs) * 100
                print(f"  [{pct:5.1f}%] {i}/{len(all_jobs)}  ✓{ok}  ✗{fail}", flush=True)

    # Final count
    print(f"\n{'='*65}")
    print("Final train image counts:")
    total = 0
    for _, local_cls in CLASS_MAP.items():
        c = count_train(local_cls, base)
        flag = "⚠ STILL LOW" if c < 50 else ""
        print(f"  {local_cls[:52]:<52} {c:4d}  {flag}")
        total += c
    print(f"\n  Total: {total} train images  |  ✓{ok} downloaded  ✗{fail} failed")
    print(f"\n✅ Done! Next: python src/train_model.py")
    print(f"{'='*65}\n")


if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent.parent)
    main()
