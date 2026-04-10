'use client';
import { useState } from 'react';
import JSZip from 'jszip';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';

export default function ImageConverter() {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState('image/jpeg');
  const [zipBlob, setZipBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles];
    setFiles(fileArray);
    setZipBlob(null);
  };

  const convertFile = (file, targetFormat) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            resolve({
              name: `${file.name.split('.')[0]}.${targetFormat.split('/')[1]}`,
              blob: blob
            });
          }, targetFormat, 0.9);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBatchConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress({ current: 0, total: files.length });
    
    const zip = new JSZip();
    const folderName = `swift_convert_${new Date().getTime()}`;
    const folder = zip.folder(folderName);

    try {
      for (let i = 0; i < files.length; i++) {
        const result = await convertFile(files[i], format);
        folder.file(result.name, result.blob);
        setProgress(prev => ({ ...prev, current: i + 1 }));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      setZipBlob(content);
    } catch (error) {
      console.error("Batch conversion failed:", error);
      alert("Something went wrong during batch conversion.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFiles([]);
    setZipBlob(null);
    setProgress({ current: 0, total: 0 });
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Image Converter</h1>
          <p>Batch processing for professionals. Convert multiple files and download as a ZIP.</p>
        </div>

        {files.length === 0 ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            multiple={true}
            title="Upload Images" 
            subtitle="Drag one or many images to convert them all at once."
          />
        ) : (
          <div className="tool-workspace">
            <div className="file-info glass-card" style={{ padding: '1.5rem' }}>
              <div className="batch-status">
                 <h3 style={{ margin: 0 }}>{files.length} Files Selected</h3>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                    Ready to convert to {format.split('/')[1].toUpperCase()}
                 </p>
                 
                 <div className="file-mini-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {files.map((file, i) => (
                      <div key={i} className="mini-card glass-card" style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.5rem', borderRadius: '8px' }}>
                        🖼️
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            <div className="tool-controls glass-card" style={{ padding: '1.5rem' }}>
              <div className="control-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Output Format</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['image/jpeg', 'image/png', 'image/webp'].map((f) => (
                    <button 
                      key={f}
                      className={`btn-secondary btn-sm ${format === f ? 'btn-active' : ''}`}
                      onClick={() => setFormat(f)}
                      style={{ flex: '1', border: format === f ? '1px solid var(--primary)' : '1px solid var(--border)' }}
                    >
                      {f.split('/')[1].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tool-actions" style={{ marginTop: '2rem' }}>
                {!zipBlob ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleBatchConvert} 
                    disabled={processing}
                    style={{ width: '100%' }}
                  >
                    {processing ? `Converting (${progress.current}/${progress.total})...` : `Convert ${files.length} Files`}
                  </button>
                ) : (
                  <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download ZIP Package</button>
                    <SharingLink file={zipBlob} fileName="converted_package.zip" />
                  </div>
                )}
                <button className="btn-secondary" onClick={reset} style={{ width: '100%', marginTop: '1rem', opacity: 0.6 }}>Add more files</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .btn-active {
            background: var(--bg-card) !important;
            color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}
