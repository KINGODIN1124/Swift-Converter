'use client';
import { useState } from 'react';
import './SharingLink.css';

export default function SharingLink({ file, fileName }) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [expires, setExpires] = useState('14d'); // Default 14 days

  const expiryOptions = [
    { label: '1 Hour', value: '1h' },
    { label: '1 Day', value: '1d' },
    { label: '1 Week', value: '1w' },
    { label: '2 Weeks', value: '14d' }
  ];

  const handleShare = async () => {
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file, fileName);

      // file.io supports expires parameter
      const response = await fetch(`https://file.io/?expires=${expires}`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setLink(result.link);
      } else {
        throw new Error('Upload failed. Please try again.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sharing-link-container animate-fade-in">
      {!link ? (
        <div className="sharing-setup" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="expiry-picker" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
             <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>Self-Destruct:</span>
             <select 
                value={expires} 
                onChange={(e) => setExpires(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', outline: 'none' }}
             >
                {expiryOptions.map(opt => (
                  <option key={opt.value} value={opt.value} style={{ background: '#111' }}>{opt.label}</option>
                ))}
             </select>
          </div>
          <button 
            className="btn-primary share-btn" 
            onClick={handleShare}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <span className="spinner">⏳ Encrypting & Sharing...</span>
            ) : (
              <>🚀 Generate Private Link</>
            )}
          </button>
        </div>
      ) : (
        <div className="link-result-box glass-card">
          <div className="link-info">
            <span className="link-label">Ephemeral URL (Expires in {expiryOptions.find(o => o.value === expires).label})</span>
            <div className="link-row">
              <input type="text" readOnly value={link} className="link-input" />
              <button 
                className={`btn-copy ${copied ? 'copied' : ''}`} 
                onClick={copyToClipboard}
              >
                {copied ? '✅  COPIED!' : '📋 COPY'}
              </button>
            </div>
          </div>
          <p className="privacy-note" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '10px' }}>
            🛡️ Privacy Shield Active: This file is hosted anonymously and will be deleted after the first download or expiration.
          </p>
        </div>
      )}
      {error && <p className="error-text" style={{ color: '#ff5f56', fontSize: '0.7rem', marginTop: '5px' }}>❌ {error}</p>}
    </div>
  );
}
