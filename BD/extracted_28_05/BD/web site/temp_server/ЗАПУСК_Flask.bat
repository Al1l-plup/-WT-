@echo off
title WeldTeam Flask Server (port 5000)
cd /d "%~dp0"

set PYTHON=C:\Users\al.galimov\AppData\Local\Python\pythoncore-3.14-64\python.exe

echo.
echo  Zapusk Flask servera (Waitress, port 5000)...
echo.

%PYTHON% wsgi.py

echo.
echo  [Server ostanovlen]
pause
