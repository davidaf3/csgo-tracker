# Local build script for csgo-tracker project

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $PSCommandPath

# Check if --install 
$installAfter = $false
if ($args -contains "--install") {
  $installAfter = $true
  Write-Host "Will install after build." -ForegroundColor Yellow
}

# Create function to handle errors
function Handle-Error {
  param($ErrorMessage)
  Write-Host "Error: $ErrorMessage" -ForegroundColor Red
  exit 1
}

Write-Host "Starting local build process..." -ForegroundColor Green

try {
  # Build restapi
  Write-Host "Building restapi..." -ForegroundColor Cyan
  Push-Location "$rootDir/restapi"
  npm ci
  
  # Note: Secrets handling needs to be done manually
  Write-Host "Note: You need to manually create the secrets.ts file in the restapi directory" -ForegroundColor Yellow
  
  npm run build
  Pop-Location

  # Build webapp
  Write-Host "Building webapp..." -ForegroundColor Cyan
  Push-Location "$rootDir/webapp"
  npm ci
  npm run build
  Pop-Location

  # Build electronapp
  Write-Host "Building electronapp..." -ForegroundColor Cyan
  Push-Location "$rootDir/electronapp"
  npm i
  
  # Create resources directory and copy webapp build
  if (Test-Path "resources") {
    Remove-Item "resources" -Recurse -Force
  }
  New-Item -Name "resources" -ItemType "directory" -Force
  Copy-Item -Path "$rootDir/webapp/dist/*" -Destination "resources" -Recurse

  # Build electron app
  npm run dist

  # Create bundle directory
  if (Test-Path "bundle") {
    Remove-Item "bundle" -Recurse -Force
  }
  New-Item -Name "bundle" -ItemType "directory" -Force
  
  # Copy installer and config file
  Copy-Item -Path "./dist/csgo-tracker-installer.exe" -Destination "./bundle/"
  Copy-Item -Path "$rootDir/gamestate_integration_stats.cfg" -Destination "./bundle/"

  # Create zip file
  if (Test-Path "csgo-tracker-windows.zip") {
    Remove-Item "csgo-tracker-windows.zip" -Force
  }
  
  # Check if 7z is available
  if (Get-Command "7z" -ErrorAction SilentlyContinue) {
    7z a -tzip csgo-tracker-windows.zip ./bundle/*
  } else {
    Write-Host "7z not found, using Compress-Archive instead" -ForegroundColor Yellow
    Compress-Archive -Path "./bundle/*" -DestinationPath "csgo-tracker-windows.zip"
  }
  
  Pop-Location

  Write-Host "Build completed successfully!" -ForegroundColor Green
  Write-Host "Output: $rootDir/electronapp/csgo-tracker-windows.zip" -ForegroundColor Green

  if ($installAfter) {
    Write-Host "Installing csgo-tracker..." -ForegroundColor Cyan
    Start-Process -FilePath "./electronapp/bundle/csgo-tracker-installer.exe" -Wait
    Write-Host "Installation completed!" -ForegroundColor Green
  }

} catch {
  Handle-Error $_.Exception.Message
}