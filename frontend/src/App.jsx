import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AlignmentPage from './pages/AlignmentPage'
import ORFAnalysisPage from './pages/ORFAnalysisPage'
import ResultsPage from './pages/ResultsPage'
import Chatbot from './components/Chatbot'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path ? 'active' : ''
  
  return (
    <nav>
      <ul>
        <li>
          <Link to="/" className={isActive('/')}>
            🏠 Home
          </Link>
        </li>
        <li>
          <Link to="/alignment" className={isActive('/alignment')}>
            🧬 Alignment
          </Link>
        </li>
        <li>
          <Link to="/orf-analysis" className={isActive('/orf-analysis')}>
            🔬 VF Analysis
          </Link>
        </li>
        <li>
          <Link to="/results" className={isActive('/results')}>
            📊 Results
          </Link>
        </li>
      </ul>
    </nav>
  )
}

function App() {
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)

  return (
    <Router>
      <div className="app">
        <Navigation />
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/alignment" element={<AlignmentPage />} />
            <Route 
              path="/orf-analysis" 
              element={<ORFAnalysisPage setResults={setAnalysisResults} />} 
            />
            <Route 
              path="/results" 
              element={<ResultsPage results={analysisResults} />} 
            />
          </Routes>
        </div>
        
        <Chatbot isOpen={chatbotOpen} setIsOpen={setChatbotOpen} />
        
        {!chatbotOpen && (
          <button 
            className="btn btn-primary"
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              fontSize: '24px'
            }}
            onClick={() => setChatbotOpen(true)}
          >
            💬
          </button>
        )}
      </div>
    </Router>
  )
}

export default App
