@echo off
echo ========================================================
echo  🧪 Running HRM Automated Test Suite (18 Tests)
echo ========================================================
echo.
cd /d "%~dp0backend"
node tests/run-tests.js
pause
