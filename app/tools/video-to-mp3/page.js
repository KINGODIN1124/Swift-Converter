'use client';
import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import DropZone from '@/components/DropZone';
import '../image-compressor/tool.css';

export default function VideoToMP3() {
  const [file, setFile] = useState(null);
  const [mp3Blob, setMp3Blob] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());

  const loadFFmpeg = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setLoaded(true);
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setMp3Blob(null);
    if (!loaded) loadFFmpeg();
  };

  const convertToMP3 = async () => {
    if (!file || !loaded) return;
    setProcessing(true);
    setProgress(0);
    
    const ffmpeg = ffmpegRef.current;
    try {
      await ffmpeg.writeFile('input_video', await fetchFile(file));
      await ffmpeg.exec(['-i', 'input_video', '-vn', '-acodec', 'libmp3lame', '-q:a', '2', 'output.mp3']);
      
      const data = await ffmpeg.readFile('output.mp3');
      const blob = new Blob([data.buffer], { type: 'audio/mpeg' });
      setMp3Blob(blob);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Something went wrong during conversion.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!mp3Blob) return;
    const url = URL.createObjectURL(mp3Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.split('.')[0]}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setMp3Blob(null);
    setProgress(0);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Video to MP3</h1>
          <p>Extract audio from your videos securely and locally. No file uploads.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="video/*" 
            title="Upload Video" 
            subtitle="Select an MP4, MOV, or AVI video to extract audio."
          />
        ) : (
          <div className="tool-workspace">
            <div className="file-info glass-card">
              <div className="file-preview">
                <video src={URL.createObjectURL(file)} controls width="100%" />
              </div>
              <div className="file-details">
                <h3>{file.name}</h3>
                <p>Type: {file.type}</p>
                <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            <div className="tool-controls glass-card">
              <div className="status-info">
                {!loaded && <p className="warning-text">Initializing Converter (Wait a moment)...</p>}
                {processing && (
                  <div className="progress-container">
                    <p>Processing: {progress}%</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
                {mp3Blob && <p className="success-text">Extraction Ready!</p>}
              </div>

              <div className="tool-actions">
                {!mp3Blob ? (
                  <button 
                    className="btn-primary" 
                    onClick={convertToMP3} 
                    disabled={!loaded || processing}
                  >
                    {!loaded ? "Loading..." : processing ? "Converting..." : "Extract MP3"}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={download}>Download MP3</button>
                )}
                <button className="btn-secondary" onClick={reset}>Try another file</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .warning-text { color: var(--secondary); font-weight: 600; text-align: center; }
        .progress-container { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; }
        .progress-bar { width: 100%; height: 8px; background: var(--bg-surface); border-radius: 4px; overflow: hidden; border: 1px solid var(--border); }
        .progress-fill { height: 100%; background: var(--primary); transition: width 0.3s ease; }
        .status-info { min-height: 80px; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
}
