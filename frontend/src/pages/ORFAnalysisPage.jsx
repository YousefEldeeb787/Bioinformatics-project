import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import InfoIcon from '../components/InfoIcon'

function ORFAnalysisPage({ setResults }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [orfData, setOrfData] = useState(null)

  const handleAnalysis = async () => {
    if (!file) {
      alert('Please upload a genome file')
      return
    }
    
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      // Step 1: ORF Prediction
      setStage('Predicting ORFs...')
      setProgress(20)
      const orfResponse = await axios.post('/api/predict_orfs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setOrfData(orfResponse.data)
      
      // Step 2: VF Scoring
      setStage('Running ML predictions...')
      setProgress(40)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStage('Running BLAST analysis...')
      setProgress(60)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setStage('Detecting signal peptides...')
      setProgress(80)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setStage('Calculating VF scores...')
      setProgress(90)
      const scoreResponse = await axios.post('/api/vf_score', {
        orfs: orfResponse.data.orfs
      })
      
      setProgress(100)
      setStage('Analysis complete!')
      
      // Save results and navigate
      setResults(scoreResponse.data)
      setTimeout(() => navigate('/results'), 1000)
      
    } catch (error) {
      alert('Analysis failed: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          🔬 Virulence Factor Analysis
          <InfoIcon 
            title="VF Analysis Pipeline"
            content="This analysis combines four methods: (1) Machine Learning predictions based on sequence features, (2) BLAST comparison against known virulence factors in VFDB, (3) HMM search for virulence domains, and (4) Signal peptide detection for secreted proteins. Each method contributes to a cumulative VF score (0-10)."
          />
        </h1>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          Predict ORFs and detect virulence factors using ML + BLAST + SignalP
        </p>
      </div>

      <div className="card">
        <h2>📋 Analysis Pipeline</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1.5rem', background: '#f0fff4', borderRadius: '12px', border: '2px solid #9ae6b4' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>1️⃣</div>
            <h3 style={{ marginBottom: '0.5rem' }}>ORF Prediction</h3>
            <p style={{ fontSize: '0.9rem', color: '#22543d' }}>
              Extract all potential protein-coding sequences from genome
            </p>
            <InfoIcon 
              title="What are ORFs?"
              content="Open Reading Frames (ORFs) are stretches of DNA that could potentially code for proteins. They start with a start codon (ATG) and end with a stop codon (TAA, TAG, TGA). We analyze all 6 reading frames."
            />
          </div>
          
          <div style={{ padding: '1.5rem', background: '#fef5e7', borderRadius: '12px', border: '2px solid #f6ad55' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>2️⃣</div>
            <h3 style={{ marginBottom: '0.5rem' }}>ML Prediction (0-2 pts)</h3>
            <p style={{ fontSize: '0.9rem', color: '#7c2d12' }}>
              Random Forest model predicts VF probability
            </p>
            <InfoIcon 
              title="Machine Learning Scoring"
              content="Our trained Random Forest model analyzes amino acid composition and hydrophobicity. Score: 2 points if probability ≥0.7, 1 point if probability 0.5–0.69, 0 otherwise."
            />
          </div>
          
          <div style={{ padding: '1.5rem', background: '#ebf4ff', borderRadius: '12px', border: '2px solid #90cdf4' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3️⃣</div>
            <h3 style={{ marginBottom: '0.5rem' }}>BLAST (VFDB) (0-4 pts)</h3>
            <p style={{ fontSize: '0.9rem', color: '#1a365d' }}>
              Compare against VFDB database
            </p>
            <InfoIcon 
              title="BLAST Scoring"
              content="ORFs are compared against the Virulence Factor Database. Score: 4 points for strong hit (identity ≥80% and E-value ≤1e-5), 0 otherwise."
            />
          </div>
          
          <div style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '12px', border: '2px solid #fca5a5' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>4️⃣</div>
            <h3 style={{ marginBottom: '0.5rem' }}>HMM Domain (0-3 pts)</h3>
            <p style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>
              Detect virulence-related domains
            </p>
            <InfoIcon 
              title="HMM Domain Scoring"
              content="Hidden Markov Model searches identify conserved virulence domains. Score: 3 points if significant virulence domain detected, 0 otherwise."
            />
          </div>
          
          <div style={{ padding: '1.5rem', background: '#faf5ff', borderRadius: '12px', border: '2px solid #d6bcfa' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>5️⃣</div>
            <h3 style={{ marginBottom: '0.5rem' }}>SignalP (0-1 pt)</h3>
            <p style={{ fontSize: '0.9rem', color: '#44337a' }}>
              Detect secretion signals
            </p>
            <InfoIcon 
              title="Signal Peptide Detection"
              content="Signal peptides direct proteins for secretion outside the cell. Secreted proteins are often virulence factors. Score: 1 point if signal peptide detected, 0 otherwise."
            />
          </div>
        </div>
        
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#fff5f5', borderRadius: '8px', borderLeft: '4px solid #fc8181' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <strong style={{ fontSize: '1.1rem' }}>📊 Evidence-Based Scoring System</strong>
            <InfoIcon 
              title="Why Evidence-Based Scoring?"
              content="This multi-evidence approach combines computational predictions, database comparisons, domain analysis, and biological features to provide a comprehensive and reliable assessment of virulence potential. Each method validates and complements the others, reducing false positives and increasing confidence in predictions."
            />
          </div>
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fee', borderBottom: '2px solid #fc8181' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Evidence Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Condition</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #fed7d7' }}>
                  <td style={{ padding: '0.75rem' }}><strong>ML Prediction</strong></td>
                  <td style={{ padding: '0.75rem' }}>Probability ≥ 0.7</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: '#c53030' }}>+2</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #fed7d7' }}>
                  <td style={{ padding: '0.75rem' }}><strong>ML Prediction</strong></td>
                  <td style={{ padding: '0.75rem' }}>Probability 0.5–0.69</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: '#c53030' }}>+1</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #fed7d7' }}>
                  <td style={{ padding: '0.75rem' }}><strong>BLAST (VFDB)</strong></td>
                  <td style={{ padding: '0.75rem' }}>Strong hit (identity ≥80%, E ≤ 1e-5)</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: '#c53030' }}>+4</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #fed7d7' }}>
                  <td style={{ padding: '0.75rem' }}><strong>HMM</strong></td>
                  <td style={{ padding: '0.75rem' }}>Significant virulence domain</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: '#c53030' }}>+3</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #fed7d7' }}>
                  <td style={{ padding: '0.75rem' }}><strong>SignalP</strong></td>
                  <td style={{ padding: '0.75rem' }}>Signal peptide detected</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: '#c53030' }}>+1</td>
                </tr>
                <tr style={{ background: '#fed7d7' }}>
                  <td colSpan="2" style={{ padding: '0.75rem', fontWeight: 'bold' }}>Maximum Score</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>10</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.75rem' }}>Total Score Interpretation:</strong>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', background: '#c53030', color: 'white', borderRadius: '4px', fontWeight: '600' }}>
                ≥7 → High-confidence VF
              </div>
              <div style={{ padding: '0.5rem', background: '#ed8936', color: 'white', borderRadius: '4px', fontWeight: '600' }}>
                4–6 → Putative VF
              </div>
              <div style={{ padding: '0.5rem', background: '#ecc94b', color: '#744210', borderRadius: '4px', fontWeight: '600' }}>
                1–3 → Low-confidence VF
              </div>
              <div style={{ padding: '0.5rem', background: '#a0aec0', color: 'white', borderRadius: '4px', fontWeight: '600' }}>
                0 → Non-VF
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>📤 Upload Genome</h2>
        <input 
          type="file" 
          accept=".fasta,.fa,.fna"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ 
            display: 'block', 
            width: '100%', 
            padding: '0.75rem', 
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        />
        {file && (
          <p style={{ marginTop: '0.5rem', color: '#48bb78', fontSize: '0.9rem' }}>
            ✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
        
        <button 
          className="btn btn-primary"
          onClick={handleAnalysis}
          disabled={!file || loading}
          style={{ marginTop: '1.5rem', width: '100%', fontSize: '1.1rem' }}
        >
          {loading ? '⏳ Analyzing...' : '🚀 Start VF Analysis'}
        </button>
      </div>

      {loading && (
        <div className="card">
          <h2>⚙️ Analysis Progress</h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p style={{ textAlign: 'center', color: '#718096', marginTop: '1rem', fontWeight: '600' }}>
            {stage} ({progress}%)
          </p>
          <div className="spinner" style={{ marginTop: '1rem' }}></div>
        </div>
      )}

      {orfData && !loading && (
        <div className="card">
          <h2>✅ ORF Prediction Complete</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>Total Contigs</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3748' }}>
                {orfData.num_contigs}
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>ORFs Predicted</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#48bb78' }}>
                {orfData.num_orfs}
              </p>
            </div>
            <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>Avg ORF Length</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                {orfData.avg_orf_length} bp
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ORFAnalysisPage
