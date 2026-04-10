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
      // -ss for start, -to for end, -c copy for fast processing without re-encoding
      await ffmpeg.exec(['-ss', startTime, '-to', endTime, '-i', 'input_audio', '-c', 'copy', 'output_trim.mp3']);
      
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
    link.download = `clip_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Audio Snipper</h1>
          <p>Cut and trim your audio files with frame-perfect precision.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="audio/*" 
            title="Upload Audio" 
            subtitle="Drop your MP3, WAV or OGG file here."
          />
        ) : (
          <div className="tool-workspace">
            <div className="file-info glass-card">
              <audio src={URL.createObjectURL(file)} controls style={{ width: '100%' }} />
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>{file.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ready for trimming</p>
              </div>
            </div>

            <div className="tool-controls glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <div className="range-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="control-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700 }}>START (HH:MM:SS)</label>
                  <input 
                    type="text" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)} 
                    style={{ background: 'black', border: '1px solid var(--border)', padding: '10px', width: '100%', color: 'white', borderRadius: '8px', marginTop: '5px' }}
                  />
                </div>
                <div className="control-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 700 }}>END (HH:MM:SS)</label>
                  <input 
                    type="text" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                    style={{ background: 'black', border: '1px solid var(--border)', padding: '10px', width: '100%', color: 'white', borderRadius: '8px', marginTop: '5px' }}
                  />
                </div>
              </div>

              <div className="tool-actions">
                {!trimmedBlob ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleTrim} 
                    disabled={!loaded || processing}
                    style={{ width: '100%' }}
                  >
                    {!loaded ? "Loading Engine..." : processing ? `Trimming... ${progress}%` : "Cut Snippet"}
                  </button>
                ) : (
                  <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download Snippet</button>
                    <SharingLink file={trimmedBlob} fileName="clip.mp3" />
                    <button className="btn-secondary" onClick={() => setTrimmedBlob(null)}>Trim more</button>
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
