def calculate_vf_score(ml_score, blast_score, signalp_score):
    """Calculate total VF score (0-6)"""
    return ml_score + blast_score + signalp_score

def classify_vf(vf_score):
    """Classify ORF based on VF score"""
    if vf_score >= 5:
        return "High-confidence VF"
    elif vf_score >= 3:
        return "Putative VF"
    elif vf_score >= 1:
        return "Low-confidence VF"
    else:
        return "Non-VF"

def get_classification_color(classification):
    """Get color for classification badge"""
    colors = {
        "High-confidence VF": "#48bb78",
        "Putative VF": "#ed8936",
        "Low-confidence VF": "#fc8181",
        "Non-VF": "#cbd5e0"
    }
    return colors.get(classification, "#718096")
