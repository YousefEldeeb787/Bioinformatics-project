"""
Enhanced Alignment Service using External APIs

Supports:
1. EBI EMBL-EBI Web Services (EMBOSS, Clustal Omega, MAFFT)
2. NCBI BLAST API
3. Local BLAST (if installed)
"""

import requests
import aiohttp
import asyncio
import time
from pathlib import Path
from Bio import SeqIO
from typing import Dict, List, Optional

# API endpoints
EBI_BASE_URL = "https://www.ebi.ac.uk/Tools/services/rest"
NCBI_BLAST_URL = "https://blast.ncbi.nlm.nih.gov/Blast.cgi"


async def run_alignment(file1_path: str, file2_path: str, alignment_type: str = "clustalo") -> Dict:
    """
    Run sequence alignment using external APIs
    
    Args:
        file1_path: Path to first FASTA file (query)
        file2_path: Path to second FASTA file (subject)
        alignment_type: Type of alignment (clustalo, mafft, blastn, blastp)
    
    Returns:
        Dictionary with alignment results
    """
    
    # Read sequences
    try:
        seq1 = list(SeqIO.parse(file1_path, "fasta"))
        seq2 = list(SeqIO.parse(file2_path, "fasta"))
    except Exception as e:
        return {
            'success': False,
            'error': f"Failed to read FASTA files: {str(e)}",
            'alignment_type': alignment_type
        }
    
    # Determine if protein or nucleotide
    is_protein = alignment_type in ['blastp', 'clustalo']
    
    # Route to appropriate alignment method
    if alignment_type in ['clustalo', 'mafft']:
        return await run_ebi_msa(seq1, seq2, alignment_type)
    elif alignment_type in ['blastn', 'blastp']:
        return await run_ncbi_blast_api(seq1, seq2, alignment_type)
    else:
        return {
            'success': False,
            'error': f"Unknown alignment type: {alignment_type}",
            'alignment_type': alignment_type
        }


async def run_ebi_msa(seq1: List, seq2: List, tool: str = "clustalo") -> Dict:
    """
    Run Multiple Sequence Alignment using EBI EMBL services
    
    Uses Clustal Omega or MAFFT via EBI REST API
    """
    
    try:
        # Combine sequences
        all_seqs = seq1 + seq2
        
        # Format sequences
        sequences = "\\n".join([f">{s.id}\\n{str(s.seq)}" for s in all_seqs])
        
        # Submit job to EBI
        submit_url = f"{EBI_BASE_URL}/{tool}/run"
        
        data = {
            'email': 'vfdetector@example.com',  # Required by EBI
            'sequence': sequences,
            'stype': 'protein' if tool == 'clustalo' else 'dna',
            'outfmt': 'clustal'
        }
        
        async with aiohttp.ClientSession() as session:
            # Submit job
            async with session.post(submit_url, data=data) as response:
                if response.status != 200:
                    return {
                        'success': False,
                        'error': f"EBI API submission failed: {response.status}",
                        'alignment_type': tool
                    }
                
                job_id = await response.text()
            
            # Poll for results (max 60 seconds)
            status_url = f"{EBI_BASE_URL}/{tool}/status/{job_id}"
            result_url = f"{EBI_BASE_URL}/{tool}/result/{job_id}/aln-clustal_num"
            
            for i in range(30):  # Poll for 60 seconds
                await asyncio.sleep(2)
                
                async with session.get(status_url) as status_response:
                    status = await status_response.text()
                    
                    if status == 'FINISHED':
                        # Get results
                        async with session.get(result_url) as result_response:
                            alignment_text = await result_response.text()
                            
                            return {
                                'success': True,
                                'alignment_type': tool,
                                'alignment': alignment_text,
                                'identity': calculate_identity_from_alignment(alignment_text),
                                'num_sequences': len(all_seqs),
                                'job_id': job_id
                            }
                    
                    elif status == 'FAILURE' or status == 'ERROR':
                        return {
                            'success': False,
                            'error': f"EBI job failed with status: {status}",
                            'alignment_type': tool,
                            'job_id': job_id
                        }
            
            # Timeout
            return {
                'success': False,
                'error': "Alignment timeout (>60 seconds)",
                'alignment_type': tool,
                'job_id': job_id
            }
    
    except Exception as e:
        return {
            'success': False,
            'error': f"EBI alignment error: {str(e)}",
            'alignment_type': tool
        }


