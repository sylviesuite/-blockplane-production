# BlockPlane Revit Plugin - Installer Build Script
# This script builds the MSI installer package

param(
    [string]$Configuration = "Release",
    [string]$Platform = "x64",
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

# Paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$installerDir = Split-Path -Parent $scriptDir
$solutionDir = Split-Path -Parent $installerDir
$pluginProject = Join-Path $solutionDir "RevitPlugin\BlockPlane.RevitPlugin.csproj"
$installerProject = Join-Path $installerDir "BlockPlane.Installer.wixproj"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BlockPlane Installer Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check for MSBuild
$msbuild = & "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe" `
    -latest -requires Microsoft.Component.MSBuild -find MSBuild\**\Bin\MSBuild.exe `
    -prerelease | Select-Object -First 1

if (-not $msbuild) {
    Write-Error "MSBuild not found. Please install Visual Studio 2019 or later."
    exit 1
}

Write-Host "Found MSBuild: $msbuild" -ForegroundColor Green

# Check for WiX Toolset
$wixPath = "${env:ProgramFiles(x86)}\WiX Toolset v3.11\bin"
if (-not (Test-Path $wixPath)) {
    Write-Error "WiX Toolset v3.11 not found. Please install from https://wixtoolset.org/"
    exit 1
}

Write-Host "Found WiX Toolset: $wixPath" -ForegroundColor Green
Write-Host ""

# Clean if requested
if ($Clean) {
    Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
    
    $pluginBin = Join-Path $solutionDir "RevitPlugin\bin"
    $pluginObj = Join-Path $solutionDir "RevitPlugin\obj"
    $installerBin = Join-Path $installerDir "bin"
    $installerObj = Join-Path $installerDir "obj"
    
    Remove-Item -Path $pluginBin -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $pluginObj -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $installerBin -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $installerObj -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "Clean complete." -ForegroundColor Green
    Write-Host ""
}

# Build plugin
Write-Host "Building plugin project..." -ForegroundColor Yellow
& $msbuild $pluginProject /p:Configuration=$Configuration /p:Platform=AnyCPU /v:minimal

if ($LASTEXITCODE -ne 0) {
    Write-Error "Plugin build failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Plugin build complete." -ForegroundColor Green
Write-Host ""

# Verify plugin DLL exists
$pluginDll = Join-Path $solutionDir "RevitPlugin\bin\$Configuration\BlockPlane.RevitPlugin.dll"
if (-not (Test-Path $pluginDll)) {
    Write-Error "Plugin DLL not found at: $pluginDll"
    exit 1
}

Write-Host "Plugin DLL verified: $pluginDll" -ForegroundColor Green
Write-Host ""

# Build installer
Write-Host "Building installer..." -ForegroundColor Yellow
& $msbuild $installerProject /p:Configuration=$Configuration /p:Platform=$Platform /v:minimal

if ($LASTEXITCODE -ne 0) {
    Write-Error "Installer build failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Installer build complete." -ForegroundColor Green
Write-Host ""

# Verify MSI exists
$msiPath = Join-Path $installerDir "bin\$Configuration\BlockPlane.Installer.msi"
if (-not (Test-Path $msiPath)) {
    Write-Error "MSI not found at: $msiPath"
    exit 1
}

# Get MSI file info
$msiInfo = Get-Item $msiPath
$msiSize = [math]::Round($msiInfo.Length / 1MB, 2)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MSI Location: $msiPath" -ForegroundColor Green
Write-Host "MSI Size: $msiSize MB" -ForegroundColor Green
Write-Host "Configuration: $Configuration" -ForegroundColor Green
Write-Host "Platform: $Platform" -ForegroundColor Green
Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host ""

# Optional: Open output folder
$openFolder = Read-Host "Open output folder? (Y/N)"
if ($openFolder -eq "Y" -or $openFolder -eq "y") {
    Start-Process (Split-Path $msiPath)
}
