@echo off
echo ========================================
echo VF Detector - Backend Server
echo ========================================
echo.

cd backend

echo Checking virtual environment...
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt -q

echo Creating temp directories...
if not exist "temp\uploads" mkdir temp\uploads
if not exist "temp\results" mkdir temp\results

echo.
echo ========================================
echo Starting FastAPI server on port 8000...
echo ========================================
echo.

python app.py
