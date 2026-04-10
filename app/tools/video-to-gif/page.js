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
  
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('00:00:05');

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
      
      // Step 1: Generate high quality palette for the specific segment
      await ffmpeg.exec([
        '-ss', startTime, '-to', endTime, '-i', 'input_video', 
        '-vf', 'fps=10,scale=320:-1:flags=lanczos,palettegen', 
        'palette.png'
      ]);
      
      // Step 2: Convert using palette for the specific segment
      await ffmpeg.exec([
        '-ss', startTime, '-to', endTime, '-i', 'input_video', 
        '-i', 'palette.png', 
        '-filter_complex', 'fps=10,scale=320:-1:flags=lanczos[x];[x][1:v]paletteuse', 
        'output.gif'
      ]);
      
      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data.buffer], { type: 'image/gif' });
      setGifBlob(blob);
    } catch (error) {
      console.error("GIF creation failed:", error);
      alert("Something went wrong. Check if your timestamps are valid.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!gifBlob) return;
    const url = URL.createObjectURL(gifBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clip_${file.name.split('.')[0]}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">GIF Master</h1>
          <p>Viral precision. High-fidelity conversion with frame-perfect timeline trimming.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="video/*" 
            title="Upload Video" 
            subtitle="Select the video you want to turn into a GIF."
          />
        ) : (
          <div className="tool-workspace refinement-grid" style={{ gridTemplateColumns: '1fr 380px' }}>
            <div className="media-preview glass-card" style={{ padding: '1rem', background: '#000', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <video src={URL.createObjectURL(file)} controls style={{ width: '100%', maxHeight: '450px', borderRadius: '12px' }} />
            </div>

            <div className="controls-panel glass-card" style={{ padding: '1.5rem' }}>
               <div className="timeline-controls">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>GIF Duration</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                     <div className="input-group">
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Start (HH:MM:SS)</label>
                        <input 
                          type="text" 
                          value={startTime} 
                          onChange={(e) => setStartTime(e.target.value)}
                          style={{ width: '100%', background: '#111', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
                        />
                     </div>
                     <div className="input-group">
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>End (HH:MM:SS)</label>
                        <input 
                          type="text" 
                          value={endTime} 
                          onChange={(e) => setEndTime(e.target.value)}
                          style={{ width: '100%', background: '#111', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
                        />
                     </div>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.8rem' }}>Short 3-5 second segments work best for GIFs.</p>
               </div>

               <div className="rendering-status" style={{ marginTop: '1.5rem', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                  {!loaded && <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', textAlign: 'center', width: '100%' }}>🔄 Preparing Creative Engine...</p>}
                  {processing && (
                    <div style={{ width: '100%' }}>
                       <p style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Rendering: {progress}%</p>
                       <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--primary)', width: `${progress}%`, transition: 'width 0.2s' }} />
                       </div>
                    </div>
                  )}
               </div>

               <div className="tool-actions" style={{ marginTop: '1.5rem' }}>
                  {!gifBlob ? (
                    <button 
                      className="btn-primary" 
                      onClick={convertToGIF} 
                      disabled={!loaded || processing}
                      style={{ width: '100%' }}
                    >
                      {processing ? "Simulating Magic..." : "🎬 Build viral GIF"}
                    </button>
                  ) : (
                    <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download GIF</button>
                       <SharingLink file={gifBlob} fileName="animation.gif" />
                       <button className="btn-secondary" onClick={() => setGifBlob(null)} style={{ opacity: 0.6 }}>Change segment</button>
                    </div>
                  )}
                  <button className="btn-secondary" onClick={() => setFile(null)} style={{ width: '100%', marginTop: '1rem', opacity: 0.6 }}>Restart</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
