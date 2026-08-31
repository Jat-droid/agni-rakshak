@echo off
title AGNI-RAKSHAK Launcher
echo ======================================================
echo   AGNI-RAKSHAK :: Starting All 3 Services Concurrently
echo ======================================================

set ROOT=%~dp0

echo [1/3] Starting .NET Backend API...
start "AGNI-RAKSHAK Backend" cmd /k "cd /d %ROOT%dotnet-backend && dotnet run"

timeout /t 2 /nobreak >nul

echo [2/3] Starting React Frontend...
start "AGNI-RAKSHAK Frontend" cmd /k "cd /d %ROOT%react-frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Python Edge AI Engine...
start "AGNI-RAKSHAK AI Engine" cmd /k "cd /d %ROOT%python-ai && python fire_detector.py"

echo.
echo All services launched!
echo Open dashboard: http://localhost:5173
