# Quick Setup Instructions

## Step 1: Backend Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create temp directories
mkdir temp\uploads
mkdir temp\results

# Run server
python app.py
```

## Step 2: Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Step 3: Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Optional: Database Integration

**Status**: 🚧 Planned for Next Development Phase

Full BLAST functionality with VFDB (Virulence Factor Database) integration is currently under development and will be available in future releases. The application currently provides core ORF prediction and analysis features.

## Next Steps

1. **Extract ML Model**: Run your Colab notebook and save the trained model as `backend/models/rf_model.pkl`
2. **Test Upload**: Try uploading a small FASTA file
3. **Explore Features**: Click info icons (📄) to learn as you go
4. **Use Chatbot**: Click 💬 for assistance

## Troubleshooting

- **Port already in use**: Change ports in vite.config.js (frontend) or app.py (backend)
- **BLAST not found**: App will work without it, just with limited BLAST scoring
- **Model not found**: ML prediction will use fallback heuristic until you add the trained model
