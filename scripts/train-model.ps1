# KrishiCare AI Model Training Script
# This script downloads the comprehensive dataset and trains the enhanced ML model

Write-Host "========================================" -ForegroundColor Green
Write-Host "KrishiCare AI Model Training Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python not found. Please install Python 3.8 or higher." -ForegroundColor Red
    exit 1
}

# Navigate to ml-service
Write-Host "Navigating to ml-service directory..." -ForegroundColor Yellow
Set-Location ml-service

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Ask for dataset size
Write-Host ""
Write-Host "Dataset Configuration:" -ForegroundColor Cyan
Write-Host "1. Quick test (50 images per class, ~2,000 total)" -ForegroundColor White
Write-Host "2. Medium dataset (100 images per class, ~4,000 total)" -ForegroundColor White
Write-Host "3. Full dataset (200 images per class, ~8,000 total)" -ForegroundColor White
Write-Host "4. Custom size" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select dataset size (1-4, default: 1)"

$maxPerClass = switch ($choice) {
    "1" { 50 }
    "2" { 100 }
    "3" { 200 }
    "4" { 
        $custom = Read-Host "Enter max images per class (recommended: 50-200)"
        [int]$custom
    }
    default { 50 }
}

Write-Host ""
Write-Host "Downloading dataset with $maxPerClass images per class..." -ForegroundColor Yellow
Write-Host "This may take several minutes depending on your internet connection." -ForegroundColor Yellow
Write-Host ""

python src/download_dataset.py --max-per-class $maxPerClass

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to download dataset." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Dataset downloaded successfully!" -ForegroundColor Green

# Ask for training mode
Write-Host ""
Write-Host "Training Configuration:" -ForegroundColor Cyan
Write-Host "1. Quick training (8 epochs, for testing)" -ForegroundColor White
Write-Host "2. Full training (30 epochs, for production)" -ForegroundColor White
Write-Host ""

$trainingChoice = Read-Host "Select training mode (1-2, default: 1)"

$trainingArgs = switch ($trainingChoice) {
    "1" { "--quick" }
    "2" { "" }
    default { "--quick" }
}

Write-Host ""
Write-Host "Starting model training..." -ForegroundColor Yellow
Write-Host "This may take 10-30 minutes depending on your hardware." -ForegroundColor Yellow
Write-Host ""

if ($trainingArgs) {
    python src/train_model.py $trainingArgs
} else {
    python src/train_model.py
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Training failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Training completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Model saved to: models/krishicare_mobilenetv2.h5" -ForegroundColor Cyan
Write-Host "Class names saved to: src/class_names.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now start the ML service:" -ForegroundColor Yellow
Write-Host "uvicorn src.main:app --reload --port 8000" -ForegroundColor Cyan
Write-Host ""

# Return to original directory
Set-Location ..
