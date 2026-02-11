import subprocess
import tempfile
from pathlib import Path
from Bio import SeqIO

def run_alignment(file1_path, file2_path, alignment_type='blastn'):
    """Run sequence alignment using BLAST or MAFFT"""
    
    if alignment_type in ['blastn', 'blastp']:
        return run_blast_alignment(file1_path, file2_path, alignment_type)
    elif alignment_type == 'mafft':
        return run_mafft_alignment(file1_path, file2_path)
    else:
        raise ValueError(f"Unknown alignment type: {alignment_type}")

def run_blast_alignment(query_path, subject_path, blast_type='blastn'):
    """Run BLAST alignment between two sequences"""
    try:
        # Create BLAST database from subject
        db_path = tempfile.mktemp(suffix='_db')
        
        makedb_cmd = [
            'makeblastdb',
            '-in', subject_path,
            '-dbtype', 'nucl' if blast_type == 'blastn' else 'prot',
            '-out', db_path
        ]
        
        subprocess.run(makedb_cmd, capture_output=True, check=True, timeout=30)
        
        # Run BLAST
        output_file = tempfile.NamedTemporaryFile(delete=False, suffix='.txt')
        output_path = output_file.name
        output_file.close()
        
        blast_cmd = [
            blast_type,
            '-query', query_path,
            '-db', db_path,
            '-out', output_path,
            '-outfmt', '6 qseqid sseqid pident length mismatch gapopen qstart qend sstart send evalue bitscore',
            '-evalue', '1e-5'
        ]
        
        subprocess.run(blast_cmd, capture_output=True, check=True, timeout=60)
        
        # Parse results
        alignments = []
        with open(output_path, 'r') as f:
            for line in f:
                parts = line.strip().split('\t')
                if len(parts) >= 12:
                    alignments.append({
                        'query_id': parts[0],
                        'subject_id': parts[1],
                        'identity': float(parts[2]),
                        'alignment_length': int(parts[3]),
                        'mismatches': int(parts[4]),
                        'gaps': int(parts[5]),
                        'evalue': parts[10],
                        'bitscore': float(parts[11])
                    })
        
        # Clean up
        Path(output_path).unlink()
        for ext in ['', '.nhr', '.nin', '.nsq', '.phr', '.pin', '.psq']:
            try:
                Path(f"{db_path}{ext}").unlink()
            except:
                pass
        
        # Calculate summary statistics
        if alignments:
            avg_identity = sum(a['identity'] for a in alignments) / len(alignments)
            best_evalue = min(alignments, key=lambda x: float(x['evalue']))['evalue']
        else:
            avg_identity = 0
            best_evalue = 'N/A'
        
        return {
            'total_alignments': len(alignments),
            'avg_identity': avg_identity,
            'best_evalue': best_evalue,
            'alignments': alignments[:100]  # Limit to top 100
        }
    
    except Exception as e:
        # Return dummy data if BLAST not installed
        return {
            'total_alignments': 0,
            'avg_identity': 0,
            'best_evalue': 'N/A',
            'alignments': [],
            'error': f"BLAST not available: {str(e)}"
        }

def run_mafft_alignment(file1_path, file2_path):
    """Run MAFFT multiple sequence alignment"""
    try:
        # Combine both files into one
        combined_file = tempfile.NamedTemporaryFile(mode='w', suffix='.fasta', delete=False)
        combined_path = combined_file.name
        
        with open(file1_path, 'r') as f1, open(file2_path, 'r') as f2:
            combined_file.write(f1.read())
            combined_file.write(f2.read())
        combined_file.close()
        
        # Run MAFFT
        output_file = tempfile.NamedTemporaryFile(delete=False, suffix='.aln')
        output_path = output_file.name
        output_file.close()
        
        cmd = ['mafft', '--auto', combined_path]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        with open(output_path, 'w') as f:
            f.write(result.stdout)
        
        # Parse alignment
        records = list(SeqIO.parse(output_path, 'fasta'))
        
        # Clean up
        Path(combined_path).unlink()
        Path(output_path).unlink()
        
        return {
            'total_sequences': len(records),
            'alignment_length': len(records[0].seq) if records else 0,
            'sequences': [{'id': r.id, 'length': len(r.seq)} for r in records]
        }
    
    except Exception as e:
        return {
            'total_sequences': 0,
            'alignment_length': 0,
            'sequences': [],
            'error': f"MAFFT not available: {str(e)}"
        }
