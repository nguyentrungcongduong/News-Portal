@echo off
REM Check if backend is running on port 8010

echo.
echo Checking if Laravel backend is running on port 8010...
echo.

REM Test connection to backend
powershell -Command "try { $null = Invoke-WebRequest -Uri 'http://127.0.0.1:8010/api/public/notifications' -TimeoutSec 3 -ErrorAction Stop; Write-Host '✓ Backend is responding!'; exit 0 } catch { Write-Host '✗ Backend is NOT responding'; exit 1 }"

if errorlevel 1 (
    echo.
    echo To start the backend, run:
    echo.
    echo   cd news-cms
    echo   php artisan serve --port=8010 --host=127.0.0.1
    echo.
    pause
    exit /b 1
)

echo.
echo Testing endpoint response:
echo.
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://127.0.0.1:8010/api/public/notifications' -TimeoutSec 3; Write-Host 'Response:'; Write-Host $response.Content } catch { Write-Host 'Error: ' $_.Exception.Message }"

echo.
pause
