import numpy as np
import joblib
from pathlib import Path

# Amino acid properties
AMINO_ACIDS = 'ACDEFGHIKLMNPQRSTVWY'
HYDROPHOBIC = set('AILMFWYV')

def calculate_features(sequence):
    """Calculate amino acid composition and hydrophobicity"""
    seq_len = len(sequence)
    
    if seq_len == 0:
        return np.zeros(21)  # 20 AA + 1 hydrophobic ratio
    
    # AA composition (20 features)
    aa_comp = []
    for aa in AMINO_ACIDS:
        count = sequence.count(aa)
        aa_comp.append(count / seq_len)
    
    # Hydrophobic ratio (1 feature)
    hydrophobic_count = sum(1 for aa in sequence if aa in HYDROPHOBIC)
    hydrophobic_ratio = hydrophobic_count / seq_len
    
    features = aa_comp + [hydrophobic_ratio]
    return np.array(features).reshape(1, -1)

def predict_vf_ml(sequence):
    """Predict virulence factor using ML model"""
    # Load model (you'll save this from your notebook)
    model_path = Path(__file__).parent.parent / 'models' / 'rf_model.pkl'
    
    if not model_path.exists():
        # If model doesn't exist yet, return dummy prediction
        # You'll replace this after extracting model from notebook
        return {
            'prediction': 1,
            'probability': 0.65,
            'features': None
        }
    
    try:
        model = joblib.load(model_path)
        features = calculate_features(sequence)
        
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]  # Probability of VF class
        
        return {
            'prediction': int(prediction),
            'probability': float(probability),
            'features': features.tolist()[0]
        }
    
    except Exception as e:
        # Fallback to heuristic if model fails
        features = calculate_features(sequence)
        hydrophobic_ratio = features[0][-1]
        
        # Simple heuristic: high hydrophobic ratio suggests membrane/secreted protein
        probability = min(hydrophobic_ratio + 0.3, 0.9)
        
        return {
            'prediction': 1 if probability > 0.5 else 0,
            'probability': float(probability),
            'features': None
        }
