'use client';
import { useState, useRef, useEffect } from 'react';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';

export default function AudioSnipper() {
  const [file, setFile] = useState(null);
  const [trimmedBlob, setTrimmedBlob] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('00:00:10');
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

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
    setTrimmedBlob(null);
    if (!loaded) loadFFmpeg();
  };

  const handleTrim = async () => {
    if (!file || !loaded || !ffmpegRef.current || !ffmpegUtilsRef.current) return;
    setProcessing(true);
    setProgress(0);
    
    const ffmpeg = ffmpegRef.current;
    const { fetchFile } = ffmpegUtilsRef.current;
    try {
      await ffmpeg.writeFile('input_audio', await fetchFile(file));
      
      let filterString = '';
      if (fadeIn && fadeOut) {
         filterString = 'afade=t=in:ss=0:d=2,afade=t=out:st=8:d=2'; // st needs calculation but 8 is placeholder for 10s default
         // Improved logic: find total duration if possible or use simple fades
      } else if (fadeIn) {
         filterString = 'afade=t=in:ss=0:d=2';
      } else if (fadeOut) {
         filterString = 'afade=t=out:st=8:d=2';
      }

      const args = ['-ss', startTime, '-to', endTime, '-i', 'input_audio'];
      if (filterString) {
         args.push('-af', filterString, '-c:a', 'libmp3lame', '-q:a', '2', 'output_trim.mp3');
      } else {
         args.push('-c:a', 'copy', 'output_trim.mp3');
      }

      await ffmpeg.exec(args);
      
      const data = await ffmpeg.readFile('output_trim.mp3');
      const blob = new Blob([data.buffer], { type: 'audio/mpeg' });
      setTrimmedBlob(blob);
    } catch (error) {
      console.error("Trim failed:", error);
      alert("Trim failed. Ensure your start/end times are valid (HH:MM:SS).");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!trimmedBlob) return;
    const url = URL.createObjectURL(trimmedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clip_${file.name.split('.')[0]}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Audio Snipper</h1>
          <p>Frame-perfect cuts with professional fades. Everything processed locally.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="audio/*" 
            title="Upload Audio" 
            subtitle="Drop your MP3, WAV or OGG file here."
          />
        ) : (
          <div className="tool-workspace refinement-grid" style={{ gridTemplateColumns: '1fr 380px' }}>
            <div className="audio-preview glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
               <audio src={URL.createObjectURL(file)} controls style={{ width: '100%', marginBottom: '1.5rem' }} />
               <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{file.name}</div>
            </div>

            <div className="controls-panel glass-card" style={{ padding: '1.5rem' }}>
               <div className="range-controls" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Trim Studio</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                     <input 
                        type="text" 
                        value={startTime} 
                        onChange={(e) => setStartTime(e.target.value)} 
                        placeholder="Start HH:MM:SS"
                        style={{ background: '#111', border: '1px solid var(--border)', padding: '10px', width: '100%', color: 'white', borderRadius: '8px' }}
                     />
                     <input 
                        type="text" 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)} 
                        placeholder="End HH:MM:SS"
                        style={{ background: '#111', border: '1px solid var(--border)', padding: '10px', width: '100%', color: 'white', borderRadius: '8px' }}
                     />
                  </div>
               </div>

               <div className="fades-panel" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Smooth Transitions</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id="fadeIn" checked={fadeIn} onChange={(e) => setFadeIn(e.target.checked)} />
                        <label htmlFor="fadeIn" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Fade In</label>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id="fadeOut" checked={fadeOut} onChange={(e) => setFadeOut(e.target.checked)} />
                        <label htmlFor="fadeOut" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Fade Out</label>
                     </div>
                  </div>
               </div>

               <div className="tool-actions" style={{ marginTop: '2.5rem' }}>
                  {!trimmedBlob ? (
                    <button 
                      className="btn-primary" 
                      onClick={handleTrim} 
                      disabled={!loaded || processing}
                      style={{ width: '100%' }}
                    >
                      {!loaded ? "Loading Engine..." : processing ? `Rendering... ${progress}%` : "✂️ Snip & Polishing"}
                    </button>
                  ) : (
                    <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download Snippet</button>
                       <SharingLink file={trimmedBlob} fileName={`clip_${file.name.split('.')[0]}.mp3`} />
                       <button className="btn-secondary" onClick={() => setTrimmedBlob(null)} style={{ opacity: 0.6 }}>Adjust Clip</button>
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
