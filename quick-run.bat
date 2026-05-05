@echo off
setlocal enabledelayedexpansion

set ROOT_DIR=%~dp0
cd /d %ROOT_DIR%

echo [INFO] Starting Yuki Fashion Ecosystem...

:: Check for pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set PKG_MGR=pnpm
) else (
    set PKG_MGR=npm
)

:: Start Backend in a new window
echo [1/3] Starting API (Port 5000)...
start "API Server" cmd /k "cd /d %ROOT_DIR%API && %PKG_MGR% run dev"

:: Start Admin in a new window
echo [2/3] Starting Admin Dashboard (Port 3000)...
start "Admin Dashboard" cmd /k "cd /d %ROOT_DIR%admin && %PKG_MGR% run dev"

:: Start Storefront Client in a new window
echo [3/3] Starting Storefront Client (Port 4000)...
start "Storefront Client" cmd /k "cd /d %ROOT_DIR%client && %PKG_MGR% run dev -p 4000"

echo.
echo ==========================================
echo [SUCCESS] All systems are booting up!
echo - API: http://localhost:5000
echo - Admin: http://localhost:3000
echo - Client: http://localhost:4000
echo ==========================================
pause
