@echo off
echo ====================================
echo Iniciando Proyecto Conecta...
echo ====================================

:: 1. Posicionarse en la raiz (donde vive Angular)
cd /d "%~dp0"

:: 2. Iniciar Frontend desde la raiz
echo [1/3] Levantando Frontend (Angular - Puerto 4200)...
start "Frontend - Angular" cmd /k "npm start"

:: 3. Entrar a la subcarpeta backend e iniciar Node.js
echo [2/3] Levantando Backend (Node.js - Puerto 3000)...
cd "%~dp0backend"
start "Backend - Node" cmd /k "npm start"

:: 4. Abrir pestañas en el navegador
echo [3/3] Abriendo navegador...
timeout /t 3 >nul
start http://localhost:3000
start http://localhost:4200

echo.
echo Servidores en marcha.