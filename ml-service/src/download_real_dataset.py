"""
KrishiCare AI - Real-World Field Dataset Integrator & Downloader
================================================================
This script integrates real-world plant disease photos (field condition images with natural backgrounds,
varying lighting, complex outdoors settings) into the KrishiCare dataset structure.

Supports:
1. Automatic downloading of PlantDoc / Field plant disease images from public GitHub repositories.
2. Direct ingestion of user-provided custom field photos directory (--custom-dir).
"""

import os
import sys
import json
import shutil
import random
import time
import argparse
import urllib.request
import urllib.parse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# PlantDoc GitHub repository URL for real field images
PLANTDOC_RAW_BASE = "https://raw.githubusercontent.com/pratikkayal/PlantDoc-Dataset/master/train/"

# Mapping from PlantDoc class folder names to KrishiCare standard class folder names
PLANTDOC_CLASS_MAP = {
    "Apple Scab Leaf":                     "Apple___Apple_scab",
    "Apple Rust Leaf":                     "Apple___Cedar_apple_rust",
    "Apple Leaf":                          "Apple___healthy",
    "Cherry leaf":                         "Cherry_(including_sour)___healthy",
    "Corn Gray leaf spot":                 "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn Common rust Leaf":               "Corn_(maize)___Common_rust",
    "Corn Leaf blight":                    "Corn_(maize)___Northern_Leaf_Blight",
    "Grape Black rot Leaf":                "Grape___Black_rot",
    "Grape Leaf":                          "Grape___healthy",
    "Peach Leaf":                          "Peach___healthy",
    "Bell_pepper leaf spot":               "Pepper,_bell___Bacterial_spot",
    "Bell_pepper leaf":                    "Pepper,_bell___healthy",
    "Potato Early blight leaf":            "Potato___Early_blight",
    "Potato Late blight leaf":             "Potato___Late_blight",
    "Potato leaf":                         "Potato___healthy",
    "Soyabean leaf":                       "Soybean___healthy",
    "Squash Powdery mildew leaf":          "Squash___Powdery_mildew",
    "Strawberry leaf":                     "Strawberry___healthy",
    "Tomato Early blight leaf":            "Tomato___Early_blight",
    "Tomato Late blight leaf":             "Tomato___Late_blight",
    "Tomato leaf mold":                    "Tomato___Leaf_Mold",
    "Tomato Septoria leaf spot":           "Tomato___Septoria_leaf_spot",
    "Tomato Two-spotted spider mites leaf":"Tomato___Spider_mites_Two-spotted_spider_mite",
    "Tomato Target Spot leaf":             "Tomato___Target_Spot",
    "Tomato Yellow Leaf Curl Virus leaf":  "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato mosaic virus leaf":            "Tomato___Tomato_mosaic_virus",
    "Tomato leaf":                         "Tomato___healthy",
}


