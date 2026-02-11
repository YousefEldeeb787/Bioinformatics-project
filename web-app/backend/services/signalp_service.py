def predict_signal_peptide(sequence, cutoff=20):
    """
    Simple heuristic-based signal peptide prediction.
    Real SignalP would require external tool installation.
    """
    if len(sequence) < cutoff:
        return {'has_signal': False, 'score': 0.0}
    
    # Get N-terminal region
    n_terminal = sequence[:cutoff]
    
    # Signal peptide characteristics:
    # 1. Hydrophobic region
    # 2. Positively charged N-terminus
    # 3. Cleavage site with small amino acids
    
    hydrophobic_aas = set('AILMFWYV')
    positive_aas = set('KR')
    small_aas = set('AGS')
    
    # Count hydrophobic residues in first 20 aa
    hydrophobic_count = sum(1 for aa in n_terminal if aa in hydrophobic_aas)
    hydrophobic_ratio = hydrophobic_count / len(n_terminal)
    
    # Check for positive charge in first 5 residues
    positive_count = sum(1 for aa in sequence[:5] if aa in positive_aas)
    
    # Check for small amino acids around position 15-20 (cleavage site)
    if len(sequence) >= 20:
        cleavage_region = sequence[15:20]
        small_count = sum(1 for aa in cleavage_region if aa in small_aas)
    else:
        small_count = 0
    
    # Calculate score (0-1)
    score = 0.0
    
    # Hydrophobic region (up to 0.5)
    if hydrophobic_ratio > 0.4:
        score += 0.5
    elif hydrophobic_ratio > 0.3:
        score += 0.3
    
    # Positive N-terminus (up to 0.3)
    if positive_count >= 2:
        score += 0.3
    elif positive_count >= 1:
        score += 0.2
    
    # Cleavage site (up to 0.2)
    if small_count >= 2:
        score += 0.2
    elif small_count >= 1:
        score += 0.1
    
    has_signal = score >= 0.5
    
    return {
        'has_signal': has_signal,
        'score': score,
        'hydrophobic_ratio': hydrophobic_ratio,
        'positive_charge': positive_count,
        'small_cleavage': small_count
    }
