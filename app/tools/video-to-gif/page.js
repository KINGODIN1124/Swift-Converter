'use client';
import { useState, useRef, useEffect } from 'react';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';

export default function GIFMaster() {
  const [file, setFile] = useState(null);
  const [gifBlob, setGifBlob] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const ffmpegRef = useRef(null);
  const ffmpegUtilsRef = useRef(null);

  useEffect(() => {
    const loadLibs = async () => {
      try {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const utils = await import('@ffmpeg/util');
        ffmpegRef.current = new FFmpeg();
        ffmpegUtilsRef.current = utils;
      } catch (err) {
        console.error("FFmpeg load failed:", err);
      }
    };
    loadLibs();
  }, []);

  const loadFFmpeg = async () => {
    if (!ffmpegRef.current || !ffmpegUtilsRef.current) return;
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    const { toBlobURL } = ffmpegUtilsRef.current;
    
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setLoaded(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setGifBlob(null);
    if (!loaded) loadFFmpeg();
  };

  const convertToGIF = async () => {
    if (!file || !loaded || !ffmpegRef.current || !ffmpegUtilsRef.current) return;
    setProcessing(true);
    setProgress(0);
    
    const ffmpeg = ffmpegRef.current;
    const { fetchFile } = ffmpegUtilsRef.current;
    try {
      await ffmpeg.writeFile('input_video', await fetchFile(file));
      
      // Step 1: Generate high quality palette
      await ffmpeg.exec([
        '-i', 'input_video', 
        '-vf', 'fps=10,scale=320:-1:flags=lanczos,palettegen', 
        'palette.png'
      ]);
      
      // Step 2: Convert using palette
      await ffmpeg.exec([
        '-i', 'input_video', 
        '-i', 'palette.png', 
        '-filter_complex', 'fps=10,scale=320:-1:flags=lanczos[x];[x][1:v]paletteuse', 
        'output.gif'
      ]);
      
      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data.buffer], { type: 'image/gif' });
      setGifBlob(blob);
    } catch (error) {
      console.error("GIF creation failed:", error);
      alert("Something went wrong during GIF creation.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!gifBlob) return;
    const url = URL.createObjectURL(gifBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.split('.')[0]}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">GIF Master</h1>
          <p>Create high-quality, high-fidelity GIFs from your video files instantly.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="video/*" 
            title="Upload Video" 
            subtitle="Drop your MP4 or MOV file to turn it into a GIF."
          />
        ) : (
          <div className="tool-workspace">
            <div className="file-info glass-card">
              <video src={URL.createObjectURL(file)} controls style={{ width: '100%', borderRadius: '12px' }} />
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>{file.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ready for GIF conversion</p>
              </div>
            </div>

            <div className="tool-controls glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <div className="status-info" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                 {processing && (
                   <div className="progress-bar-minimal">
                      <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Creating Magic ({progress}%)...</p>
                      <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--primary)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
                      </div>
                   </div>
                 )}
              </div>

              <div className="tool-actions">
                {!gifBlob ? (
                  <button 
                    className="btn-primary" 
                    onClick={convertToGIF} 
                    disabled={!loaded || processing}
                    style={{ width: '100%' }}
                  >
                    {!loaded ? "Loading Engine..." : processing ? "Rendering GIF..." : "Create High-Quality GIF"}
                  </button>
                ) : (
                  <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download GIF</button>
                    <SharingLink file={gifBlob} fileName="animation.gif" />
                    <button className="btn-secondary" onClick={() => setGifBlob(null)}>Convert more</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
