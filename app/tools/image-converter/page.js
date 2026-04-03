'use client';
import { useState } from 'react';
import DropZone from '@/components/DropZone';
import '../image-compressor/tool.css';

export default function ImageConverter() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('image/jpeg');
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setConvertedUrl(null);
  };

  const handleConvert = () => {
    if (!file) return;
    setProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL(format, 0.9);
        setConvertedUrl(dataUrl);
        setProcessing(false);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const download = () => {
    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = `converted_${file.name.split('.')[0]}.${format.split('/')[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setConvertedUrl(null);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Image Converter</h1>
          <p>Convert images between formats. Fast, local, and completely private.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            title="Upload Image" 
            subtitle="JPG, PNG, or WebP images supported."
          />
        ) : (
          <div className="tool-workspace">
            <div className="file-info glass-card">
              <div className="file-preview">
                <img src={URL.createObjectURL(file)} alt="Original Preview" />
              </div>
              <div className="file-details">
                <h3>{file.name}</h3>
                <p>Type: {file.type}</p>
                <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>

            <div className="tool-controls glass-card">
              <div className="control-group">
                <label>Select Output Format</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['image/jpeg', 'image/png', 'image/webp'].map((f) => (
                    <button 
                      key={f}
                      className={`btn-secondary btn-sm ${format === f ? 'btn-active' : ''}`}
                      onClick={() => setFormat(f)}
                      style={{ flex: '1', border: format === f ? '1px solid var(--primary)' : '1px solid var(--border)' }}
                    >
                      {f.split('/')[1].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tool-actions">
                {!convertedUrl ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleConvert} 
                    disabled={processing}
                  >
                    {processing ? "Converting..." : `Convert to ${format.split('/')[1].toUpperCase()}`}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={download}>Download Converted Image</button>
                )}
                <button className="btn-secondary" onClick={reset}>Try another file</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .btn-active {
            background: var(--bg-card) !important;
            color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}
