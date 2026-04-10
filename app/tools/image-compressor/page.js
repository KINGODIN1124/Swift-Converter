'use client';
import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import './tool.css';
import './compressor-refinement.css';

export default function ImageCompressor() {
  const [file, setFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [options, setOptions] = useState({
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setCompressedFile(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const compressed = await imageCompression(file, options);
      setCompressedFile(compressed);
    } catch (error) {
      console.error("Compression failed:", error);
      alert("Something went wrong during compression.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setCompressedFile(null);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Image Compressor</h1>
          <p>Professional sizing & quality control. Processed 100% locally in your session.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            title="Upload Image" 
            subtitle="JPG, PNG, and WebP are supported."
          />
        ) : (
          <div className="tool-workspace refinement-grid">
            <div className="comparison-section glass-card">
              <div className="comparison-slider" style={{ '--slider-pos': `${sliderPos}%` }}>
                <div className="before-img">
                   <img src={URL.createObjectURL(file)} alt="Original" />
                   <span className="image-label">ORIGINAL</span>
                </div>
                <div className="after-img">
                   <img src={compressedFile ? URL.createObjectURL(compressedFile) : URL.createObjectURL(file)} alt="Compressed" />
                   <span className="image-label">COMPRESSED</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={sliderPos}
                  onChange={(e) => setSliderPos(e.target.value)}
                  className="slider-input"
                />
                <div className="slider-handle">
                   <div className="handle-line"></div>
                   <div className="handle-circle">↔</div>
                </div>
              </div>
            </div>

            <div className="controls-section glass-card">
              <div className="file-metrics">
                 <div className="metric">
                    <label>Original</label>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                 </div>
                 {compressedFile && (
                   <div className="metric saving">
                      <label>Compressed</label>
                      <span>{(compressedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                   </div>
                 )}
              </div>

              <div className="settings-panel">
                <div className="control-group">
                  <div className="label-row">
                    <label>Target Size</label>
                    <span className="value-chip">{options.maxSizeMB} MB</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="5" 
                    step="0.1" 
                    value={options.maxSizeMB} 
                    onChange={(e) => setOptions({ ...options, maxSizeMB: parseFloat(e.target.value) })}
                  />
                  <p className="hint-text">Lower size results in higher compression and potential quality loss.</p>
                </div>
              </div>

              <div className="tool-actions">
                {!compressedFile ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleCompress} 
                    disabled={processing}
                    style={{ width: '100%' }}
                  >
                    {processing ? "Optimizing..." : "Compress Image"}
                  </button>
                ) : (
                  <div className="result-actions">
                    <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download Compressed</button>
                    <SharingLink file={compressedFile} fileName={`compressed_${file.name}`} />
                  </div>
                )}
                <button className="btn-secondary" onClick={reset} style={{ width: '100%', marginTop: '1rem', opacity: 0.6 }}>Restart</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
