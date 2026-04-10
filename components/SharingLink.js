'use client';
import { useState } from 'react';
import './SharingLink.css';

export default function SharingLink({ file, fileName }) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file, fileName);

      const response = await fetch('https://file.io', {
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
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sharing-link-container animate-fade-in">
      {!link ? (
        <button 
          className="btn-primary share-btn" 
          onClick={handleShare}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner">⏳ Generating Link...</span>
          ) : (
            <>🚀 Get Shareable URL</>
          )}
        </button>
      ) : (
        <div className="link-result-box glass-card">
          <div className="link-info">
            <span className="link-label">Temporary URL (1 Download only)</span>
            <div className="link-row">
              <input type="text" readOnly value={link} className="link-input" />
              <button 
                className={`btn-copy ${copied ? 'copied' : ''}`} 
                onClick={copyToClipboard}
              >
                {copied ? '✅  Link Copied!' : '📋 Copy Link'}
              </button>
            </div>
          </div>
          <p className="privacy-note">
            🛡️ Your file is hosted anonymously. It will be deleted automatically 
            after the first download or 14 days.
          </p>
        </div>
      )}
      {error && <p className="error-text">❌ {error}</p>}
    </div>
  );
}
