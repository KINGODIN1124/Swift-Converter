'use client';
import { useState } from 'react';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';

export default function ImageResize() {
  const [file, setFile] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, originalWidth: 0, originalHeight: 0 });
  const [resizedBlob, setResizedBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const socialPresets = [
    { name: 'Insta Square', width: 1080, height: 1080, icon: '📸' },
    { name: 'Insta Story / TikTok', width: 1080, height: 1920, icon: '📱' },
    { name: 'YouTube Thumb', width: 1280, height: 720, icon: '🎬' },
    { name: 'LinkedIn Cover', width: 1584, height: 396, icon: '💼' },
    { name: 'Profile Photo', width: 500, height: 500, icon: '👤' }
  ];

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResizedBlob(null);
    
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

  const applyPreset = (preset) => {
    if (maintainAspectRatio) {
      const ratio = dimensions.originalWidth / dimensions.originalHeight;
      const targetRatio = preset.width / preset.height;
      if (ratio > targetRatio) {
        setDimensions({ ...dimensions, width: preset.width, height: Math.round(preset.width / ratio) });
      } else {
        setDimensions({ ...dimensions, height: preset.height, width: Math.round(preset.height * ratio) });
      }
    } else {
      setDimensions({ ...dimensions, width: preset.width, height: preset.height });
    }
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
        
        canvas.toBlob((blob) => {
          setResizedBlob(blob);
          setProcessing(false);
        }, file.type, 0.95);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const download = () => {
    if (!resizedBlob) return;
    const url = URL.createObjectURL(resizedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resized_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setResizedBlob(null);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Image Resizer</h1>
          <p>Dimensions optimized for Social Media. Scale your images locally and privately.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            title="Upload Image" 
            subtitle="JPG, PNG, or WebP images supported."
          />
        ) : (
          <div className="tool-workspace refinement-grid" style={{ gridTemplateColumns: '1fr 400px' }}>
            <div className="preview-section glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
               <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '500px', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <img 
                    src={resizedBlob ? URL.createObjectURL(resizedBlob) : URL.createObjectURL(file)} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                  />
                  {!resizedBlob && <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '6px', fontSize: '0.7rem' }}>Preview of {dimensions.width}x{dimensions.height}</div>}
               </div>
            </div>

            <div className="controls-grid glass-card" style={{ padding: '1.5rem' }}>
              <div className="presets-block">
                 <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Social Presets</label>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {socialPresets.map(preset => (
                      <button 
                        key={preset.name} 
                        className="btn-secondary btn-sm"
                        onClick={() => applyPreset(preset)}
                        style={{ padding: '10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                         <span>{preset.icon}</span> {preset.name}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="manual-controls" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                 <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="control-group" style={{ flex: 1 }}>
                       <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Width (px)</label>
                       <input 
                         type="number" 
                         name="width"
                         value={dimensions.width} 
                         onChange={handleDimensionChange}
                         style={{ width: '100%', background: '#111', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
                       />
                    </div>
                    <div className="control-group" style={{ flex: 1 }}>
                       <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Height (px)</label>
                       <input 
                         type="number" 
                         name="height"
                         value={dimensions.height} 
                         onChange={handleDimensionChange}
                         style={{ width: '100%', background: '#111', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
                       />
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                       type="checkbox" 
                       id="aspectRatio" 
                       checked={maintainAspectRatio} 
                       onChange={(e) => setMaintainAspectRatio(e.target.checked)} 
                    />
                    <label htmlFor="aspectRatio" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Lock Aspect Ratio</label>
                 </div>
              </div>

              <div className="tool-actions" style={{ marginTop: '2.5rem' }}>
                {!resizedBlob ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleResize} 
                    disabled={processing}
                    style={{ width: '100%' }}
                  >
                    {processing ? "Resizing..." : "Process Resize"}
                  </button>
                ) : (
                  <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download File</button>
                    <SharingLink file={resizedBlob} fileName={`resized_${file.name}`} />
                    <button className="btn-secondary" onClick={() => setResizedBlob(null)} style={{ opacity: 0.6 }}>Adjust again</button>
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
