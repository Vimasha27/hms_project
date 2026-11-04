@echo off
echo ========================================================
echo Starting CareSync Hospital Management System (HMS)
echo ========================================================

:: Ensure Node is in PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

echo 1. Checking Database Connectivity...
cd /d %~dp0server
call npm run db:check
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Database connection check failed or database is not reachable!
    echo Please verify DATABASE_URL in server\.env:
    echo  - For Cloud: Check your cloud database connection string and network access.
    echo  - For Local: Ensure PostgreSQL service is running or run: docker compose up -d
    echo.
    pause
)

echo.
echo 2. Starting Backend API Server (Port 5000)...
start "HMS Server API" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 2 /nobreak >nul

echo 3. Starting Frontend React Application (Port 5173)...
start "HMS Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo ========================================================
echo CareSync HMS Services Launched!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
echo ========================================================