def copy_custom_images(custom_dir: Path, target_base: Path, split_ratios=(0.75, 0.15, 0.10)):
    """Ingest user-provided real field photos from a local directory into dataset/train, val, test."""
    print(f"\n📂 Ingesting custom field photos from: {custom_dir}")
    if not custom_dir.exists():
        print(f"❌ Error: Custom directory '{custom_dir}' does not exist.")
        return 0

    count = 0
    for class_folder in custom_dir.iterdir():
        if not class_folder.is_dir():
            continue
        
        target_cls = class_folder.name
        images = [f for f in class_folder.iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.bmp', '.webp')]
        if not images:
            continue
            
        random.shuffle(images)
        n = len(images)
        n_train = max(1, int(n * split_ratios[0]))
        n_val   = max(1, int(n * split_ratios[1]))

        splits = {
            "train": images[:n_train],
            "val":   images[n_train:n_train + n_val],
            "test":  images[n_train + n_val:]
        }

        for split, file_list in splits.items():
            dest_dir = target_base / split / target_cls
            dest_dir.mkdir(parents=True, exist_ok=True)
            for img in file_list:
                dest_file = dest_dir / f"custom_{img.name}"
                shutil.copy2(img, dest_file)
                count += 1
        print(f"  ✓ Added {n} field images for class '{target_cls}'")

    print(f"✅ Finished importing {count} custom field images.")
    return count


def download_plantdoc_real_images(base_dir: Path, max_workers=8):
    """Download PlantDoc real-world field dataset files."""
    print("\n🌐 Checking & Downloading PlantDoc real-world field image dataset...")
    
    # We download a sample index of real field photos for key classes
    count = 0
    api_url = "https://api.github.com/repos/pratikkayal/PlantDoc-Dataset/contents/train"
    req = urllib.request.Request(api_url, headers={"User-Agent": "KrishiCare-AI/2.0"})
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            folders = json.loads(resp.read())
    except Exception as e:
        print(f"⚠️ Could not query PlantDoc API directly ({e}). Skipping remote download step.")
        return 0

    download_jobs = []
    for item in folders:
        if item.get("type") == "dir":
            folder_name = item.get("name")
            target_cls = PLANTDOC_CLASS_MAP.get(folder_name)
            if not target_cls:
                continue

            # Query folder contents
            sub_url = f"https://api.github.com/repos/pratikkayal/PlantDoc-Dataset/contents/train/{urllib.parse.quote(folder_name)}"
            try:
                sub_req = urllib.request.Request(sub_url, headers={"User-Agent": "KrishiCare-AI/2.0"})
                with urllib.request.urlopen(sub_req, timeout=15) as sub_resp:
                    files = json.loads(sub_resp.read())
                    img_files = [f for f in files if f.get("type") == "file" and f.get("name", "").lower().endswith(('.jpg', '.jpeg', '.png'))]
                    
                    random.shuffle(img_files)
                    for i, img_info in enumerate(img_files[:50]): # fetch up to 50 field images per class
                        raw_url = img_info.get("download_url")
                        fname = img_info.get("name")
                        
                        # Split 80% train, 20% val
                        split = "train" if (i % 5 != 0) else "val"
                        dest = base_dir / split / target_cls / f"plantdoc_{fname}"
                        if raw_url and not dest.exists():
                            download_jobs.append((raw_url, dest))
            except Exception as e:
                print(f"  ⚠️ Warning reading {folder_name}: {e}")
                continue

    if not download_jobs:
        print("  ✓ Real field images already downloaded or no new files queued.")
        return 0

    print(f"📥 Downloading {len(download_jobs)} real-world field images...")
    def _dl(job):
        url, dest = job
        dest.parent.mkdir(parents=True, exist_ok=True)
        try:
            urllib.request.urlretrieve(url, dest)
            return True
        except Exception:
            return False

    success = 0
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futs = [pool.submit(_dl, j) for j in download_jobs]
        for fut in as_completed(futs):
            if fut.result():
                success += 1

    print(f"✅ Downloaded {success}/{len(download_jobs)} real field images!")
    return success


def main():
    parser = argparse.ArgumentParser(description="Ingest real-world field plant images into KrishiCare dataset.")
    parser.add_argument("--custom-dir", type=str, help="Path to local folder containing class subdirectories with real photos")
    parser.add_argument("--download-plantdoc", action="store_true", help="Download PlantDoc real field images dataset from GitHub")
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent.parent / "dataset"
    base_dir.mkdir(parents=True, exist_ok=True)

    if args.custom_dir:
        copy_custom_images(Path(args.custom_dir), base_dir)

    if args.download_plantdoc:
        download_plantdoc_real_images(base_dir)

    if not args.custom_dir and not args.download_plantdoc:
        # Default behavior if run with no args
        print("ℹ️ Running default real-world dataset check & download...")
        download_plantdoc_real_images(base_dir)


if __name__ == "__main__":
    main()
