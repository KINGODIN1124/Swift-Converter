'use client';
import { useState, useEffect, useRef } from 'react';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';

export default function BackgroundEraser() {
  const [file, setFile] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [engine, setEngine] = useState(null);
  
  // Touch-up states
  const [isRefining, setIsRefining] = useState(false);
  const [brushMode, setBrushMode] = useState('erase'); // 'erase' or 'restore'
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef(null);
  const originalImgRef = useRef(null);

  useEffect(() => {
    const loadEngine = async () => {
      try {
        const removeBackground = (await import('@imgly/background-removal')).default;
        setEngine(() => removeBackground);
        setIsLoaded(true);
      } catch (err) {
        console.error("AI Engine load failed:", err);
      }
    };
    loadEngine();
  }, []);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResultBlob(null);
    setIsRefining(false);
    
    const img = new Image();
    img.onload = () => { originalImgRef.current = img; };
    img.src = URL.createObjectURL(selectedFile);
  };

  const removeBackground = async () => {
    if (!file || !engine) return;
    setProcessing(true);
    try {
      const blob = await engine(file);
      setResultBlob(blob);
    } catch (err) {
      console.error("AI isolation failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const startRefining = () => {
    setIsRefining(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = URL.createObjectURL(resultBlob);
    }, 100);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scale, (e.clientY - rect.top) * scale);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const ctx = canvas.getContext('2d');
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // Restore mode: Paint with the original image
      ctx.globalCompositeOperation = 'source-over';
      // To simulate "painting back", we use the original image as a pattern/clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(originalImgRef.current, 0, 0);
      ctx.restore();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => setResultBlob(blob), 'image/png');
  };

  const download = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pro_isolated_${file.name.split('.')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">AI Background Eraser</h1>
          <p>Pro-grade subjects. Combine powerful AI with manual high-precision touch-ups.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            title="Upload Photo" 
            subtitle="AI removes background locally. Then, you can fine-tune the result."
          />
        ) : (
          <div className="tool-workspace refinement-grid" style={{ gridTemplateColumns: isRefining ? '1fr 340px' : '1fr' }}>
            <div className={`preview-area glass-card ${isRefining ? 'editing' : ''}`} style={{ textAlign: 'center', background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Crect width=\'20\' height=\'20\' fill=\'%23000\'/%3E%3Crect width=\'10\' height=\'10\' fill=\'%23111\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23111\'/%3E%3C/svg%3E")', borderRadius: '20px', padding: '10px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {!resultBlob ? (
                 <img src={URL.createObjectURL(file)} alt="Original" style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '12px' }} />
               ) : (
                 !isRefining ? (
                    <img src={URL.createObjectURL(resultBlob)} alt="AI Result" style={{ maxWidth: '100%', maxHeight: '500px' }} />
                 ) : (
                    <canvas 
                      ref={canvasRef} 
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      style={{ maxWidth: '100%', maxHeight: '600px', cursor: 'crosshair' }} 
                    />
                 )
               )}
            </div>

            {resultBlob && (
              <div className="controls-area glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 {!isRefining ? (
                    <div className="post-ai-actions">
                       <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>AI Processing Complete</h3>
                       <button className="btn-secondary" onClick={startRefining} style={{ width: '100%', marginBottom: '1rem' }}>🖌️ Manual Touch-up / Refine</button>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download File</button>
                          <SharingLink file={resultBlob} fileName="isolated.png" />
                          <button className="btn-secondary" onClick={() => setFile(null)} style={{ opacity: 0.6 }}>Reset</button>
                       </div>
                    </div>
                 ) : (
                    <div className="refine-controls">
                       <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Refinement Studio</label>
                       
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1.5rem' }}>
                          <button 
                            className={`btn-secondary btn-sm ${brushMode === 'erase' ? 'btn-active' : ''}`}
                            onClick={() => setBrushMode('erase')}
                          >
                             🧹 Erase
                          </button>
                          <button 
                            className={`btn-secondary btn-sm ${brushMode === 'restore' ? 'btn-active' : ''}`}
                            onClick={() => setBrushMode('restore')}
                          >
                             ✨ Restore
                          </button>
                       </div>

                       <div className="brush-settings">
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '5px', display: 'block' }}>Brush Size: {brushSize}px</label>
                          <input 
                            type="range" 
                            min="5" max="100" 
                            value={brushSize} 
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            style={{ width: '100%' }}
                          />
                       </div>

                       <div className="refine-actions" style={{ marginTop: '2rem' }}>
                          <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Save & Download</button>
                          <div style={{ marginTop: '1rem' }}>
                             <SharingLink file={resultBlob} fileName="refined.png" />
                          </div>
                          <button className="btn-secondary" onClick={() => setIsRefining(false)} style={{ width: '100%', marginTop: '1rem', opacity: 0.6 }}>Done Refining</button>
                       </div>
                    </div>
                 )}
              </div>
            )}

            {!resultBlob && (
              <div className="tool-controls glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
                 <button 
                   className="btn-primary" 
                   onClick={removeBackground} 
                   disabled={!isLoaded || processing}
                   style={{ width: '100%' }}
                 >
                   {!isLoaded ? "Loading AI..." : processing ? "AI Isolating Subject..." : "🪄 Process with AI"}
                 </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
         .editing { border: 2px solid var(--secondary) !important; }
         .btn-active { background: var(--secondary) !important; color: black !important; }
      `}</style>
    </div>
  );
}
