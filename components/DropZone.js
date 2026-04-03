'use client';
import { useState, useRef } from 'react';
import './DropZone.css';

export default function DropZone({ onFileSelect, accept, multiple = false, title, subtitle }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(multiple ? files : files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileSelect(multiple ? files : files[0]);
    }
  };

  return (
    <div 
      className={`drop-zone glass-card ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={accept} 
        multiple={multiple}
        style={{ display: 'none' }}
      />
      <div className="drop-zone-content">
        <div className="drop-icon">📤</div>
        <h3>{title || 'Click or drag file to this area to upload'}</h3>
        <p>{subtitle || 'Support for a single or bulk upload. Strictly prohibit from uploading company data or other sensitive files.'}</p>
      </div>
    </div>
  );
}
