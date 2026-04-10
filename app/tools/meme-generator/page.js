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
  const canvasRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResultBlob(null);
  };

  const generateMeme = () => {
    if (!file) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Setup Text Style
      const fontSize = Math.floor(canvas.width / 10);
      ctx.font = `bold ${fontSize}px Impact, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = fontSize / 15;
      ctx.textAlign = 'center';
      
      // Top Text
      ctx.textBaseline = 'top';
      ctx.fillText(topText.toUpperCase(), canvas.width / 2, 20);
      ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 20);
      
      // Bottom Text
      ctx.textBaseline = 'bottom';
      ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
      ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
      
      canvas.toBlob((blob) => {
        setResultBlob(blob);
      }, 'image/png');
    };
    
    img.src = URL.createObjectURL(file);
  };

  useEffect(() => {
    if (file) generateMeme();
  }, [topText, bottomText, file]);

  const download = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meme_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Meme Generator</h1>
          <p>Create professional memes locally. Faster than upload/edit sites and 100% private.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            title="Upload Photo/Template" 
            subtitle="JPG, PNG, and WebP are supported."
          />
        ) : (
          <div className="tool-workspace">
             <div className="canvas-preview glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '500px', display: resultBlob ? 'inline-block' : 'none' }} />
                {!resultBlob && <p>Generating Preview...</p>}
             </div>

             <div className="tool-controls glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Top Text</label>
                  <input 
                    type="text" 
                    value={topText} 
                    onChange={(e) => setTopText(e.target.value)}
                    className="meme-input"
                    style={{ background: 'black', border: '1px solid var(--border)', padding: '12px', width: '100%', color: 'white', borderRadius: '8px', marginTop: '5px' }}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Bottom Text</label>
                  <input 
                    type="text" 
                    value={bottomText} 
                    onChange={(e) => setBottomText(e.target.value)}
                    className="meme-input"
                    style={{ background: 'black', border: '1px solid var(--border)', padding: '12px', width: '100%', color: 'white', borderRadius: '8px', marginTop: '5px' }}
                  />
                </div>

                <div className="tool-actions">
                   <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download Meme</button>
                   <div style={{ marginTop: '1rem' }}>
                      <SharingLink file={resultBlob} fileName="meme.png" />
                   </div>
                   <button className="btn-secondary" onClick={() => setFile(null)} style={{ width: '100%', marginTop: '1rem', opacity: 0.6 }}>Reset</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
