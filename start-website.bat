@echo off
title Premium Wedding Invitation Studio
cd /d "%~dp0"
echo.
echo ===============================================
echo   Premium Wedding Invitation Studio
echo ===============================================
echo.
echo Installing dependencies if needed...
call npm install
if errorlevel 1 (
  echo.
  echo npm install failed. Please check Node.js/npm installation.
  pause
  exit /b 1
)
echo.
echo Starting frontend and backend...
echo Open this URL in your browser: http://localhost:5173
echo.
start "Wedding Studio" "http://localhost:5173"
call npm run dev
pause