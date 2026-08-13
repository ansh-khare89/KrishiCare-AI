@echo off
:: KrishiCare ML Service - Quick Start Script
:: Starts the FastAPI service on port 8000

cd /d "%~dp0"
echo.
echo ===============================================
echo  KrishiCare AI - ML Service Starter
echo ===============================================
echo.

:: Check if port 8000 is in use
netstat -ano | findstr ":8000" >nul 2>&1
if %errorlevel% == 0 (
    echo [WARNING] Port 8000 is already in use. Killing existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 >nul
)

echo [INFO] Starting FastAPI ML Service on http://localhost:8000 ...
echo [INFO] Press Ctrl+C to stop the service.
echo.

venv\Scripts\python.exe -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
