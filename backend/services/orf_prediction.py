from Bio import SeqIO
from Bio.Seq import Seq

def find_orfs(sequence, min_length=100):
    """Find ORFs in a DNA sequence (all 6 frames)"""
    orfs = []
    seq_len = len(sequence)
    
    # Check all 6 frames (3 forward + 3 reverse)
    for strand, seq in [(+1, sequence), (-1, sequence.reverse_complement())]:
        for frame in range(3):
            trans = seq[frame:].translate(to_stop=False)
            trans_str = str(trans)
            
            # Find ORFs between start and stop codons
            start = 0
            while True:
                start = trans_str.find('M', start)
                if start == -1:
                    break
                
                # Find next stop codon
                stop = start + 1
                while stop < len(trans_str) and trans_str[stop] != '*':
                    stop += 1
                
                orf_length = stop - start
                if orf_length >= min_length // 3:  # Convert to amino acids
                    orf_seq = trans_str[start:stop]
                    
                    # Calculate position in original DNA
                    dna_start = frame + start * 3
                    dna_end = frame + stop * 3
                    
                    orfs.append({
                        'sequence': orf_seq,
                        'length': len(orf_seq),
                        'strand': strand,
                        'frame': frame,
                        'start': dna_start,
                        'end': dna_end
                    })
                
                start = stop + 1
    
    return orfs

def predict_orfs(fasta_file, min_length=100):
    """Predict ORFs from FASTA genome file"""
    all_orfs = []
    contig_count = 0
    
    for record in SeqIO.parse(fasta_file, "fasta"):
        contig_count += 1
        contig_id = record.id
        
        # Find ORFs in this contig
        orfs = find_orfs(record.seq, min_length)
        
        # Add contig info to each ORF
        for idx, orf in enumerate(orfs):
            orf_id = f"{contig_id}_ORF{idx+1}"
            all_orfs.append({
                'orf_id': orf_id,
                'contig': contig_id,
                'sequence': orf['sequence'],
                'length': orf['length'],
                'strand': '+' if orf['strand'] == 1 else '-',
                'frame': orf['frame'],
                'start': orf['start'],
                'end': orf['end']
            })
    
    # Calculate statistics
    avg_length = sum(orf['length'] for orf in all_orfs) / len(all_orfs) if all_orfs else 0
    
    return {
        'num_contigs': contig_count,
        'num_orfs': len(all_orfs),
        'avg_orf_length': round(avg_length),
        'orfs': all_orfs
    }
