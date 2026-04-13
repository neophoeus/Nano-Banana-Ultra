@echo off
title Gemini Web App Starter
set "APP_DEV_PORT=22287"
set "APP_DEV_URL=http://127.0.0.1:%APP_DEV_PORT%/"
set "APP_HEALTH_URL=%APP_DEV_URL%api/health"

if not exist "node_modules" (
    echo.
    echo Warning: Project dependencies not found. Please run install.bat or execute npm install manually first.
    pause
    goto :eof
)
echo.
echo =======================================================
echo Starting the development server... (Key will be read from .env.local)
echo The server window will pop up separately. Do not close that window.
echo =======================================================
start "Server" cmd /k "set APP_DEV_PORT=%APP_DEV_PORT% && npm run dev"
echo.
echo Waiting for local health check to become ready...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(30); $url='%APP_HEALTH_URL%'; do { try { $response=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 2; if ($response.StatusCode -eq 200) { exit 0 } } catch { Start-Sleep -Milliseconds 750 } } while ((Get-Date) -lt $deadline); exit 1"
if errorlevel 1 (
    echo.
    echo Warning: Local health check did not respond within 30 seconds.
    echo You can still open the app manually after the server finishes compiling:
    echo   %APP_DEV_URL%
    pause
    goto :eof
)
echo.
echo Automatically opening browser to %APP_DEV_URL%
start %APP_DEV_URL%
echo.
echo Startup process complete, closing this window...
exit