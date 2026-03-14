@echo off
REM Verification script for News Portal Network Error fix
REM This checks if everything is properly configured

setlocal enabledelayedexpansion

cls
echo.
echo ========================================
echo News Portal - Setup Verification
echo ========================================
echo.

REM Check 1: Frontend .env.local exists
echo [1/5] Checking frontend environment file...
if exist "frontend\.env.local" (
    echo ✅ frontend\.env.local exists
) else (
    echo ❌ frontend\.env.local NOT found
    echo    Run: cd frontend ^&^& copy .env.example .env.local
)

REM Check 2: Laravel backend exists
echo.
echo [2/5] Checking Laravel installation...
if exist "news-cms\artisan" (
    echo ✅ Laravel installation found
) else (
    echo ❌ Laravel installation NOT found
    echo    Please run: composer install in news-cms folder
)

REM Check 3: Frontend node_modules exists
echo.
echo [3/5] Checking Node dependencies...
if exist "frontend\node_modules" (
    echo ✅ Node packages installed
) else (
    echo ❌ Node packages NOT installed
    echo    Run: npm install in frontend folder
)

REM Check 4: Check if backend can respond
echo.
echo [4/5] Testing backend API endpoint...
echo    Checking http://127.0.0.1:8010/api/public/notifications
timeout /t 1 /nobreak >nul
curl -s http://127.0.0.1:8010/api/public/notifications >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Backend is responding
) else (
    echo ⚠️  Backend not responding (not running?)
    echo    Start with: cd news-cms ^&^& php artisan serve --port=8010
)

REM Check 5: CORS configuration
echo.
echo [5/5] Checking CORS configuration...
findstr /r "allowed_origins" "news-cms\config\cors.php" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ CORS configuration found
) else (
    echo ❌ CORS configuration issue
)

echo.
echo ========================================
echo Verification Summary
echo ========================================
echo.
echo Quick Start:
echo.
echo Terminal 1 - Backend:
echo   cd news-cms
echo   php artisan serve --port=8010 --host=127.0.0.1
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
