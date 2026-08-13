@echo off
:: KrishiCare ML Service - Retrain Script
:: Downloads fresh data and retrains the model

cd /d "%~dp0"
echo.
echo ===============================================
echo  KrishiCare AI - Model Retraining Pipeline
echo ===============================================
echo.

echo [STEP 1] Downloading dataset (300 images per class)...
venv\Scripts\python.exe src/download_dataset.py --max-per-class 300 --workers 12
if %errorlevel% neq 0 (
    echo [ERROR] Dataset download failed. Check your internet connection.
    pause
    exit /b 1
)

echo.
echo [STEP 2] Training model with 2-phase fine-tuning...
echo          This may take 30-60 minutes on CPU.
echo.
venv\Scripts\python.exe src/train_model.py
if %errorlevel% neq 0 (
    echo [ERROR] Training failed.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo  Training complete! Restart the service now:
echo  start_service.bat
echo ===============================================
pause
