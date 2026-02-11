@echo off
echo ========================================
echo VF Detector - Initial Setup
echo ========================================
echo.
echo This script will set up both backend and frontend
echo.
pause

REM Backend Setup
echo.
echo [1/4] Setting up Python backend...
cd backend

if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        echo Make sure Python 3.9+ is installed
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo WARNING: Some dependencies may have failed to install
    echo Continue anyway? Press Ctrl+C to abort, or
    pause
)

echo Creating temp directories...
if not exist "temp\uploads" mkdir temp\uploads
if not exist "temp\results" mkdir temp\results

cd ..

REM Frontend Setup
echo.
echo [2/4] Setting up React frontend...
cd frontend

if not exist "node_modules\" (
    echo Installing Node dependencies (this may take a few minutes)...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install Node dependencies
        echo Make sure Node.js 18+ is installed
        pause
        exit /b 1
    )
)

cd ..

REM Check for ML model
echo.
echo [3/4] Checking for ML model...
if not exist "backend\models\rf_model.pkl" (
    echo.
    echo WARNING: ML model not found!
    echo.
    echo You need to extract the trained Random Forest model from your Colab notebook.
    echo.
    echo Steps:
    echo 1. Open your Colab notebook
    echo 2. After training the model, run:
    echo    import joblib
    echo    joblib.dump(clf, 'rf_model.pkl'^)
    echo    from google.colab import files
    echo    files.download('rf_model.pkl'^)
    echo 3. Place the downloaded file in: backend\models\rf_model.pkl
    echo.
    echo The app will work with a fallback heuristic until you add the model.
    echo.
    pause
) else (
    echo ✓ ML model found!
)

REM Check for VFDB
echo.
echo [4/4] Checking for VFDB database...
if not exist "backend\databases\vfdb\VFDB_setB_pro.fas" (
    echo.
    echo INFO: VFDB database not found (optional)
    echo.
    echo To enable full BLAST functionality:
    echo 1. Download VFDB from: http://www.mgc.ac.cn/VFs/Down/VFDB_setB_pro.fas.gz
    echo 2. Extract to: backend\databases\vfdb\
    echo 3. Run: makeblastdb -in VFDB_setB_pro.fas -dbtype prot
    echo.
    echo The app will work without it, but BLAST scores will be simulated.
    echo.
    pause
) else (
    echo ✓ VFDB database found!
)

echo.
echo ========================================
echo Setup Complete! 🎉
echo ========================================
echo.
echo To start the application:
echo 1. Run: start_backend.bat  (in one terminal)
echo 2. Run: start_frontend.bat (in another terminal)
echo 3. Open browser: http://localhost:3000
echo.
echo See CHECKLIST.md for testing steps!
echo.
pause
