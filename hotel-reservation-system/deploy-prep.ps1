# ============================================================
#  deploy-prep.ps1  —  Team-6 Hotel Reservation System
#  Run this ONCE from the hotel-reservation-system folder:
#      cd hotel-reservation-system
#      .\deploy-prep.ps1
# ============================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Team-6 Hotel Reservation — Deploy Prep   " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git is not installed." -ForegroundColor Red
    Write-Host "  Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Git found: $(git --version)" -ForegroundColor Green

# 2. Build the frontend
Write-Host ""
Write-Host "[STEP 1] Building frontend for production..." -ForegroundColor Cyan
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend build failed." -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "[OK] Frontend built successfully." -ForegroundColor Green
Set-Location ..

# 3. Remove node_modules from git tracking (keep them locally)
Write-Host ""
Write-Host "[STEP 2] Ensuring node_modules are ignored..." -ForegroundColor Cyan
if (-not (Test-Path ".gitignore")) {
    "node_modules/`n.env`ndist/" | Out-File -FilePath ".gitignore" -Encoding utf8
}
Write-Host "[OK] .gitignore is in place." -ForegroundColor Green

# 4. Git init & first commit
Write-Host ""
Write-Host "[STEP 3] Initializing Git repository..." -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    git init
    Write-Host "[OK] Git repo initialized." -ForegroundColor Green
} else {
    Write-Host "[OK] Git repo already exists." -ForegroundColor Green
}

git add .
git commit -m "feat: Team-6 Grand Heritage Hotel Reservation System — full MERN stack"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  DONE! Git commit created.                " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create a NEW repo on GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Cyan
Write-Host "   Name it: hotel-reservation-system" -ForegroundColor White
Write-Host "   Keep it PUBLIC (free hosting requires public repo)" -ForegroundColor White
Write-Host ""
Write-Host "2. Push your code (replace YOUR_USERNAME):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/hotel-reservation-system.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Follow DEPLOY-GUIDE.md for Render + Vercel steps." -ForegroundColor White
Write-Host ""
