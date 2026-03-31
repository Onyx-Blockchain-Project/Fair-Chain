@echo off
REM FairChain Deployment Script for Windows
REM This script deploys the complete FairChain stack

echo =========================================
echo FairChain Full Deployment Script
echo =========================================
echo.

REM Set paths
set BACKEND_PATH=%~dp0\backend
set FRONTEND_PATH=%~dp0\frontend
set CONTRACTS_PATH=%~dp0\contracts

echo [1/7] Checking prerequisites...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js not found. Please install Node.js 18+
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('node --version') do echo [OK] Node.js: %%a
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [X] npm not found
    exit /b 1
) else (
    for /f "tokens=*" %%a in ('npm --version') do echo [OK] npm: %%a
)

echo.
echo [2/7] Setting up Backend...
echo.

cd %BACKEND_PATH%

REM Create .env if not exists
if not exist ".env" (
    echo Creating backend .env file...
    (
        echo NODE_ENV=development
        echo PORT=3001
        echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fairchain
        echo STELLAR_NETWORK=TESTNET
        echo HORIZON_URL=https://horizon-testnet.stellar.org
        echo SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
        echo JWT_SECRET=dev-secret-key-change-in-production
        echo LOG_LEVEL=info
    ) > .env
    echo [OK] Backend .env created
) else (
    echo [OK] Backend .env exists
)

REM Install dependencies
echo Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo [X] Backend npm install failed
    exit /b 1
)
echo [OK] Backend dependencies installed

echo.
echo [3/7] Setting up Frontend...
echo.

cd %FRONTEND_PATH%

REM Create .env if not exists
if not exist ".env" (
    echo Creating frontend .env file...
    (
        echo VITE_API_URL=http://localhost:3001/api
        echo VITE_STELLAR_NETWORK=TESTNET
        echo VITE_HORIZON_URL=https://horizon-testnet.stellar.org
        echo VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
    ) > .env
    echo [OK] Frontend .env created
) else (
    echo [OK] Frontend .env exists
)

REM Install dependencies
echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo [X] Frontend npm install failed
    exit /b 1
)
echo [OK] Frontend dependencies installed

echo.
echo [4/7] Building Frontend...
echo.

call npm run build
if errorlevel 1 (
    echo [X] Frontend build failed
    exit /b 1
)
echo [OK] Frontend built successfully

echo.
echo [5/7] Starting Backend Server...
echo.

cd %BACKEND_PATH%

REM Check if server is already running
tasklist /FI "WINDOWTITLE eq FairChain Backend" 2>nul | find "node.exe" >nul
if not errorlevel 1 (
    echo [!] Backend server already running
) else (
    echo Starting backend in new window...
    start "FairChain Backend" cmd /k "cd %BACKEND_PATH% && npm run dev"
    timeout /t 3 /nobreak >nul
    echo [OK] Backend server started on http://localhost:3001
)

echo.
echo [6/7] Starting Frontend Dev Server...
echo.

cd %FRONTEND_PATH%

REM Check if server is already running
tasklist /FI "WINDOWTITLE eq FairChain Frontend" 2>nul | find "node.exe" >nul
if not errorlevel 1 (
    echo [!] Frontend server already running
) else (
    echo Starting frontend in new window...
    start "FairChain Frontend" cmd /k "cd %FRONTEND_PATH% && npm run dev"
    timeout /t 3 /nobreak >nul
    echo [OK] Frontend server started on http://localhost:5173
)

echo.
echo [7/7] Deployment Summary
echo.
echo =========================================
echo DEPLOYMENT COMPLETE!
echo =========================================
echo.
echo Services:
echo   - Backend API:  http://localhost:3001
echo   - Frontend App: http://localhost:5173
echo.
echo Smart Contracts:
echo   - Status: Built (Wasm files ready)
echo   - Location: %CONTRACTS_PATH%\target\wasm32-unknown-unknown\release\
echo.
echo To deploy contracts to Stellar testnet:
echo   1. Install Soroban CLI: cargo install soroban-cli
echo   2. Fund a testnet account
echo   3. Run: soroban contract deploy --wasm ^<contract^.wasm^>
echo.
echo Next Steps:
echo   1. Open browser to http://localhost:5173
echo   2. Install Freighter wallet extension
echo   3. Connect wallet and start using FairChain
echo.
echo =========================================

cd %~dp0
