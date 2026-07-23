# KrishiCare AI — one-command setup (Windows PowerShell)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "`n=== KrishiCare AI Setup ===`n" -ForegroundColor Green

# --- ML Service ---
Write-Host "[1/3] Setting up ML service..." -ForegroundColor Cyan
Set-Location "$Root\ml-service"

if (-not (Test-Path "venv")) {
    python -m venv venv
}

& ".\venv\Scripts\Activate.ps1"
pip install --upgrade pip -q
pip install -r requirements-base.txt -q
pip install tensorflow -q

if (-not (Test-Path "dataset\train\Tomato___healthy\*.jpg")) {
    Write-Host "Downloading PlantVillage dataset subset (6 classes, ~80 images each)..."
    python src/download_dataset.py --max-per-class 80
} else {
    Write-Host "Dataset already present, skipping download."
}

if (-not (Test-Path "models\krishicare_mobilenetv2.h5")) {
    Write-Host "Training model (quick mode, ~5-15 min depending on hardware)..."
    python src/train_model.py --quick
} else {
    Write-Host "Trained model already exists, skipping training."
}

# --- Frontend ---
Write-Host "`n[2/3] Setting up frontend..." -ForegroundColor Cyan
Set-Location "$Root\frontend"
if (-not (Test-Path "node_modules")) {
    npm install
}

# --- Backend ---
Write-Host "`n[3/3] Compiling backend..." -ForegroundColor Cyan
Set-Location "$Root\backend"
mvn -q compile -DskipTests

Set-Location $Root
Write-Host "`n=== Setup complete! ===`n" -ForegroundColor Green
Write-Host "Start all services:  .\scripts\start.ps1"
Write-Host "Or manually:"
Write-Host "  ML:       cd ml-service; .\venv\Scripts\Activate.ps1; uvicorn src.main:app --reload --port 8000"
Write-Host "  Backend:  cd backend; mvn spring-boot:run"
Write-Host "  Frontend: cd frontend; npm run dev"
Write-Host ""
