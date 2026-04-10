'use client';
import { useState, useRef, useEffect } from 'react';
import { ID3Writer } from 'browser-id3-writer';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';

export default function VideoToMP3() {
  const [file, setFile] = useState(null);
  const [mp3Blob, setMp3Blob] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [meta, setMeta] = useState({ title: '', artist: '', album: '' });
  
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
        console.error("FFmpeg library load failed:", err);
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
      console.error("FFmpeg load failed:", err);
      alert("Failed to initialize video converter.");
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setMp3Blob(null);
    setMeta({ title: selectedFile.name.split('.')[0], artist: 'SwiftConvert', album: 'Extracted Audio' });
    if (!loaded) loadFFmpeg();
  };

  const convertToMP3 = async () => {
    if (!file || !loaded || !ffmpegRef.current || !ffmpegUtilsRef.current) return;
    setProcessing(true);
    setProgress(0);
    
    const ffmpeg = ffmpegRef.current;
    const { fetchFile } = ffmpegUtilsRef.current;
    try {
      await ffmpeg.writeFile('input_video', await fetchFile(file));
      await ffmpeg.exec(['-i', 'input_video', '-vn', '-acodec', 'libmp3lame', '-q:a', '2', 'output.mp3']);
      
      const data = await ffmpeg.readFile('output.mp3');
      
      // Inject Metadata using browser-id3-writer
      const writer = new ID3Writer(data.buffer);
      writer.setFrame('TIT2', meta.title)
            .setFrame('TPE1', [meta.artist])
            .setFrame('TALB', meta.album);
      writer.addTag();
      
      const taggedBlob = new Blob([writer.arrayBuffer], { type: 'audio/mpeg' });
      setMp3Blob(taggedBlob);
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
    link.download = `${meta.title || 'audio'}.mp3`;
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
          <p>Extract & Tag. Professional audio extraction with full ID3 metadata control.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="video/*" 
            title="Upload Video" 
            subtitle="MP4, MOV, and AVI supported."
          />
        ) : (
          <div className="tool-workspace refinement-grid" style={{ gridTemplateColumns: '1fr 380px' }}>
            <div className="media-preview glass-card" style={{ padding: '1rem', background: '#000', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <video src={URL.createObjectURL(file)} controls style={{ width: '100%', maxHeight: '450px', borderRadius: '12px' }} />
            </div>

            <div className="controls-panel glass-card" style={{ padding: '1.5rem' }}>
               <div className="metadata-editor">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>MP3 Metadata Studio</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                     <div className="input-group">
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Song Title</label>
                        <input 
                          type="text" 
                          value={meta.title} 
                          onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                          style={{ width: '100%', background: '#111', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
                        />
                     </div>
                     <div className="input-group">
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Artist</label>
                        <input 
                          type="text" 
                          value={meta.artist} 
                          onChange={(e) => setMeta({ ...meta, artist: e.target.value })}
                          style={{ width: '100%', background: '#111', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
                        />
                     </div>
                     <div className="input-group">
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Album</label>
                        <input 
                          type="text" 
                          value={meta.album} 
                          onChange={(e) => setMeta({ ...meta, album: e.target.value })}
                          style={{ width: '100%', background: '#111', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: '#fff' }}
                        />
                     </div>
                  </div>
               </div>

               <div className="extraction-status" style={{ marginTop: '1.5rem', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                  {!loaded && <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', textAlign: 'center', width: '100%' }}>🔄 Initializing Audio Engine...</p>}
                  {processing && (
                    <div style={{ width: '100%' }}>
                       <p style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Extracting: {progress}%</p>
                       <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--accent-gradient)', width: `${progress}%`, transition: 'width 0.2s' }} />
                       </div>
                    </div>
                  )}
               </div>

               <div className="tool-actions" style={{ marginTop: '1.5rem' }}>
                  {!mp3Blob ? (
                    <button 
                      className="btn-primary" 
                      onClick={convertToMP3} 
                      disabled={!loaded || processing}
                      style={{ width: '100%' }}
                    >
                      {processing ? "Baking Metadata..." : "🎵 Generate MP3"}
                    </button>
                  ) : (
                    <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download Tagged MP3</button>
                       <SharingLink file={mp3Blob} fileName={`${meta.title}.mp3`} />
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
