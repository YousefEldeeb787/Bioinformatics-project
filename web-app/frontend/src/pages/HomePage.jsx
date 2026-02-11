import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import InfoIcon from '../components/InfoIcon'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

function HomePage() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})
  const navigate = useNavigate()

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await axios.post('/api/upload_genome', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      alert('Genome uploaded successfully! Proceeding to analysis...')
      navigate('/orf-analysis', { state: { fileId: response.data.file_id } })
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.detail || error.message))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="card">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#2d3748' }}>
          🧬 Virulence Factor Detector
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#4a5568', marginBottom: '2rem' }}>
          Learn bioinformatics while analyzing bacterial genomes for virulence factors
        </p>
        
        <div style={{ background: '#edf2f7', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            📚 What You'll Learn
          </h3>
          
          {/* ORF Prediction */}
          <div style={{ marginBottom: '1rem', background: 'white', borderRadius: '8px', padding: '1rem' }}>
            <div 
              onClick={() => toggleSection('orf')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <strong>🧬 ORF Prediction</strong>
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.3rem' }}>
                  Identify protein-coding sequences (ORFs) from raw genome files.
                </p>
              </div>
              {expandedSections.orf ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedSections.orf && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                  <strong>What happens in this project:</strong><br />
                  Your uploaded genome (DNA FASTA) is scanned to find Open Reading Frames (ORFs) — regions likely to encode proteins. 
                  These ORFs become the foundation for all downstream analyses (ML, BLAST, HMM).
                  We translate nucleotide sequences into protein sequences and filter by biologically meaningful lengths to avoid noise.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                  <strong>🔗 Learn more:</strong><br />
                  <a href="https://www.ncbi.nlm.nih.gov/orffinder/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>NCBI ORF Finder</a><br />
                  <a href="https://www.ncbi.nlm.nih.gov/books/NBK20260/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Bioinformatics Algorithms (ORFs)</a>
                </p>
              </div>
            )}
          </div>

          {/* Machine Learning */}
          <div style={{ marginBottom: '1rem', background: 'white', borderRadius: '8px', padding: '1rem' }}>
            <div 
              onClick={() => toggleSection('ml')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <strong>🤖 Machine Learning for Virulence Prediction</strong>
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.3rem' }}>
                  Predict whether a protein is a virulence factor using trained ML models.
                </p>
              </div>
              {expandedSections.ml ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedSections.ml && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                  <strong>What happens in this project:</strong><br />
                  A Random Forest classifier trained on known virulence and non-virulence proteins estimates the probability that each ORF is a virulence factor.
                  Instead of a simple yes/no, we use probability-based scoring to reflect confidence and allow discovery of novel virulence factors that may not exist in databases.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                  <strong>🔗 Learn more:</strong><br />
                  <a href="https://scikit-learn.org/stable/modules/ensemble.html#random-forests" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Random Forest explained</a><br />
                  <a href="https://www.nature.com/articles/s41576-019-0176-5" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>ML in bioinformatics (review)</a>
                </p>
              </div>
            )}
          </div>

          {/* BLAST Analysis */}
          <div style={{ marginBottom: '1rem', background: 'white', borderRadius: '8px', padding: '1rem' }}>
            <div 
              onClick={() => toggleSection('blast')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <strong>🔍 BLAST Analysis (VFDB Comparison)</strong>
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.3rem' }}>
                  Align proteins against known virulence factors to detect strong homology.
                </p>
              </div>
              {expandedSections.blast ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedSections.blast && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                  <strong>What happens in this project:</strong><br />
                  Each predicted ORF is aligned using BLASTP against the Virulence Factor Database (VFDB).
                  High identity + low E-value hits indicate strong evidence that an ORF matches a known virulence factor.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                  <strong>🔗 Learn more:</strong><br />
                  <a href="https://blast.ncbi.nlm.nih.gov/Blast.cgi" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>BLAST basics (NCBI)</a><br />
                  <a href="http://www.mgc.ac.cn/VFs/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>VFDB official site</a>
                </p>
              </div>
            )}
          </div>

          {/* HMM Detection */}
          <div style={{ marginBottom: '1rem', background: 'white', borderRadius: '8px', padding: '1rem' }}>
            <div 
              onClick={() => toggleSection('hmm')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <strong>🧠 HMM-Based Domain Detection</strong>
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.3rem' }}>
                  Detect conserved virulence-related protein domains.
                </p>
              </div>
              {expandedSections.hmm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedSections.hmm && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                  <strong>What happens in this project:</strong><br />
                  Hidden Markov Models (HMMs) search for conserved virulence domains inside proteins — even when full-sequence similarity is weak.
                  This mimics tools like PathoFact, which rely on domain-level detection.
                </p>
                <p style={{ background: '#fff5e6', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  ⚠️ <strong>Note:</strong> Zero hits may occur due to database scope, not pipeline failure — this is scientifically valid and explicitly reported.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                  <strong>🔗 Learn more:</strong><br />
                  <a href="http://hmmer.org/documentation.html" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>HMMER user guide</a><br />
                  <a href="https://pfam.xfam.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Pfam database</a>
                </p>
              </div>
            )}
          </div>

          {/* HMM Profile Detection */}
          <div style={{ marginBottom: '1rem', background: 'white', borderRadius: '8px', padding: '1rem' }}>
            <div 
              onClick={() => toggleSection('signal')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <strong>🧬 HMM Profile Detection</strong>
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.3rem' }}>
                  Identify conserved virulence domains using Hidden Markov Models.
                </p>
              </div>
              {expandedSections.signal ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedSections.signal && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                  <strong>What happens in this project:</strong><br />
                  HMM profiles detect conserved protein domains and functional motifs associated with virulence. This method identifies structural patterns that indicate virulence function.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                  <strong>🔗 Learn more:</strong><br />
                  <a href="http://hmmer.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>HMMER official site</a><br />
                  <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3695513/" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Review on HMM in bioinformatics</a>
                </p>
              </div>
            )}
          </div>

          {/* Evidence-Based Scoring */}
          <div style={{ marginBottom: '1rem', background: 'white', borderRadius: '8px', padding: '1rem' }}>
            <div 
              onClick={() => toggleSection('scoring')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <strong>📊 Evidence-Based Scoring System</strong>
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.3rem' }}>
                  Combine multiple tools for confident virulence classification.
                </p>
              </div>
              {expandedSections.scoring ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedSections.scoring && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                  <strong>What happens in this project:</strong><br />
                  Each ORF is scored using independent biological evidence:
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                  <thead>
                    <tr style={{ background: '#f7fafc' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Evidence</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>ML probability ≥ 0.7</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>+2</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>ML probability 0.5–0.69</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>+1</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Strong BLAST VFDB hit</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>+4</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>HMM virulence domain</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>+3</td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                  This avoids over-reliance on a single method and supports novel VF discovery.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                  <strong>🔗 Learn more:</strong><br />
                  <a href="https://academic.oup.com/bioinformatics/article/35/14/2391/5298049" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>Integrative genomics approaches</a>
                </p>
              </div>
            )}
          </div>

          {/* How This App Helps Beginners */}
          <div style={{ marginBottom: '1rem', background: 'white', borderRadius: '8px', padding: '1rem' }}>
            <div 
              onClick={() => toggleSection('beginners')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <strong>🧭 How This App Helps Beginners</strong>
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.3rem' }}>
                  Learn bioinformatics step-by-step with clear explanations.
                </p>
              </div>
              {expandedSections.beginners ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedSections.beginners && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <ul style={{ lineHeight: '2', paddingLeft: '1.5rem' }}>
                  <li>✅ Learn sequence alignment step-by-step</li>
                  <li>✅ See real biological meaning behind scores</li>
                  <li>✅ Understand why tools disagree</li>
                  <li>✅ Explore known vs novel virulence factors</li>
                  <li>✅ Navigate results with explanations, not just numbers</li>
                </ul>
              </div>
            )}
          </div>

          {/* Built-in Chatbot */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
            <div 
              onClick={() => toggleSection('chatbot')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div>
                <strong>💬 Built-in Bioinformatics AI Assistant</strong>
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.3rem' }}>
                  Get instant help understanding your results and bioinformatics concepts.
                </p>
              </div>
              {expandedSections.chatbot ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            {expandedSections.chatbot && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6', background: '#f0f9ff', padding: '0.75rem', borderRadius: '6px' }}>
                  <strong>Stuck? Confused by a score or alignment?</strong><br />
                  The AI assistant explains results, suggests next steps, and links you to trusted biological references — just like a mentor.
                </p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Chatbot abilities:</strong></p>
                <ul style={{ lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                  <li>Answer ANY question about bioinformatics, biology, or your analysis</li>
                  <li>Explain BLAST tables and E-values</li>
                  <li>Interpret ML probabilities</li>
                  <li>Clarify HMM vs BLAST differences</li>
                  <li>Suggest parameter tuning</li>
                  <li>Guide beginners through alignment concepts</li>
                  <li>Provide general knowledge and programming help</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>
          📤 Upload Genome File
          <InfoIcon 
            title="Genome Upload"
            content="Upload a bacterial genome in FASTA format. The file should contain nucleotide sequences (A, T, G, C). We'll predict ORFs and analyze them for virulence factors using ML + BLAST + HMM detection."
          />
        </h2>
        
        <div 
          className={`upload-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".fasta,.fa,.fna"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
          
          {file ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
                title="Remove file"
              >
                <X size={18} />
              </button>
              <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📄</p>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748' }}>
                {file.name}
              </p>
              <p style={{ color: '#718096', marginTop: '0.5rem' }}>
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>☁️</p>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748' }}>
                Drop genome file here or click to browse
              </p>
              <p style={{ color: '#718096', marginTop: '0.5rem' }}>
                Supported: .fasta, .fa, .fna
              </p>
            </div>
          )}
        </div>
        
        {file && (
          <button 
            className="btn btn-primary" 
            onClick={handleUpload}
            disabled={uploading}
            style={{ marginTop: '1rem', width: '100%', fontSize: '1.1rem' }}
          >
            {uploading ? 'Uploading...' : '🚀 Start Analysis'}
          </button>
        )}
      </div>
    </div>
  )
}

export default HomePage
