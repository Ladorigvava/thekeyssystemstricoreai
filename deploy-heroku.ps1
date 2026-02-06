# Heroku Deployment Script for The Keys System (PowerShell)
# This script automates the deployment process to Heroku

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  The Keys System - Heroku Deploy" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Heroku CLI is installed
$herokuInstalled = Get-Command heroku -ErrorAction SilentlyContinue
if (-not $herokuInstalled) {
    Write-Host "❌ Heroku CLI not found!" -ForegroundColor Red
    Write-Host "Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
}

Write-Host "✅ Heroku CLI found" -ForegroundColor Green
Write-Host ""

# Check if logged in to Heroku
try {
    $whoami = heroku auth:whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Already logged in to Heroku" -ForegroundColor Green
    } else {
        Write-Host "🔐 Please login to Heroku..." -ForegroundColor Yellow
        heroku login
    }
} catch {
    Write-Host "🔐 Please login to Heroku..." -ForegroundColor Yellow
    heroku login
}

Write-Host ""
$appName = Read-Host "Enter your Heroku app name (or press Enter to auto-generate)"

if ([string]::IsNullOrWhiteSpace($appName)) {
    Write-Host "Creating Heroku app with auto-generated name..." -ForegroundColor Yellow
    heroku create
} else {
    Write-Host "Creating Heroku app: $appName" -ForegroundColor Yellow
    heroku create $appName
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  API Key Configuration" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need at least ONE API key. You can set all three or just one." -ForegroundColor Yellow
Write-Host ""

$hasOpenAI = Read-Host "Do you have an OpenAI API key? (y/n)"
if ($hasOpenAI -eq "y" -or $hasOpenAI -eq "Y") {
    $openaiKey = Read-Host "Enter your OpenAI API key" -AsSecureString
    $openaiKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($openaiKey))
    heroku config:set "VITE_OPENAI_API_KEY=$openaiKeyPlain"
    Write-Host "✅ OpenAI API key set" -ForegroundColor Green
}

Write-Host ""
$hasAnthropic = Read-Host "Do you have an Anthropic API key? (y/n)"
if ($hasAnthropic -eq "y" -or $hasAnthropic -eq "Y") {
    $anthropicKey = Read-Host "Enter your Anthropic API key" -AsSecureString
    $anthropicKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($anthropicKey))
    heroku config:set "VITE_ANTHROPIC_API_KEY=$anthropicKeyPlain"
    Write-Host "✅ Anthropic API key set" -ForegroundColor Green
}

Write-Host ""
$hasGoogle = Read-Host "Do you have a Google AI API key? (y/n)"
if ($hasGoogle -eq "y" -or $hasGoogle -eq "Y") {
    $googleKey = Read-Host "Enter your Google AI API key" -AsSecureString
    $googleKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($googleKey))
    heroku config:set "VITE_GOOGLE_AI_API_KEY=$googleKeyPlain"
    Write-Host "✅ Google AI API key set" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Deploying to Heroku" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Add all files
git add .

# Commit
$commitMsg = Read-Host "Enter commit message (default: 'Deploy to Heroku')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Deploy to Heroku"
}
git commit -m $commitMsg

# Push to Heroku
Write-Host "Pushing to Heroku..." -ForegroundColor Yellow
try {
    git push heroku main
} catch {
    git push heroku master
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Your app is deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "Open your app:" -ForegroundColor Yellow
Write-Host "  heroku open"
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  heroku logs --tail"
Write-Host ""
Write-Host "Check status:" -ForegroundColor Yellow
Write-Host "  heroku ps"
Write-Host ""
Write-Host "View config:" -ForegroundColor Yellow
Write-Host "  heroku config"
Write-Host ""
