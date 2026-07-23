# KrishiCare AI — Crop Health Monitoring and Advisory Platform (Phase 1)

Welcome to the Machine Learning microservice of **KrishiCare AI** — an AI-powered Crop Health Monitoring and Advisory Platform. 

This microservice focuses on **Phase 1: ML Model Training**. It builds, trains, and evaluates a deep neural network to classify crop diseases for two core crops: **Tomato** and **Potato**.

---

## Phase 1 Overview

Phase 1 establishes our Core AI engine using **Transfer Learning** with the **MobileNetV2** architecture. The model classifies images of leaves into one of six classes:
1. **Tomato Healthy**
2. **Tomato Early Blight**
3. **Tomato Late Blight**
4. **Potato Healthy**
5. **Potato Early Blight**
6. **Potato Late Blight**

We freeze pre-trained ImageNet feature extractors, apply real-time data augmentation (Flips, Rotations, Zooms, and Contrast adjustments), and append a custom dense classification head.

---

## Directory Structure

```text
KrishiCare-AI/
└── ml-service/
    ├── dataset/
    │   ├── train/          # Training subset (used for weight optimization)
    │   │   ├── Tomato___healthy/
    │   │   ├── Tomato___Early_blight/
    │   │   ├── Tomato___Late_blight/
    │   │   ├── Potato___healthy/
    │   │   ├── Potato___Early_blight/
    │   │   └── Potato___Late_blight/
    │   ├── val/            # Validation subset (used for parameter tuning)
    │   │   └── [Same class folders...]
    │   └── test/           # Test subset (used for final unseen evaluation)
    │       └── [Same class folders...]
    │
    ├── models/             # Contains outputs (saved weights & training plots)
    │   ├── krishicare_mobilenetv2.h5 [Generated after training]
    │   ├── accuracy_plot.png         [Generated after training]
    │   └── loss_plot.png             [Generated after training]
    │
    ├── src/
    │   ├── train_model.py   # Code for model training & evaluation
    │   ├── predict_test.py  # Code for custom interactive testing
    │   └── class_names.json # Class mapping [Generated after training]
    │
    ├── requirements.txt     # Python dependencies
    ├── .gitignore           # Git ignore configurations
    └── README.md            # This documentation file
```

> [!NOTE]
> Large generated files, virtual environments, image datasets, and binary model files are excluded from GitHub by our `.gitignore` to maintain repository performance and avoid code bloat.

---

## Installation & Environment Setup (Windows)

Follow these steps to set up the local environment in PowerShell or Command Prompt:

### 1. Create a Python Virtual Environment
Navigate to the `ml-service` directory and run:
```powershell
python -m venv venv
```

### 2. Activate the Virtual Environment
On Windows, run the activation script:
* **PowerShell**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
* **Command Prompt (CMD)**:
  ```cmd
  .\venv\Scripts\activate.bat
  ```

Once activated, your terminal prompt will be prefixed with `(venv)`.

### 3. Install Dependencies
Install all required libraries using the local requirements manifest:
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

---

## Training and Testing Workflows

### Step 1: Download the dataset (automated)

```powershell
python src/download_dataset.py --max-per-class 80
```

This fetches tomato & potato leaf images from PlantVillage (via Hugging Face index + GitHub) and splits them into `dataset/train`, `dataset/val`, and `dataset/test`.

### Step 2: Train the Model
Run the model training pipeline:
```powershell
python src/train_model.py --quick   # fast dev training (~8 epochs)
python src/train_model.py           # full training (20 epochs)
```

**Start inference server:**

```powershell
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```
This script will:
1. Load and parse the images from `dataset/`.
2. Extract the classes and save the index mapping to `src/class_names.json`.
3. Train the model for 20 epochs using the best hyper-parameters.
4. Save the best model checkpoints to `models/krishicare_mobilenetv2.h5`.
5. Generate and save `accuracy_plot.png` and `loss_plot.png` in the `models/` directory.
6. Print the final loss and accuracy scores on the unseen `test/` dataset.

### Step 3: Run Interactive CLI Testing
Test your model predictions with custom leaf images:
```powershell
python src/predict_test.py
```
Provide the absolute or relative path of any leaf image (e.g. `test_leaf.jpg`), and the terminal will output the predicted crop state (e.g., `Tomato (Early Blight)`) with its corresponding confidence rating.

---

## Common Errors & Fixes

### 1. "Dataset directory is empty!"
* **Cause**: You haven't added image assets under `dataset/train/`, `dataset/val/`, or `dataset/test/` folders.
* **Fix**: Download crop disease datasets (like PlantVillage) and place them in the correct directories as shown in the **Directory Structure** section.

### 2. "Out Of Memory (OOM) error"
* **Cause**: Your GPU running TensorFlow is running out of VRAM due to high batch sizes.
* **Fix**: Open `src/train_model.py` and reduce `BATCH_SIZE = 32` to `BATCH_SIZE = 16` or `8`.

### 3. "ImportError: No module named 'tensorflow'"
* **Cause**: Your virtual environment is either not activated, or the installation was not executed inside the active shell environment.
* **Fix**: Reactivate the virtual environment using `.\venv\Scripts\Activate.ps1` and run `pip install -r requirements.txt`.
