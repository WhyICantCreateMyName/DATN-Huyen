@echo off
setlocal enabledelayedexpansion

set ROOT_DIR=%~dp0
cd /d %ROOT_DIR%

:: Check for pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set PKG_MGR=pnpm
) else (
    set PKG_MGR=npm
)
echo [INFO] Using %PKG_MGR% as package manager.

:: Start Docker
where docker >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [1/5] Starting Docker containers...
    docker-compose up -d
) else (
    echo [SKIP] Docker not found. Make sure Postgres/Qdrant are running.
)

echo.
echo [2/5] Installing Backend (API) dependencies...
cd /d %ROOT_DIR%API
call %PKG_MGR% install

echo.
echo [3/5] Running Prisma Migrations...
call npx prisma generate
call npx prisma db push

echo.
echo [4/5] Installing Admin dependencies...
cd /d %ROOT_DIR%admin
call %PKG_MGR% install

echo.
echo [5/5] Installing Storefront Client dependencies...
cd /d %ROOT_DIR%client
call %PKG_MGR% install

echo.
echo ==========================================
echo [SUCCESS] Setup completed!
echo You can now run the project using quick-run.bat
echo ==========================================
pause
