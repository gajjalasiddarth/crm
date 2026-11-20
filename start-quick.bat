@echo off
echo ============================================
echo    SalesSphere CRM - Quick Start
echo ============================================
echo.
echo Starting backend server with PM2 (background)...
call C:\Users\A.RAJANEESH\AppData\Roaming\npm\pm2.cmd delete salessphere-crm 2>nul
timeout /t 1 /nobreak >nul

cd /d "%~dp0backend"
call C:\Users\A.RAJANEESH\AppData\Roaming\npm\pm2.cmd start server.js --name "salessphere-crm"
call C:\Users\A.RAJANEESH\AppData\Roaming\npm\pm2.cmd save

echo.
echo ============================================
echo  App is running at: http://localhost:5000
echo  Server runs in BACKGROUND permanently!
echo  You can close this window safely.
echo.
echo  To stop: pm2 delete salessphere-crm
echo ============================================
echo.
start http://localhost:5000
pause
