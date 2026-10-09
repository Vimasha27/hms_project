@echo off
echo ========================================================
echo Starting CareSync Hospital Management System (HMS)
echo ========================================================

:: Ensure Node is in PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

echo 1. Starting PostgreSQL...
start "HMS PostgreSQL" cmd /k "cd /d %~dp0server && npx tsx scripts/run-db.ts"

timeout /t 3 /nobreak >nul

echo 2. Starting Backend API Server (Port 5000)...
start "HMS Server API" cmd /k "cd /d %~dp0server && npm start"

timeout /t 2 /nobreak >nul

echo 3. Starting Frontend React Application (Port 5173)...
start "HMS Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo ========================================================
echo CareSync HMS Services Launched!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
echo ========================================================
