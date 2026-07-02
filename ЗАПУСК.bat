@echo off
title WeldTeam MES (Waitress, port 5000)
cd /d "%~dp0"
chcp 65001 >nul

rem Используем виртуальное окружение, если оно создано; иначе системный Python (py -3).
if exist ".venv\Scripts\python.exe" (
    set "PY=.venv\Scripts\python.exe"
) else (
    set "PY=py -3"
)

echo.
echo  Zapusk WeldTeam MES (Waitress, port 5000)...
echo.

%PY% wsgi.py

echo.
echo  [Server ostanovlen]
pause
