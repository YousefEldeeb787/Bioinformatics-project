import React, { useState } from 'react'

function InfoIcon({ title, content }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <span 
        className="info-icon"
        onClick={() => setShowModal(true)}
        title="Click for more info"
      >
        📄
      </span>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h2 style={{ color: '#2d3748' }}>{title}</h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  cursor: 'pointer',
                  color: '#718096'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ lineHeight: '1.8', color: '#4a5568', whiteSpace: 'pre-line' }}>
              {content}
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#edf2f7', borderRadius: '8px' }}>
              <strong>📚 Learn More:</strong>
              <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                <li><a href="https://blast.ncbi.nlm.nih.gov/Blast.cgi" target="_blank" rel="noopener noreferrer">NCBI BLAST</a></li>
                <li><a href="http://www.mgc.ac.cn/VFs/" target="_blank" rel="noopener noreferrer">VFDB Database</a></li>
                <li><a href="http://hmmer.org/" target="_blank" rel="noopener noreferrer">HMMER</a></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InfoIcon
