import subprocess
import tempfile
from pathlib import Path
from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord

def run_blast_vfdb(sequence):
    """Run BLAST against VFDB database"""
    # Check if VFDB database exists
    db_path = Path(__file__).parent.parent / 'databases' / 'vfdb' / 'VFDB_setB_pro.fas'
    
    if not db_path.exists():
        # If database doesn't exist, return dummy result
        # You'll set up VFDB later
        return {
            'has_hit': False,
            'identity': 0,
            'evalue': 1.0,
            'score': 0,
            'top_hit': None
        }
    
    try:
        # Create temporary FASTA file for query
        with tempfile.NamedTemporaryFile(mode='w', suffix='.fasta', delete=False) as query_file:
            record = SeqRecord(Seq(sequence), id="query", description="")
            SeqIO.write(record, query_file, "fasta")
            query_path = query_file.name
        
        # Run BLASTP
        output_file = tempfile.NamedTemporaryFile(delete=False, suffix='.txt')
        output_path = output_file.name
        output_file.close()
        
        cmd = [
            'blastp',
            '-query', query_path,
            '-db', str(db_path),
            '-out', output_path,
            '-outfmt', '6 qseqid sseqid pident length evalue bitscore',
            '-evalue', '1e-5',
            '-max_target_seqs', '1'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        # Parse results
        with open(output_path, 'r') as f:
            lines = f.readlines()
        
        # Clean up temp files
        Path(query_path).unlink()
        Path(output_path).unlink()
        
        if lines:
            # Parse first hit
            parts = lines[0].strip().split('\t')
            identity = float(parts[2])
            evalue = float(parts[4])
            bitscore = float(parts[5])
            
            # Score based on identity
            if identity >= 80:
                score = 3
            elif identity >= 60:
                score = 2
            elif identity >= 40:
                score = 1
            else:
                score = 0
            
            return {
                'has_hit': True,
                'identity': identity,
                'evalue': evalue,
                'bitscore': bitscore,
                'score': score,
                'top_hit': parts[1]
            }
        else:
            return {
                'has_hit': False,
                'identity': 0,
                'evalue': 1.0,
                'score': 0,
                'top_hit': None
            }
    
    except Exception as e:
        # Fallback: return dummy score
        print(f"BLAST failed: {e}")
        return {
            'has_hit': False,
            'identity': 0,
            'evalue': 1.0,
            'score': 0,
            'top_hit': None,
            'error': str(e)
        }
