# 🧬 Bioinformatics Virulence Factor Analysis Pipeline

A comprehensive bioinformatics project for analyzing and predicting virulence factors in bacterial genomes. This project combines machine learning research with a production-ready web application for genomic analysis.

## 📋 Project Overview

This repository contains two complementary components:

### 1. **Research & Analysis Pipeline** (Jupyter Notebook)
- Machine learning model development and training
- Exploratory data analysis of virulence factors
- Database preparation and feature engineering
- Model evaluation and validation

### 2. **Web Application** (`web-app/` folder)
- Interactive web interface for ORF analysis
- Real-time genome sequence processing
- Machine learning-based virulence prediction
- Integrated BLAST and alignment tools
- AI-powered chatbot for user assistance

## 🔬 Complete Analysis Pipeline

### Phase 1: Data Collection & Preparation
1. **Input Data Sources** (see `Data_links.txt`):
   - `test_sample.fna`: Genome contigs in FASTA format
   - `VF_positive_subset_final_2.faa`: Known virulence factor proteins (positive training set)
   - `VF_negative_subset_final.faa`: Non-virulence factor proteins (negative training set)
   - `vfdb_proteins.faa`: VFDB database for BLAST comparisons
   - `Pfam-A.hmm`: Pfam database for domain prediction

### Phase 2: Model Development (Notebook Analysis)
Located in `Bioinformatics_project.ipynb`:
- ORF extraction from genome sequences
- Feature extraction (sequence properties, protein domains)
- Machine learning model training (Random Forest classifier)
- Cross-validation and performance metrics
- Model export for production use

**Generated Outputs:**
- `predicted_orfs.faa`: Extracted ORF sequences
- `ORF_ML_predictions.csv`: Prediction results with probabilities
- `pfam_hits.tbl`: HMMER domain scan results
- `rf_model.pkl`: Trained ML model (exported to web app)

### Phase 3: Web Application Deployment
Located in `web-app/` folder:

**Features:**
- 🧬 **ORF Prediction**: Automated open reading frame detection
- 🤖 **ML Classification**: Virulence factor probability scoring
- 🔍 **BLAST Analysis**: Comparison against VFDB (planned feature)
- 📊 **Results Visualization**: Interactive charts and detailed reports
- 💬 **AI Chatbot**: Context-aware assistance using Groq LLM
- 📄 **Export Options**: Download results in multiple formats

**Technology Stack:**
- **Backend**: Python (FastAPI), BioPython, scikit-learn
- **Frontend**: React + Vite, modern responsive UI
- **ML Model**: Random Forest classifier trained on VFDB data
- **AI Integration**: Groq API for intelligent chat assistance

## 🚀 Getting Started

### For Research & Analysis:
```bash
# View the analysis notebook
jupyter notebook Bioinformatics_project.ipynb

# Install research dependencies
pip install -r Requirements.txt
```

### For Web Application:
```bash
cd web-app

# See detailed setup instructions
cat START_HERE.md

# Quick start
# Backend setup
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Full setup instructions are in [`web-app/START_HERE.md`](web-app/START_HERE.md)

## 📊 Project Structure

```
Bioinformatics-project/
├── README.md                          # This file - project overview
├── Bioinformatics_project.ipynb       # Research notebook & ML training
├── Requirements.txt                   # Python dependencies for research
├── Data_links.txt                     # Links to download databases
├── Project Description                # Detailed project documentation
│
└── web-app/                          # Production web application
    ├── README.md                     # Web app specific documentation
    ├── START_HERE.md                 # Setup guide for web app
    ├── SETUP.md                      # Quick setup instructions
    ├── backend/                      # FastAPI server
    │   ├── app.py                   # Main API application
    │   ├── requirements.txt         # Backend dependencies
    │   ├── models/                  # ML models (rf_model.pkl)
    │   ├── services/                # Analysis services
    │   └── databases/               # VFDB data (future)
    └── frontend/                     # React application
        ├── src/
        ├── package.json
        └── vite.config.js
```

## 🔗 Data & External Resources

Large database files are managed externally. Download links and instructions are provided in [`Data_links.txt`](Data_links.txt).

**Required Databases:**
- **VFDB** (Virulence Factor Database): Protein sequences for BLAST analysis
- **Pfam-A**: HMM profiles for protein domain prediction

**Note**: For production deployment, database integration is planned for future development phases.

## 🧪 Workflow Integration

```
┌─────────────────────────────────────────────────────────────┐
│  Research Phase (Jupyter Notebook)                          │
│  • Data exploration & preprocessing                          │
│  • Feature engineering                                       │
│  • Model training & validation                               │
│  • Export trained model → rf_model.pkl                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Production Phase (Web Application)                          │
│  • Load trained model                                        │
│  • User uploads genome FASTA                                 │
│  • ORF prediction & feature extraction                       │
│  • ML-based virulence scoring                                │
│  • Interactive results display                               │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technologies Used

**Research Pipeline:**
- Python 3.x
- Jupyter Notebook
- BioPython
- scikit-learn
- pandas, numpy
- HMMER, BLAST+

**Web Application:**
- **Backend**: Python, FastAPI, BioPython, scikit-learn
- **Frontend**: React 18, Vite, React Router
- **AI**: Groq API (LLaMA models)
- **Visualization**: Recharts, modern CSS

## 📈 Future Development

**Current Status:**
- ✅ Core ORF prediction and ML classification
- ✅ Interactive web interface
- ✅ AI-powered chatbot assistance

**Planned Enhancements:**

Future work will include secretion system classification, virulence regulation analysis, and explainable AI (XAI) to improve biological insight and model transparency.

## 👤 Author

**Yousef Eldeeb**
- GitHub: [@YousefEldeeb787](https://github.com/YousefEldeeb787)

---

**Quick Links:**
- 📓 [Analysis Notebook](Bioinformatics_project.ipynb)
- 🌐 [Web App Documentation](web-app/README.md)
- 🚀 [Setup Guide](web-app/START_HERE.md)
- 📦 [Data Sources](Data_links.txt)
