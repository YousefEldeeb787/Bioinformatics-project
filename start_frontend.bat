@echo off
echo ========================================
echo VF Detector - Frontend Server
echo ========================================
echo.

cd frontend

echo Checking node_modules...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo.
echo ========================================
echo Starting React development server...
echo ========================================
echo.

call npm run dev
