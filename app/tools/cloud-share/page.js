'use client';
import { useState } from 'react';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import ProcessingGlow from '@/components/ProcessingGlow';
import '../image-compressor/tool.css';

export default function CloudShare() {
  const [file, setFile] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Cloud Share</h1>
          <p>Instant Ephemeral URLs. Securely share media with elective self-destruct timers.</p>
        </div>

        <div className="cloud-share-workspace" style={{ marginTop: '3rem' }}>
          <div className="upload-section glass-card" style={{ padding: '2rem' }}>
            {!file ? (
              <DropZone 
                onFileSelect={handleFileSelect} 
                accept="image/*,video/*,.gif" 
                title="Select Media to Share" 
                subtitle="Images, GIFs, and Videos. Processed with Privacy Shield."
              />
            ) : (
              <div className="sharing-active-zone" style={{ textAlign: 'center' }}>
                <div className="file-preview-mini glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
                   <span style={{ fontSize: '2.5rem' }}>🛰️</span>
                   <div style={{ textAlign: 'left' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{file.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Anonymous Data Stream
                      </p>
                   </div>
                   <button 
                     className="btn-secondary btn-sm" 
                     onClick={() => setFile(null)}
                     style={{ marginLeft: 'auto', fontSize: '0.6rem' }}
                   >
                     Reset
                   </button>
                </div>
                
                <SharingLink file={file} fileName={file.name} />
              </div>
            )}
          </div>

          <div className="info-section glass-card" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid rgba(0, 255, 242, 0.1)' }}>
             <h4 style={{ color: 'var(--secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>🛡️ Privacy Shield Active</h4>
             <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: '1.6' }}>
               SwiftConvert uses an anonymous delivery system. Your files are encrypted during the tunnel and deleted automatically based on your chosen <strong>Self-Destruct</strong> timer. 100% private. No accounts. No tracking.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
