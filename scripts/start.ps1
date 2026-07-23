# KrishiCare AI — start all services (Windows PowerShell)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "`nStarting KrishiCare AI services...`n" -ForegroundColor Green

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$Root\ml-service'; .\venv\Scripts\Activate.ps1; uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"
) -WindowStyle Normal

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$Root\backend'; mvn spring-boot:run"
) -WindowStyle Normal

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$Root\frontend'; npm run dev"
) -WindowStyle Normal

Write-Host "Services starting in separate windows:"
Write-Host "  ML service:  http://localhost:8000"
Write-Host "  Backend API: http://localhost:8080"
Write-Host "  Frontend:    http://localhost:5173"
Write-Host ""
