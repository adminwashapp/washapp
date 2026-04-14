# reset-cache.ps1 - A utiliser a la place de desinstaller/reinstaller Expo
# Usage: .\reset-cache.ps1 client   OU   .\reset-cache.ps1 washer

param([string]$app = "client")

$base = "C:\Users\CELLIER\.verdent\verdent-projects\new-project-2a8b0cd9\Washapp"
$dir  = if ($app -eq "washer") { "$base\mobile-washer" } else { "$base\mobile-client" }

Write-Host "=== Reset cache $app ===" -ForegroundColor Cyan
Set-Location $dir

Write-Host "1. Nettoyage cache Metro..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$env:TEMP\metro-*"          -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$dir\.expo"                  -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$dir\node_modules\.cache"   -ErrorAction SilentlyContinue

Write-Host "2. Nettoyage cache npm..." -ForegroundColor Yellow
npm cache clean --force 2>$null

Write-Host "3. Demarrage avec cache vide..." -ForegroundColor Green
npx expo start --clear