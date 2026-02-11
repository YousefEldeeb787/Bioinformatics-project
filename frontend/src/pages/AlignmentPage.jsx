import React, { useState } from 'react'
import axios from 'axios'
import InfoIcon from '../components/InfoIcon'

function AlignmentPage() {
  const [file1, setFile1] = useState(null)
  const [file2, setFile2] = useState(null)
  const [alignmentType, setAlignmentType] = useState('clustalo')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleAlign = async () => {
    if (!file1 || !file2) {
      alert('Please upload both files')
      return
    }
    
    setLoading(true)
    const formData = new FormData()
    formData.append('file1', file1)
    formData.append('file2', file2)
    formData.append('alignment_type', alignmentType)
    
    try {
      const response = await axios.post('/api/align', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResults(response.data)
    } catch (error) {
      alert('Alignment failed: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          🧬 Sequence Alignment
          <InfoIcon 
            title="What is Sequence Alignment?"
            content="Sequence alignment compares two or more sequences to identify regions of similarity. These similarities may indicate functional, structural, or evolutionary relationships. BLAST (Basic Local Alignment Search Tool) finds regions of local similarity, while MAFFT performs multiple sequence alignment."
          />
        </h1>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          Compare two genome or protein sequences to find similarities and relationships
        </p>
        
        <div style={{ background: '#fff5f5', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', borderLeft: '4px solid #fc8181' }}>
          <strong>💡 Learning Tip:</strong> High identity (&gt;80%) suggests sequences are closely related. 
          Low identity but high alignment coverage may indicate conserved functional domains.
        </div>
      </div>

      <div className="card">
        <h2>📁 Upload Sequences</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Sequence 1
              <InfoIcon 
                title="Query Sequence"
                content="The first sequence (query) will be compared against the second sequence (subject). For BLAST, the query is typically the sequence you want to analyze."
              />
            </label>
            <input 
              type="file" 
              accept=".fasta,.fa,.faa,.fna"
              onChange={(e) => setFile1(e.target.files[0])}
              style={{ 
                display: 'block', 
                width: '100%', 
                padding: '0.75rem', 
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            />
            {file1 && (
              <p style={{ marginTop: '0.5rem', color: '#48bb78', fontSize: '0.9rem' }}>
                ✓ {file1.name} ({(file1.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Sequence 2
              <InfoIcon 
                title="Subject Sequence"
                content="The second sequence (subject) will be compared against the query. This could be another genome, a database sequence, or a reference sequence."
              />
            </label>
            <input 
              type="file" 
              accept=".fasta,.fa,.faa,.fna"
              onChange={(e) => setFile2(e.target.files[0])}
              style={{ 
                display: 'block', 
                width: '100%', 
                padding: '0.75rem', 
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            />
            {file2 && (
              <p style={{ marginTop: '0.5rem', color: '#48bb78', fontSize: '0.9rem' }}>
                ✓ {file2.name} ({(file2.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
            Alignment Method 🌐
            <InfoIcon 
              title="Alignment Methods"
              content={`
                • Clustal Omega: Industry-standard protein MSA (via EBI API)
                • MAFFT: Fast multiple sequence alignment (via EBI API)
                • BLASTN: Nucleotide similarity search (via NCBI API)
                • BLASTP: Protein similarity search (via NCBI API)
                
                Note: Uses professional APIs - no local BLAST needed!
              `}
            />
          </label>
          <select 
            value={alignmentType}
            onChange={(e) => setAlignmentType(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value="clustalo">🧬 Clustal Omega (Protein MSA via EBI)</option>
            <option value="mafft">⚡ MAFFT (Fast MSA via EBI)</option>
            <option value="blastn">🔍 BLASTN (Nucleotide via NCBI)</option>
            <option value="blastp">🔬 BLASTP (Protein via NCBI)</option>
          </select>
          <p style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.5rem' }}>
            💡 Alignment runs on cloud servers - may take 10-60 seconds
          </p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={handleAlign}
          disabled={!file1 || !file2 || loading}
          style={{ marginTop: '2rem', width: '100%', fontSize: '1.1rem' }}
        >
          {loading ? '⏳ Aligning...' : '🔬 Run Alignment'}
        </button>
      </div>

      {loading && (
        <div className="card">
          <div className="spinner"></div>
          <p style={{ textAlign: 'center', color: '#718096', marginTop: '1rem' }}>
            Running alignment analysis...
          </p>
        </div>
      )}

      {results && (
        <>
          <div className="card">
            <h2>📊 Alignment Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.9rem', color: '#718096' }}>Total Alignments</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3748' }}>
                  {results.total_alignments || 0}
                </p>
              </div>
              <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.9rem', color: '#718096' }}>Avg Identity</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#48bb78' }}>
                  {results.avg_identity ? `${results.avg_identity.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.9rem', color: '#718096' }}>Best E-value</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                  {results.best_evalue || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>🔍 Alignment Results</h2>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Query ID</th>
                    <th>Subject ID</th>
                    <th>Identity %
                      <InfoIcon 
                        title="Identity Percentage"
                        content="Percentage of identical matches in the alignment. Higher values indicate greater similarity between sequences."
                      />
                    </th>
                    <th>Alignment Length</th>
                    <th>E-value
                      <InfoIcon 
                        title="E-value"
                        content="Expect value - the number of alignments with this score expected by chance. Lower values indicate more significant alignments (e.g., 1e-50 is better than 1e-5)."
                      />
                    </th>
                    <th>Bitscore</th>
                  </tr>
                </thead>
                <tbody>
                  {results.alignments && results.alignments.slice(0, 20).map((aln, idx) => (
                    <tr key={idx}>
                      <td>{aln.query_id}</td>
                      <td>{aln.subject_id}</td>
                      <td>
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: aln.identity > 80 ? '#48bb78' : aln.identity > 60 ? '#ed8936' : '#4a5568' 
                        }}>
                          {aln.identity.toFixed(1)}%
                        </span>
                      </td>
                      <td>{aln.alignment_length}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{aln.evalue}</td>
                      <td>{aln.bitscore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {results.alignments && results.alignments.length > 20 && (
              <p style={{ marginTop: '1rem', color: '#718096', textAlign: 'center' }}>
                Showing top 20 of {results.alignments.length} alignments
              </p>
            )}
          </div>

          <div className="card">
            <h2>📚 Understanding Your Results</h2>
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Identity Interpretation:</strong></p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                <li><strong>≥90%:</strong> Nearly identical sequences (same species/strain)</li>
                <li><strong>70-89%:</strong> Closely related sequences (same genus)</li>
                <li><strong>50-69%:</strong> Moderately related (conserved protein families)</li>
                <li><strong>&lt;50%:</strong> Distantly related or unrelated</li>
              </ul>
              
              <p><strong>E-value Interpretation:</strong></p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li><strong>&lt;1e-10:</strong> Highly significant match</li>
                <li><strong>1e-5 to 1e-10:</strong> Significant match</li>
                <li><strong>&gt;0.01:</strong> May not be biologically meaningful</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AlignmentPage
