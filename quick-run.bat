@echo off
setlocal

set ROOT_DIR=%~dp0
cd /d %ROOT_DIR%

:: Check if Docker containers are running
where docker >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Ensuring Docker containers are up...
    docker-compose up -d
)

echo.
echo [1/2] Starting Backend API (Integrated AI)...
start "backend" cmd /k "cd /d %ROOT_DIR%API && npm run dev"

echo [2/2] Starting Frontend Web (Next.js)...
start "admin" cmd /k "cd /d %ROOT_DIR%admin && npm run dev"

echo.
echo ==========================================
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:5000
echo  (AI is integrated into Backend)
echo ==========================================
echo.
echo [DONE] Services are starting in separate windows.
pause > nul
