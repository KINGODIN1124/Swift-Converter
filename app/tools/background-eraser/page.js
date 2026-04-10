'use client';
import { useState, useEffect } from 'react';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';

export default function BackgroundEraser() {
  const [file, setFile] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [engine, setEngine] = useState(null);

  useEffect(() => {
    // Lazily load the heavy AI library
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
  };

  const removeBackground = async () => {
    if (!file || !engine) return;
    setProcessing(true);
    try {
      const blob = await engine(file, {
        progress: (key, current, total) => {
          console.log(`AI Engine: ${key} ${current}/${total}`);
        }
      });
      setResultBlob(blob);
    } catch (err) {
      console.error("Background removal failed:", err);
      alert("AI isolation failed. This can happen on lower-end devices with large images.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `no_bg_${file.name.split('.')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">AI Background Eraser</h1>
          <p>Remove backgrounds instantly using local AI. 100% private, zero data leaves your device.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            title="Select Image" 
            subtitle="JPG, PNG, and WebP are supported. AI works best with clear subjects."
          />
        ) : (
          <div className="tool-workspace">
            <div className="file-info glass-card" style={{ textAlign: 'center' }}>
               {!resultBlob ? (
                 <img src={URL.createObjectURL(file)} alt="Original" style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '400px' }} />
               ) : (
                 <div className="result-preview" style={{ background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Crect width=\'20\' height=\'20\' fill=\'%23000\'/%3E%3Crect width=\'10\' height=\'10\' fill=\'%23111\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23111\'/%3E%3C/svg%3E")', borderRadius: '12px', padding: '20px' }}>
                   <img src={URL.createObjectURL(resultBlob)} alt="Result" style={{ maxWidth: '100%', maxHeight: '400px' }} />
                 </div>
               )}
            </div>

            <div className="tool-controls glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <div className="tool-actions">
                {!resultBlob ? (
                  <button 
                    className="btn-primary" 
                    onClick={removeBackground} 
                    disabled={!isLoaded || processing}
                    style={{ width: '100%' }}
                  >
                    {!isLoaded ? "Initializing AI Engine..." : processing ? "AI is isolating subject..." : "✨ Remove Background"}
                  </button>
                ) : (
                  <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download Isolated Image</button>
                    <SharingLink file={resultBlob} fileName="no_bg.png" />
                    <button className="btn-secondary" onClick={() => setResultBlob(null)}>Try another</button>
                  </div>
                )}
                {!isLoaded && !processing && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '1rem' }}>
                    *First run takes longer while loading the AI model.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
