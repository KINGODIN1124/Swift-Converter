'use client';
import { useState, useRef, useEffect } from 'react';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';

export default function MemeGenerator() {
  const [file, setFile] = useState(null);
  const [topText, setTopText] = useState('SWIFTCONVERT');
  const [bottomText, setBottomText] = useState('IS AWESOME');
  const [resultBlob, setResultBlob] = useState(null);
  const [brushColor, setBrushColor] = useState('#00fff2');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const mainCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const compositeCanvasRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResultBlob(null);
  };

  const drawBase = () => {
    if (!file) return;
    const canvas = mainCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Also scale the drawing canvas to match
      const drawCanvas = drawCanvasRef.current;
      if (drawCanvas.width !== img.width) {
         drawCanvas.width = img.width;
         drawCanvas.height = img.height;
      }

      ctx.drawImage(img, 0, 0);
      
      const fontSize = Math.floor(canvas.width / 12);
      ctx.font = `bold ${fontSize}px Impact, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = fontSize / 15;
      ctx.textAlign = 'center';
      
      ctx.textBaseline = 'top';
      ctx.fillText(topText.toUpperCase(), canvas.width / 2, 20);
      ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 20);
      
      ctx.textBaseline = 'bottom';
      ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
      ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);

      combineAndExport();
    };
    img.src = URL.createObjectURL(file);
  };

  const startDrawing = (e) => {
    const canvas = drawCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    combineAndExport();
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    combineAndExport();
  };

  const combineAndExport = () => {
    const main = mainCanvasRef.current;
    const draw = drawCanvasRef.current;
    const composite = compositeCanvasRef.current;
    
    composite.width = main.width;
    composite.height = main.height;
    const ctx = composite.getContext('2d');
    
    ctx.drawImage(main, 0, 0);
    ctx.drawImage(draw, 0, 0);
    
    composite.toBlob((blob) => {
      setResultBlob(blob);
    }, 'image/png');
  };

  useEffect(() => {
    if (file) drawBase();
  }, [topText, bottomText, file]);

  const download = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meme_${file.name.split('.')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Meme Studio</h1>
          <p>Caption, draw, and highlight. Private local creative workshop.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            title="Upload Template" 
            subtitle="JPG, PNG, and WebP are supported."
          />
        ) : (
          <div className="tool-workspace refinement-grid" style={{ gridTemplateColumns: '1fr 380px' }}>
            <div className="meme-editor glass-card" style={{ position: 'relative', overflow: 'hidden', background: '#000', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <canvas ref={mainCanvasRef} style={{ display: 'none' }} />
                <div style={{ position: 'relative', cursor: 'crosshair', maxWidth: '100%', maxHeight: '600px' }}>
                   <canvas 
                     ref={drawCanvasRef} 
                     onMouseDown={startDrawing}
                     onMouseMove={draw}
                     onMouseUp={stopDrawing}
                     onMouseLeave={stopDrawing}
                     style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }} 
                   />
                   <img src={mainCanvasRef.current ? mainCanvasRef.current.toDataURL() : ''} alt="Meme Preview" style={{ maxWidth: '100%', maxHeight: '600px', display: 'block' }} />
                </div>
                {/* Hidden composite canvas */}
                <canvas ref={compositeCanvasRef} style={{ display: 'none' }} />
            </div>

            <div className="controls-panel glass-card" style={{ padding: '1.5rem' }}>
               <div className="studio-tabs">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Text Controls</label>
                  <input 
                    type="text" 
                    value={topText} 
                    onChange={(e) => setTopText(e.target.value)}
                    placeholder="TOP TEXT"
                    style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', marginBottom: '0.5rem' }}
                  />
                  <input 
                    type="text" 
                    value={bottomText} 
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder="BOTTOM TEXT"
                    style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                  />
               </div>

               <div className="brush-controls" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                     <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Brush Studio</label>
                     <button className="btn-secondary btn-sm" onClick={clearDrawing} style={{ fontSize: '0.6rem', padding: '4px 8px' }}>Clear Sketch</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
                     <input 
                       type="color" 
                       value={brushColor} 
                       onChange={(e) => setBrushColor(e.target.value)}
                       style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                     />
                     <div style={{ flex: 1 }}>
                        <input 
                          type="range" 
                          min="1" max="50" 
                          value={brushSize} 
                          onChange={(e) => setBrushSize(e.target.value)}
                          style={{ width: '100%' }}
                        />
                     </div>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Drag on the image to sketch over your meme.</p>
               </div>

               <div className="tool-actions" style={{ marginTop: '2.5rem' }}>
                  <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Save High-Res Meme</button>
                  <div style={{ marginTop: '1rem' }}>
                    <SharingLink file={resultBlob} fileName="viral_meme.png" />
                  </div>
                  <button className="btn-secondary" onClick={() => setFile(null)} style={{ width: '100%', marginTop: '1rem', opacity: 0.6 }}>Swap Template</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
