from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import shutil
from pathlib import Path
import uuid

from services.orf_prediction import predict_orfs
from services.ml_prediction import predict_vf_ml
from services.blast_service import run_blast_vfdb
from services.signalp_service import predict_signal_peptide
from services.scoring import calculate_vf_score, classify_vf
from services.alignment_service import run_alignment

app = FastAPI(title="VF Detector API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directories
UPLOAD_DIR = Path("temp/uploads")
RESULTS_DIR = Path("temp/results")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "VF Detector API is running", "version": "1.0.0"}

@app.post("/api/upload_genome")
async def upload_genome(file: UploadFile = File(...)):
    """Upload genome FASTA file"""
    if not file.filename.endswith(('.fasta', '.fa', '.fna')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a FASTA file.")
    
    # Generate unique file ID
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"
    
    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"message": "File uploaded successfully", "file_id": file_id, "filename": file.filename}

@app.post("/api/predict_orfs")
async def predict_orfs_endpoint(file: UploadFile = File(...)):
    """Predict ORFs from genome file"""
    try:
        # Save temp file
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}.fasta"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Predict ORFs
        orfs_result = predict_orfs(str(file_path))
        
        # Clean up
        os.remove(file_path)
        
        return orfs_result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ORF prediction failed: {str(e)}")

@app.post("/api/vf_score")
async def calculate_vf_scores(data: dict):
    """Calculate VF scores for predicted ORFs"""
    try:
        orfs = data.get('orfs', [])
        
        if not orfs:
            raise HTTPException(status_code=400, detail="No ORFs provided")
        
        results = []
        
        for orf in orfs:
            orf_id = orf['orf_id']
            sequence = orf['sequence']
            
            # ML Prediction
            ml_result = predict_vf_ml(sequence)
            ml_score = 2 if ml_result['probability'] >= 0.7 else (1 if ml_result['probability'] >= 0.5 else 0)
            
            # BLAST (simulated for now - you'll need VFDB setup)
            blast_result = run_blast_vfdb(sequence)
            blast_score = blast_result['score']
            
            # SignalP
            signalp_result = predict_signal_peptide(sequence)
            signalp_score = 1 if signalp_result['has_signal'] else 0
            
            # Calculate total VF score
            vf_score = ml_score + blast_score + signalp_score
            classification = classify_vf(vf_score)
            
            results.append({
                'orf_id': orf_id,
                'vf_score': vf_score,
                'classification': classification,
                'ml_score': ml_score,
                'ml_probability': ml_result['probability'],
                'blast_score': blast_score,
                'blast_identity': blast_result.get('identity', 0),
                'signalp_score': signalp_score,
                'length': len(sequence)
            })
        
        return {'orfs': results, 'total': len(results)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"VF scoring failed: {str(e)}")

@app.post("/api/align")
async def align_sequences(file1: UploadFile = File(...), file2: UploadFile = File(...), alignment_type: str = "clustalo"):
    """Perform sequence alignment using external APIs (EBI, NCBI)"""
    from services.alignment_service_api import run_alignment as run_api_alignment
    
    try:
        # Save temp files
        file1_path = UPLOAD_DIR / f"align1_{uuid.uuid4()}.fasta"
        file2_path = UPLOAD_DIR / f"align2_{uuid.uuid4()}.fasta"
        
        with open(file1_path, "wb") as buffer:
            shutil.copyfileobj(file1.file, buffer)
        
        with open(file2_path, "wb") as buffer:
            shutil.copyfileobj(file2.file, buffer)
        
        # Run alignment using external API
        result = await run_api_alignment(str(file1_path), str(file2_path), alignment_type)
        
        # Clean up
        os.remove(file1_path)
        os.remove(file2_path)
        
        return result
    
    except Exception as e:
        # Fallback to local alignment if API fails
        try:
            from services.alignment_service import run_alignment as run_local_alignment
            result = run_local_alignment(str(file1_path), str(file2_path), alignment_type)
            return result
        except:
            raise HTTPException(status_code=500, detail=f"Alignment failed: {str(e)}")

@app.post("/api/chatbot")
async def chatbot_response(data: dict):
    """Universal AI chatbot assistant - can answer ANY question"""
    from services.chatbot_service import get_ai_response
    
    message = data.get('message', '')
    history = data.get('history', [])
    
    try:
        # Get AI response with conversation history
        response = await get_ai_response(message, history)
        return {'response': response}
    except Exception as e:
        # Return error message with setup instructions
        return {'response': f"Error: {str(e)}\n\nPlease check your API key configuration in the .env file."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
