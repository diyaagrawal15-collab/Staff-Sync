@echo off
echo ========================================================
echo  🚀 Starting HRM Enterprise System (Full-Stack MERN)
echo ========================================================
echo.
echo Running backend on port 5000...
echo Serving compiled React frontend at http://localhost:5000
echo.
cd /d "%~dp0backend"
node server.js
pause
