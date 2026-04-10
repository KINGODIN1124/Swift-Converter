'use client';
import { useState } from 'react';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
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
          <p>Instantly turn any Image, GIF, or Video into a shareable URL.</p>
        </div>

        <div className="cloud-share-workspace" style={{ marginTop: '3rem' }}>
          <div className="upload-section glass-card" style={{ padding: '2rem' }}>
            {!file ? (
              <DropZone 
                onFileSelect={handleFileSelect} 
                accept="image/*,video/*,.gif" 
                title="Select File to Upload" 
                subtitle="Images, GIFs, and Videos are supported."
              />
            ) : (
              <div className="sharing-active-zone" style={{ textAlign: 'center' }}>
                <div className="file-preview-mini glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <span style={{ fontSize: '2rem' }}>📂</span>
                   <div style={{ textAlign: 'left' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem' }}>{file.name}</h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to share
                      </p>
                   </div>
                   <button 
                     className="btn-secondary btn-sm" 
                     onClick={() => setFile(null)}
                     style={{ marginLeft: 'auto' }}
                   >
                     Change
                   </button>
                </div>
                
                <SharingLink file={file} fileName={file.name} />
              </div>
            )}
          </div>

          <div className="info-section glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
             <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>How it works</h4>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
               Your file is uploaded to an anonymous, secure hosting service (file.io). 
               The link generated is <strong>ephemeral</strong>—it will be deleted automatically after 
               the first person downloads it, or after 14 days. This ensures maximum privacy for your shares.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
