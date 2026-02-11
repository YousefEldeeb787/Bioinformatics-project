import React, { useState, useEffect } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import InfoIcon from '../components/InfoIcon'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

function ResultsPage({ results }) {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('score')
  const [sortOrder, setSortOrder] = useState('desc')

  if (!results || !results.orfs) {
    return (
      <div className="card">
        <h1>📊 Results</h1>
        <p style={{ marginTop: '1rem', color: '#718096' }}>
          No results yet. Please run an analysis first.
        </p>
      </div>
    )
  }

  // Filter and sort ORFs
  let filteredOrfs = results.orfs
  if (filter !== 'all') {
    filteredOrfs = filteredOrfs.filter(orf => orf.classification === filter)
  }

  filteredOrfs = [...filteredOrfs].sort((a, b) => {
    const multiplier = sortOrder === 'desc' ? -1 : 1
    if (sortBy === 'score') {
      return multiplier * (a.vf_score - b.vf_score)
    } else if (sortBy === 'ml') {
      return multiplier * (a.ml_score - b.ml_score)
    } else if (sortBy === 'blast') {
      return multiplier * (a.blast_score - b.blast_score)
    }
    return 0
  })

  // Calculate statistics
  const classificationCounts = {
    'High-confidence VF': results.orfs.filter(o => o.classification === 'High-confidence VF').length,
    'Putative VF': results.orfs.filter(o => o.classification === 'Putative VF').length,
    'Low-confidence VF': results.orfs.filter(o => o.classification === 'Low-confidence VF').length,
    'Non-VF': results.orfs.filter(o => o.classification === 'Non-VF').length
  }

  // Chart data
  const pieData = {
    labels: Object.keys(classificationCounts),
    datasets: [{
      data: Object.values(classificationCounts),
      backgroundColor: ['#48bb78', '#ed8936', '#fc8181', '#cbd5e0'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }

  const barData = {
    labels: ['High-confidence', 'Putative', 'Low-confidence', 'Non-VF'],
    datasets: [{
      label: 'Number of ORFs',
      data: Object.values(classificationCounts),
      backgroundColor: ['#48bb78', '#ed8936', '#fc8181', '#cbd5e0']
    }]
  }

  const getBadgeClass = (classification) => {
    if (classification === 'High-confidence VF') return 'badge-high'
    if (classification === 'Putative VF') return 'badge-putative'
    if (classification === 'Low-confidence VF') return 'badge-low'
    return 'badge-non'
  }

  const downloadResults = () => {
    const csv = [
      ['ORF_ID', 'VF_Score', 'Classification', 'ML_Score', 'BLAST_Score', 'SignalP_Score', 'ML_Probability', 'Length'].join(','),
      ...results.orfs.map(orf => [
        orf.orf_id,
        orf.vf_score,
        orf.classification,
        orf.ml_score,
        orf.blast_score,
        orf.signalp_score,
        orf.ml_probability?.toFixed(3) || 'N/A',
        orf.length
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vf_analysis_results.csv'
    a.click()
  }

  return (
    <div>
      <div className="card">
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          📊 Analysis Results
          <InfoIcon 
            title="Understanding Results"
            content="Each ORF has been scored using three methods: ML (0-2), BLAST (0-3), and SignalP (0-1). The total VF score (0-6) determines classification. High scores indicate strong evidence for virulence factor function."
          />
        </h1>
        <p style={{ color: '#718096', marginBottom: '1rem' }}>
          Virulence factor predictions for {results.orfs.length} ORFs
        </p>
        
        <button className="btn btn-primary" onClick={downloadResults}>
          📥 Download CSV
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="card">
        <h2>📈 Summary Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f0fff4', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: '#22543d' }}>High-confidence VFs</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#48bb78' }}>
              {classificationCounts['High-confidence VF']}
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#fef5e7', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: '#7c2d12' }}>Putative VFs</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ed8936' }}>
              {classificationCounts['Putative VF']}
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#fff5f5', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: '#742a2a' }}>Low-confidence VFs</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fc8181' }}>
              {classificationCounts['Low-confidence VF']}
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>Non-VFs</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#cbd5e0' }}>
              {classificationCounts['Non-VF']}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h2>🥧 Classification Distribution</h2>
          <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
        
        <div className="card">
          <h2>📊 ORF Counts by Classification</h2>
          <Bar 
            data={barData} 
            options={{ 
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }} 
          />
        </div>
      </div>

      {/* ORF Table */}
      <div className="card">
        <h2>🔍 Detailed ORF Results</h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '0.5rem', fontWeight: '600' }}>Filter:</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
            >
              <option value="all">All ORFs</option>
              <option value="High-confidence VF">High-confidence VF</option>
              <option value="Putative VF">Putative VF</option>
              <option value="Low-confidence VF">Low-confidence VF</option>
              <option value="Non-VF">Non-VF</option>
            </select>
          </div>
          
          <div>
            <label style={{ marginRight: '0.5rem', fontWeight: '600' }}>Sort by:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
            >
              <option value="score">VF Score</option>
              <option value="ml">ML Score</option>
              <option value="blast">BLAST Score</option>
            </select>
          </div>
          
          <div>
            <label style={{ marginRight: '0.5rem', fontWeight: '600' }}>Order:</label>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
            >
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ORF ID</th>
                <th>VF Score
                  <InfoIcon 
                    title="VF Score"
                    content="Total score (0-6) combining ML (0-2) + BLAST (0-3) + SignalP (0-1). Higher scores indicate stronger evidence for virulence factor function."
                  />
                </th>
                <th>Classification</th>
                <th>ML
                  <InfoIcon 
                    title="ML Score"
                    content="Machine Learning score (0-2). Based on Random Forest prediction using amino acid composition and hydrophobicity features."
                  />
                </th>
                <th>BLAST
                  <InfoIcon 
                    title="BLAST Score"
                    content="BLAST score (0-3). Based on identity to known virulence factors in VFDB. Higher identity = higher score."
                  />
                </th>
                <th>SignalP
                  <InfoIcon 
                    title="SignalP Score"
                    content="Signal peptide score (0-1). Indicates if protein has secretion signal. Secreted proteins are often virulence factors."
                  />
                </th>
                <th>Length (aa)</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrfs.slice(0, 50).map((orf, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{orf.orf_id}</td>
                  <td>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '1.1rem',
                      color: orf.vf_score >= 5 ? '#48bb78' : orf.vf_score >= 3 ? '#ed8936' : '#718096'
                    }}>
                      {orf.vf_score}/6
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(orf.classification)}`}>
                      {orf.classification}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{orf.ml_score}</td>
                  <td style={{ textAlign: 'center' }}>{orf.blast_score}</td>
                  <td style={{ textAlign: 'center' }}>{orf.signalp_score}</td>
                  <td style={{ textAlign: 'center' }}>{orf.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrfs.length > 50 && (
          <p style={{ marginTop: '1rem', color: '#718096', textAlign: 'center' }}>
            Showing top 50 of {filteredOrfs.length} ORFs
          </p>
        )}
      </div>

      {/* Interpretation Guide */}
      <div className="card">
        <h2>📚 How to Interpret Your Results</h2>
        <div style={{ lineHeight: '1.8' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#48bb78', marginBottom: '0.5rem' }}>✅ High-confidence VFs (Score 5-6)</h3>
            <p>Strong evidence from multiple methods. These ORFs are very likely virulence factors. Consider these as priority targets for experimental validation.</p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#ed8936', marginBottom: '0.5rem' }}>⚠️ Putative VFs (Score 3-4)</h3>
            <p>Moderate evidence suggesting virulence function. May require further analysis or literature review to confirm role in pathogenicity.</p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#fc8181', marginBottom: '0.5rem' }}>❓ Low-confidence VFs (Score 1-2)</h3>
            <p>Weak evidence. These may be false positives or represent novel virulence factors not well represented in databases.</p>
          </div>
          
          <div>
            <h3 style={{ color: '#718096', marginBottom: '0.5rem' }}>❌ Non-VFs (Score 0)</h3>
            <p>No evidence for virulence function. Likely housekeeping genes or non-pathogenic proteins.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
