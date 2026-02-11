import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

function Chatbot({ isOpen, setIsOpen }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! 👋 I\'m BioGuideAI, your universal bioinformatics assistant. Ask me ANYTHING - from specific questions about your analysis to general biology, programming, or even conceptual questions!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call the backend chatbot endpoint which will interface with OpenAI or another AI service
      const response = await axios.post('/api/chatbot', {
        message: input,
        history: messages.slice(-10) // Send last 10 messages for context
      })
      
      const assistantMessage = { role: 'assistant', content: response.data.response }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error connecting to the AI service. Please make sure the API is properly configured and try again.' 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    "What is an ORF?",
    "How does BLAST E-value work?",
    "Explain signal peptides",
    "What makes a protein virulent?",
    "How to interpret my results?",
    "What is machine learning?"
  ]

  if (!isOpen) return null

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <div>
          <strong>💬 BioGuideAI - Universal Assistant</strong>
          <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.2rem' }}>Ask me anything - I'm here to help!</p>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            fontSize: '1.5rem', 
            cursor: 'pointer' 
          }}
        >
          ✕
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              borderRadius: '8px',
              background: msg.role === 'user' ? '#667eea' : '#f7fafc',
              color: msg.role === 'user' ? 'white' : '#2d3748',
              marginLeft: msg.role === 'user' ? '2rem' : '0',
              marginRight: msg.role === 'user' ? '0' : '2rem'
            }}
          >
            <strong style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              {msg.role === 'user' ? 'You' : '🤖 BioGuideAI'}
            </strong>
            <div 
              style={{ marginTop: '0.3rem', lineHeight: '1.5' }}
              dangerouslySetInnerHTML={{ 
                __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }}
            />
          </div>
        ))}
        
        {loading && (
          <div style={{ textAlign: 'center', color: '#718096', padding: '1rem' }}>
            <div style={{ 
              display: 'inline-block',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              🤔 Thinking...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem' }}>
            <strong>Quick questions to get started:</strong>
          </p>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInput(q)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem',
                margin: '0.25rem 0',
                background: '#edf2f7',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
              onMouseLeave={(e) => e.target.style.background = '#edf2f7'}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="chatbot-input">
        <input 
          type="text"
          placeholder="Ask me anything about bioinformatics, your analysis, or general questions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button 
          className="btn btn-primary"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{ minWidth: '50px' }}
        >
          {loading ? '...' : '➤'}
        </button>
      </div>
    </div>
  )
}

export default Chatbot
