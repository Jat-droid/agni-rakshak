# ==============================================================================
# AGNI-RAKSHAK :: One-Click Local Multi-Service Launcher (Windows PowerShell)
# ==============================================================================

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  AGNI-RAKSHAK :: Starting All 3 Services Concurrently " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Start ASP.NET Core Backend (Port 5080)
Write-Host "[1/3] Launching .NET 8 Backend API on http://localhost:5080..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\dotnet-backend'; dotnet run"

Start-Sleep -Seconds 2

# 2. Start React Dashboard (Port 5173)
Write-Host "[2/3] Launching Vite + React Dashboard on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\react-frontend'; npm run dev"

Start-Sleep -Seconds 2

# 3. Start Python Edge-AI YOLOv8 Engine
Write-Host "[3/3] Launching Python Edge-AI Ingestion Engine..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\python-ai'; python fire_detector.py"

Write-Host ""
Write-Host "All 3 services launched in separate windows!" -ForegroundColor Yellow
Write-Host "Dashboard: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5080" -ForegroundColor Cyan
