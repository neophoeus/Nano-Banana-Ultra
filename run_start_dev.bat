@echo off
title Gemini Web App Starter
set "APP_DEV_PORT=22287"

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
echo Waiting 3 seconds for server to be ready...
timeout /t 3 /nobreak > nul
echo.
echo Automatically opening browser to http://localhost:%APP_DEV_PORT%/
start http://localhost:%APP_DEV_PORT%/
echo.
echo Startup process complete, closing this window...
exit