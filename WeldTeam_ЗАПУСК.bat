@echo off
title WeldTeam Server
cd /d "%~dp0"

echo.
echo  Zapusk WeldTeam servera...
echo.

:: Sborka frontenda esli net dist
if not exist "frontend\dist\" (
    echo  [BUILD] Sobiraem frontend...
    cd frontend
    call npm run build
    cd ..
    if not exist "frontend\dist\" (
        echo.
        echo  [ERROR] Sborka ne udalas! Smotrite oshibki vyshe.
        pause
        exit /b 1
    )
    echo  [OK] Frontend sobran.
    echo.
)

:: Opredelyaem lokalnyy IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4"') do (
    set RAW_IP=%%a
)
set LOCAL_IP=%RAW_IP: =%

echo ========================================================
echo    WeldTeam Server
echo ========================================================
echo.
echo    Lokalno :  http://localhost:3001
echo    Po seti :  http://%LOCAL_IP%:3001
echo.
echo    Etot adres otpravte kollegam (ta zhe WiFi ili kabel)
echo    Dlya ostanovki zakroyte eto okno ili nazhmite Ctrl+C
echo ========================================================
echo.

set NODE_ENV=production
set PORT=3001
node backend\src\index.js

echo.
echo  [Server ostanovlen]
pause