async def run_ncbi_blast_api(seq1: List, seq2: List, blast_type: str = "blastn") -> Dict:
    """
    Run BLAST using NCBI's public API
    
    Note: NCBI API has rate limits and may be slow
    """
    
    try:
        query_seq = str(seq1[0].seq)
        
        # Submit BLAST search
        params = {
            'CMD': 'Put',
            'PROGRAM': blast_type,
            'DATABASE': 'nt' if blast_type == 'blastn' else 'nr',
            'QUERY': query_seq,
            'FORMAT_TYPE': 'XML'
        }
        
        async with aiohttp.ClientSession() as session:
            # Submit job
            async with session.post(NCBI_BLAST_URL, data=params) as response:
                result_text = await response.text()
                
                # Extract RID (request ID)
                import re
                rid_match = re.search(r'RID = ([A-Z0-9]+)', result_text)
                if not rid_match:
                    return {
                        'success': False,
                        'error': "Failed to get BLAST job ID",
                        'alignment_type': blast_type
                    }
                
                rid = rid_match.group(1)
            
            # Wait for results
            check_params = {
                'CMD': 'Get',
                'FORMAT_TYPE': 'XML',
                'RID': rid
            }
            
            for i in range(30):  # Poll for results
                await asyncio.sleep(5)
                
                async with session.get(NCBI_BLAST_URL, params=check_params) as check_response:
                    result = await check_response.text()
                    
                    if 'Status=READY' in result:
                        # Parse results
                        return {
                            'success': True,
                            'alignment_type': blast_type,
                            'results': result,
                            'identity': 'See BLAST output',
                            'rid': rid
                        }
                    
                    elif 'Status=FAILURE' in result:
                        return {
                            'success': False,
                            'error': "BLAST search failed",
                            'alignment_type': blast_type,
                            'rid': rid
                        }
            
            return {
                'success': False,
                'error': "BLAST timeout",
                'alignment_type': blast_type,
                'rid': rid
            }
    
    except Exception as e:
        return {
            'success': False,
            'error': f"NCBI BLAST error: {str(e)}",
            'alignment_type': blast_type
        }


def calculate_identity_from_alignment(alignment_text: str) -> float:
    """
    Calculate percent identity from Clustal alignment
    """
    try:
        lines = alignment_text.split('\\n')
        
        # Find alignment lines (skip header)
        seq_lines = {}
        for line in lines:
            if line.strip() and not line.startswith('CLUSTAL') and not line.startswith(' '):
                parts = line.split()
                if len(parts) >= 2:
                    seq_id = parts[0]
                    seq_part = parts[1]
                    
                    if seq_id not in seq_lines:
                        seq_lines[seq_id] = []
                    seq_lines[seq_id].append(seq_part)
        
        # Concatenate sequences
        seqs = {k: ''.join(v) for k, v in seq_lines.items()}
        
        if len(seqs) < 2:
            return 0.0
        
        # Compare first two sequences
        seq_ids = list(seqs.keys())[:2]
        seq1 = seqs[seq_ids[0]]
        seq2 = seqs[seq_ids[1]]
        
        # Count matches
        matches = sum(1 for a, b in zip(seq1, seq2) if a == b and a != '-')
        total = min(len(seq1.replace('-', '')), len(seq2.replace('-', '')))
        
        if total == 0:
            return 0.0
        
        return round((matches / total) * 100, 2)
    
    except Exception:
        return 0.0


# Fallback: Simple pairwise alignment (if APIs fail)
def simple_pairwise_alignment(seq1: str, seq2: str) -> Dict:
    """
    Simple local alignment fallback using built-in tools
    """
    from Bio import pairwise2
    from Bio.pairwise2 import format_alignment
    
    try:
        # Perform alignment
        alignments = pairwise2.align.globalxx(seq1, seq2)
        
        if not alignments:
            return {
                'success': False,
                'error': "No alignment found"
            }
        
        best = alignments[0]
        
        # Calculate identity
        matches = sum(1 for a, b in zip(best.seqA, best.seqB) if a == b and a != '-')
        length = len(best.seqA.replace('-', ''))
        identity = (matches / length * 100) if length > 0 else 0
        
        return {
            'success': True,
            'alignment_type': 'pairwise',
            'identity': round(identity, 2),
            'score': best.score,
            'alignment': format_alignment(*best)
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': f"Pairwise alignment failed: {str(e)}"
        }
