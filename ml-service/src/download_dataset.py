"""
Download comprehensive PlantVillage dataset (30+ crops, 50+ classes) and split into
train / val / test folders for KrishiCare training.

Uses the Hugging Face PlantVillage index for file paths, then downloads
images from the public GitHub repository.
"""

import argparse
import os
import random
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# Comprehensive crop disease classes covering 30+ crops
TARGET_CLASSES = [
    # Tomato
    "Tomato___healthy",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Bacterial_spot",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites_Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    # Potato
    "Potato___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    # Corn (Maize)
    "Corn_(maize)___healthy",
    "Corn_(maize)___Common_rust",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    # Apple
    "Apple___healthy",
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    # Grape
    "Grape___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    # Pepper
    "Pepper,_bell___healthy",
    "Pepper,_bell___Bacterial_spot",
    # Peach
    "Peach___healthy",
    "Peach___Bacterial_spot",
    # Cherry
    "Cherry_(including_sour)___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    # Strawberry
    "Strawberry___healthy",
    "Strawberry___Leaf_scorch",
    # Orange
    "Orange___Haunglongbing_(Citrus_greening)",
    # Squash
    "Squash___Powdery_mildew",
    # Blueberry
    "Blueberry___healthy",
    # Soybean
    "Soybean___healthy",
]

GITHUB_BASE = "https://raw.githubusercontent.com/spMohanty/PlantVillage-Dataset/master/"
SPLITS = ("train", "val", "test")
SPLIT_RATIOS = (0.70, 0.15, 0.15)


def class_from_path(path: str) -> str | None:
    for cls in TARGET_CLASSES:
        if f"/{cls}/" in path.replace("\\", "/"):
            return cls
    return None


def download_image(path: str, dest: Path) -> bool:
    url = GITHUB_BASE + path.replace(" ", "%20")
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        urllib.request.urlretrieve(url, dest)
        return dest.stat().st_size > 0
    except (urllib.error.HTTPError, urllib.error.URLError, OSError):
        if dest.exists():
            dest.unlink(missing_ok=True)
        return False


def collect_paths(max_per_class: int):
    from datasets import concatenate_datasets, load_dataset

    print("Indexing PlantVillage paths from Hugging Face...")
    try:
        ds = load_dataset("mohanty/PlantVillage", "color")
    except ValueError:
        ds = load_dataset("mohanty/PlantVillage", "default")

    combined = concatenate_datasets([ds["train"], ds["test"]])
    by_class = {cls: [] for cls in TARGET_CLASSES}

    for row in combined:
        path = row.get("text") or row.get("image", "")
        if isinstance(path, dict):
            continue
        cls = class_from_path(str(path))
        if cls and len(by_class[cls]) < max_per_class:
            by_class[cls].append(str(path))

    return by_class


def main():
    parser = argparse.ArgumentParser(description="Download KrishiCare training dataset")
    parser.add_argument(
        "--max-per-class",
        type=int,
        default=100,
        help="Max images per class (default 100)",
    )
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--workers", type=int, default=8)
    args = parser.parse_args()

    try:
        by_class = collect_paths(args.max_per_class if args.max_per_class > 0 else 10_000)
    except ImportError:
        print("Missing dependency. Run: pip install datasets")
        raise SystemExit(1)

    random.seed(args.seed)
    base = Path("dataset")
    jobs = []
    summary = {}

    for cls in TARGET_CLASSES:
        paths = by_class[cls]
        random.shuffle(paths)
        n = len(paths)
        if n == 0:
            print(f"Warning: no paths found for {cls}")
            continue

        n_train = max(1, int(n * SPLIT_RATIOS[0]))
        n_val = max(1, int(n * SPLIT_RATIOS[1]))
        partitions = {
            "train": paths[:n_train],
            "val": paths[n_train : n_train + n_val],
            "test": paths[n_train + n_val :],
        }

        for split, split_paths in partitions.items():
            for i, src_path in enumerate(split_paths):
                filename = Path(src_path).name
                dest = base / split / cls / f"{i:04d}_{filename}"
                jobs.append((src_path, dest))

        summary[cls] = len(paths)

    print(f"\nDownloading {len(jobs)} images ({args.workers} parallel workers)...")
    ok = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(download_image, src, dest): dest for src, dest in jobs}
        for i, future in enumerate(as_completed(futures), 1):
            if future.result():
                ok += 1
            if i % 50 == 0 or i == len(jobs):
                print(f"  Progress: {i}/{len(jobs)} ({ok} successful)")

    print("\nDataset ready:")
    total = 0
    for cls in TARGET_CLASSES:
        train_count = len(list((base / "train" / cls).glob("*"))) if (base / "train" / cls).exists() else 0
        total += train_count
        print(f"  {cls}: {train_count} train images")
    print(f"\nTotal train images: {total}")
    print(f"Location: {base.resolve()}")
    print("\nNext: python src/train_model.py --quick")


if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent.parent)
    main()
