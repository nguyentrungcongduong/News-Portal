@echo off
REM Quick Start Script for News Portal
REM This script starts both backend and frontend servers

echo.
echo ========================================
echo News Portal - Quick Start
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "news-cms" (
    echo Error: Please run this script from the News-Portal root directory
    echo Expected: c:\laragon\www\News-Portal
    pause
    exit /b 1
)

echo Starting backend and frontend servers...
echo.

REM Start backend in new window
echo [1/2] Starting Laravel Backend on port 8010...
start "News Portal - Backend" cmd /k "cd news-cms && php artisan serve --port=8010 --host=127.0.0.1"

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start frontend in new window
echo [2/2] Starting Next.js Frontend on port 3000...
start "News Portal - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Servers starting...
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8010
echo Frontend: http://localhost:3000
echo.
echo Wait 10-15 seconds for both to fully start
echo.
pause
