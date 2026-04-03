'use client';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import DropZone from '@/components/DropZone';
import './tool.css';

export default function ImageCompressor() {
  const [file, setFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
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
          <p>Reduce file size without losing quality. Your images never leave your browser.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            title="Upload Image" 
            subtitle="Select a JPG, PNG, or WebP image to compress."
          />
        ) : (
          <div className="tool-workspace">
            <div className="file-info glass-card">
              <div className="file-preview">
                <img src={URL.createObjectURL(file)} alt="Original Preview" />
              </div>
              <div className="file-details">
                <h3>{file.name}</h3>
                <p>Original Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                {compressedFile && (
                  <p className="success-text">Compressed Size: {(compressedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                )}
              </div>
            </div>

            <div className="tool-controls glass-card">
              <div className="control-group">
                <label>Target Size (MB)</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="5" 
                  step="0.1" 
                  value={options.maxSizeMB} 
                  onChange={(e) => setOptions({ ...options, maxSizeMB: parseFloat(e.target.value) })}
                />
                <span>{options.maxSizeMB} MB</span>
              </div>

              <div className="tool-actions">
                {!compressedFile ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleCompress} 
                    disabled={processing}
                  >
                    {processing ? "Compressing..." : "Compress Image"}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={download}>Download Compressed Image</button>
                )}
                <button className="btn-secondary" onClick={reset}>Try another file</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
