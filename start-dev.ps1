# News Portal Development Server Starter
# Run: .\start-dev.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "News Portal - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (-not (Test-Path "news-cms")) {
    Write-Host "❌ Error: Run this from News-Portal root directory" -ForegroundColor Red
    Write-Host "Expected: c:\laragon\www\News-Portal" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Starting backend and frontend servers..." -ForegroundColor Green
Write-Host ""

# Start backend
Write-Host "[1/2] Starting Laravel Backend on http://127.0.0.1:8010" -ForegroundColor Yellow
$backendJob = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd news-cms && php artisan serve --port=8010 --host=127.0.0.1" -WindowStyle Normal -PassThru

Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend
Write-Host "[2/2] Starting Next.js Frontend on http://localhost:3000" -ForegroundColor Yellow
$frontendJob = Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd frontend && npm run dev" -WindowStyle Normal -PassThru

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Servers starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Backend:  http://127.0.0.1:8010" -ForegroundColor Cyan
Write-Host "🔗 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Wait 10-15 seconds for both to fully start" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Both servers are running in separate windows" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to close this window"
