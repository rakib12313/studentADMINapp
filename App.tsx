import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [prompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (result.text) {
        setResponse(result.text);
      } else {
        throw new Error('No response text received.');
      }
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '60px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '40px',
    }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          margin: '0 0 16px 0',
          background: 'linear-gradient(135deg, #4285F4, #9B72CB, #FF7043)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          lineHeight: 1.1
        }}>
          Gemini 3
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1.2rem', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
          Next-generation AI for advanced reasoning and content creation.
        </p>
      </header>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        backgroundColor: '#181b21',
        padding: '24px',
        borderRadius: '24px',
        border: '1px solid #2d333b',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can I help you today?"
            rows={3}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '18px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              lineHeight: '1.6',
              minHeight: '80px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2d333b', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>
            {isLoading ? 'Thinking...' : 'Cmd + Enter to send'}
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: isLoading ? '#2d333b' : '#fff',
              color: isLoading ? '#999' : '#000',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isLoading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #999',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            Run
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 82, 82, 0.05)',
          border: '1px solid rgba(255, 82, 82, 0.2)',
          color: '#ff8a80',
          animation: 'fadeIn 0.3s ease'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{
          animation: 'fadeIn 0.5s ease',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            color: '#9ca3af',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600
          }}>
             <span>✦</span> Gemini Response
          </div>
          <div style={{
            fontSize: '1.1rem',
            lineHeight: '1.7',
            color: '#e0e0e0',
            whiteSpace: 'pre-wrap'
          }}>
            {response}
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;