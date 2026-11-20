@echo off
echo ============================================
echo    SalesSphere CRM - Startup Script
echo ============================================
echo.

echo [1/3] Building frontend (latest changes)...
cd /d "%~dp0frontend"
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Frontend build failed! Check for errors above.
    pause
    exit /b 1
)
echo Frontend build complete!
echo.

echo [2/3] Stopping any existing server...
call C:\Users\A.RAJANEESH\AppData\Roaming\npm\pm2.cmd delete salessphere-crm 2>nul
timeout /t 2 /nobreak >nul

echo [3/3] Starting backend server with PM2 (runs in background)...
cd /d "%~dp0backend"
call C:\Users\A.RAJANEESH\AppData\Roaming\npm\pm2.cmd start server.js --name "salessphere-crm"
call C:\Users\A.RAJANEESH\AppData\Roaming\npm\pm2.cmd save

echo.
echo ============================================
echo  App is running at: http://localhost:5000
echo  Server runs in BACKGROUND - stays alive
echo    even after closing this window!
echo  Password reset links will always work.
echo.
echo  To check status: pm2 list
echo  To view logs:    pm2 logs salessphere-crm
echo  To stop server:  pm2 delete salessphere-crm
echo ============================================
echo.
pause
