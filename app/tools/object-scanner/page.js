'use client';
import { useState, useEffect } from 'react';
import SharingLink from '@/components/SharingLink';
import DropZone from '@/components/DropZone';
import '../image-compressor/tool.css';

export default function ObjectScanner() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setExtractedText('');
    setProgress(0);
  };

  const scanObject = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    
    try {
      // Lazy load tesseract to avoid SSR errors
      const { createWorker } = await import('tesseract.js');
      
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const { data: { text } } = await worker.recognize(file);
      setExtractedText(text);
      await worker.terminate();
    } catch (err) {
      console.error("OCR failed:", err);
      alert("Text recognition failed. Please try a clearer image.");
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scan_${file.name.split('.')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Object Scanner (OCR)</h1>
          <p>Extract text from images and documents instantly using local AI.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            title="Upload Image/Photo" 
            subtitle="JPG, PNG, and WebP are supported. Sharp images work best."
          />
        ) : (
          <div className="tool-workspace">
            {!extractedText ? (
              <div className="file-info glass-card" style={{ textAlign: 'center' }}>
                <img src={URL.createObjectURL(file)} alt="To scan" style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '400px' }} />
                {processing && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>AI is reading: {progress}%</p>
                    <div style={{ height: '4px', background: '#111', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--accent-gradient)', width: `${progress}%`, transition: 'width 0.2s' }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="result-workspace glass-card" style={{ padding: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Extracted Text</label>
                <textarea 
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  style={{ width: '100%', minHeight: '300px', background: 'black', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            )}

            <div className="tool-controls glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <div className="tool-actions">
                {!extractedText ? (
                  <button 
                    className="btn-primary" 
                    onClick={scanObject} 
                    disabled={processing}
                    style={{ width: '100%' }}
                  >
                    {processing ? "Starting OCR Engine..." : "🔍 Extract Text"}
                  </button>
                ) : (
                  <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className={`btn-primary ${isCopied ? 'copied' : ''}`} onClick={copyToClipboard} style={{ width: '100%', background: isCopied ? 'var(--secondary)' : '' }}>
                      {isCopied ? '✅ Copied to Clipboard!' : '📋 Copy Text'}
                    </button>
                    <button className="btn-secondary" onClick={downloadText} style={{ width: '100%' }}>📥 Download .txt File</button>
                    <SharingLink file={new Blob([extractedText], { type: 'text/plain' })} fileName="scan.txt" />
                    <button className="btn-secondary" onClick={() => setExtractedText('')} style={{ opacity: 0.6 }}>Scan another</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
