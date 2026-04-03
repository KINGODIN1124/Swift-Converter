'use client';
import { useState } from 'react';
import DropZone from '@/components/DropZone';
import '../image-compressor/tool.css';

export default function ImageResize() {
  const [file, setFile] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, originalWidth: 0, originalHeight: 0 });
  const [resizedUrl, setResizedUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResizedUrl(null);
    
    // Load image to get original dimensions
    const img = new Image();
    img.onload = () => {
      setDimensions({
        width: img.width,
        height: img.height,
        originalWidth: img.width,
        originalHeight: img.height,
      });
    };
    img.src = URL.createObjectURL(selectedFile);
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    const val = parseInt(value) || 0;
    
    if (maintainAspectRatio) {
      const ratio = dimensions.originalWidth / dimensions.originalHeight;
      if (name === 'width') {
        const newHeight = Math.round(val / ratio);
        setDimensions({ ...dimensions, width: val, height: newHeight });
      } else {
        const newWidth = Math.round(val * ratio);
        setDimensions({ ...dimensions, height: val, width: newWidth });
      }
    } else {
      setDimensions({ ...dimensions, [name]: val });
    }
  };

  const handleResize = () => {
    if (!file) return;
    setProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const ctx = canvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        
        const dataUrl = canvas.toDataURL(file.type, 0.9);
        setResizedUrl(dataUrl);
        setProcessing(false);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const download = () => {
    const link = document.createElement('a');
    link.href = resizedUrl;
    link.download = `resized_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setResizedUrl(null);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Resize Image</h1>
          <p>Modify image dimensions for social media or print. Fast and secure.</p>
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
                <p>Original: {dimensions.originalWidth} x {dimensions.originalHeight} px</p>
              </div>
            </div>

            <div className="tool-controls glass-card">
              <div className="control-group">
                <label>Width (px)</label>
                <input 
                  type="number" 
                  name="width"
                  value={dimensions.width} 
                  onChange={handleDimensionChange}
                  className="dimension-input"
                />
              </div>

              <div className="control-group">
                <label>Height (px)</label>
                <input 
                  type="number" 
                  name="height"
                  value={dimensions.height} 
                  onChange={handleDimensionChange}
                  className="dimension-input"
                />
              </div>

              <div className="control-group row">
                <input 
                   type="checkbox" 
                   id="aspectRatio" 
                   checked={maintainAspectRatio} 
                   onChange={(e) => setMaintainAspectRatio(e.target.checked)} 
                />
                <label htmlFor="aspectRatio">Maintain Aspect Ratio</label>
              </div>

              <div className="tool-actions">
                {!resizedUrl ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleResize} 
                    disabled={processing}
                  >
                    {processing ? "Resizing..." : "Resize Image"}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={download}>Download Resized Image</button>
                )}
                <button className="btn-secondary" onClick={reset}>Try another file</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .dimension-input {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          padding: 8px 12px;
          border-radius: 8px;
          color: var(--text-main);
          font-weight: 600;
        }
        .row {
            display: flex;
            flex-direction: row !important;
            align-items: center;
            gap: 0.5rem;
        }
        .row label { margin-bottom: 0 !important; cursor: pointer; }
        .row input { cursor: pointer; accent-color: var(--primary); }
      `}</style>
    </div>
  );
}
