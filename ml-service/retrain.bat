@echo off
:: KrishiCare ML Service - Retrain Script with Real-World Image Integration
:: Downloads base dataset + real field images and retrains model with field augmentations

cd /d "%~dp0"
echo.
echo =======================================================
echo  KrishiCare AI - Real-World Model Retraining Pipeline
echo =======================================================
echo.

echo [STEP 1] Downloading base dataset images...
venv\Scripts\python.exe src/download_dataset.py --max-per-class 300 --workers 12
if %errorlevel% neq 0 (
    echo [WARNING] Base dataset download had warnings or partial failures. Continuing...
)

echo.
echo [STEP 2] Downloading and integrating real-world field images (PlantDoc)...
venv\Scripts\python.exe src/download_real_dataset.py --download-plantdoc
if %errorlevel% neq 0 (
    echo [WARNING] Field images step skipped or had warnings. Continuing...
)

echo.
echo [STEP 3] Training model with field-condition augmentations and 2-phase fine-tuning...
echo          This may take 30-60 minutes on CPU.
echo.
venv\Scripts\python.exe src/train_model.py
if %errorlevel% neq 0 (
    echo [ERROR] Training failed.
    pause
    exit /b 1
)

echo.
echo =======================================================
echo  Training complete! Restart the service now:
echo  start_service.bat
echo =======================================================
pause
