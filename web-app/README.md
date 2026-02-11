# 🧬 VF Detector - Virulence Factor Detection Platform

An interactive web platform for learning bioinformatics while detecting virulence factors in bacterial genomes.

## 🎯 Features

- **ORF Prediction**: Automatically identify open reading frames in bacterial genomes
- **ML-Based Prediction**: Random Forest model predicts virulence probability
- **BLAST Analysis**: Compare ORFs against VFDB (Virulence Factor Database)
- **Signal Peptide Detection**: Identify secreted proteins
- **Evidence-Based Scoring**: Multi-evidence VF classification (0-6 scale)
- **Interactive Visualizations**: Charts, tables, and network graphs
- **Educational Guidance**: Context-aware tooltips and chatbot assistant
- **Sequence Alignment**: Compare genomes using BLAST/MAFFT

## 📊 VF Scoring System

Each ORF receives a cumulative score from three methods:

- **Machine Learning** (0-2 points): Based on amino acid composition and hydrophobicity
- **BLAST** (0-3 points): Identity to known virulence factors in VFDB
- **SignalP** (0-1 point): Presence of secretion signals

**Classification:**
- **5-6 points**: High-confidence VF ✅
- **3-4 points**: Putative VF ⚠️
- **1-2 points**: Low-confidence VF ❓
- **0 points**: Non-VF ❌

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- NCBI BLAST+ (optional, for alignment features)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python app.py
```

Backend will run on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
Bioinformatics_app/
├── backend/
│   ├── app.py                      # FastAPI main application
│   ├── requirements.txt            # Python dependencies
│   ├── services/
│   │   ├── orf_prediction.py      # ORF finder (6-frame translation)
│   │   ├── ml_prediction.py       # Random Forest VF predictor
│   │   ├── blast_service.py       # BLAST against VFDB
│   │   ├── signalp_service.py     # Signal peptide heuristic
│   │   ├── scoring.py             # VF score calculator
│   │   └── alignment_service.py   # Sequence alignment
│   ├── models/
│   │   └── rf_model.pkl           # Trained ML model (to be added)
│   └── databases/
│       └── vfdb/                  # VFDB database (to be downloaded)
│
└── frontend/
    ├── src/
    │   ├── App.jsx                # Main React app
    │   ├── pages/
    │   │   ├── HomePage.jsx       # Upload & intro
    │   │   ├── AlignmentPage.jsx  # Sequence alignment
    │   │   ├── ORFAnalysisPage.jsx# VF analysis pipeline
    │   │   └── ResultsPage.jsx    # Results with charts
    │   └── components/
    │       ├── InfoIcon.jsx       # Educational tooltips
    │       └── Chatbot.jsx        # AI assistant
    ├── package.json
    └── vite.config.js
```

## 🔬 Usage Guide

### 1. Upload Genome
- Navigate to homepage
- Upload bacterial genome in FASTA format
- Click "Start Analysis"

### 2. ORF Prediction
- System automatically predicts ORFs (all 6 reading frames)
- View statistics: contigs, ORF count, average length

### 3. VF Scoring
- ML model predicts virulence probability
- BLAST compares against VFDB
- SignalP detects secretion signals
- Combined score determines classification

### 4. View Results
- Interactive table with filtering/sorting
- Pie charts and bar graphs
- Download results as CSV

### 5. Sequence Alignment (Optional)
- Upload two genome/protein files
- Choose BLASTN, BLASTP, or MAFFT
- View alignment statistics and identity percentages

## 🤖 Chatbot Assistant

Click the 💬 button to ask questions:
- "What is an ORF?"
- "How does BLAST scoring work?"
- "Explain signal peptides"
- "What is a virulence factor?"
- "How to interpret my results?"

## 📚 Educational Features

Every major step includes:
- 📄 **Info Icons**: Click for detailed explanations
- **Tooltips**: Hover for quick definitions
- **Interpretation Guides**: Understand what scores mean
- **Reference Links**: NCBI BLAST, VFDB, SignalP documentation

## 🔧 Advanced Setup

### VFDB Database Integration

**Status**: 🚧 In Development

Integration with the VFDB (Virulence Factor Database) for enhanced BLAST analysis is planned for future releases. The current version includes basic ORF prediction and analysis capabilities. Database integration will be added in the next development phase.

### Extract ML Model from Notebook

If you have a trained model in your Colab notebook:

```python
import joblib

# In your notebook after training
joblib.dump(clf, 'rf_model.pkl')

# Download and place in backend/models/
```

## 🐳 Docker Deployment (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📊 API Endpoints

- `POST /api/upload_genome` - Upload genome FASTA
- `POST /api/predict_orfs` - Predict ORFs
- `POST /api/vf_score` - Calculate VF scores
- `POST /api/align` - Sequence alignment
- `POST /api/chatbot` - Chatbot responses

## 🎓 Educational Use Cases

- **Bioinformatics Courses**: Teach ORF prediction, BLAST, ML concepts
- **Research Training**: Learn pathogen analysis pipelines
- **Self-Learning**: Interactive tutorials with real data
- **Lab Demonstrations**: Showcase multi-evidence VF detection

## 🔬 Scientific Background

**Why Multiple Evidence Types?**

Single prediction methods have limitations:
- **ML only**: May miss novel VFs not in training data
- **BLAST only**: Relies on existing database annotations
- **SignalP only**: Not all VFs are secreted

Combining evidence increases confidence and reduces false positives.





## 📧 Support

For questions or issues:
- Check tooltips and chatbot in the app
- Review API documentation
- Consult VFDB and BLAST manuals

---

**Built with ❤️ for bioinformatics education**
