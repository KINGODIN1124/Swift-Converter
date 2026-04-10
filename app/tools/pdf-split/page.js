'use client';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';
import './pdf-split.css';

export default function PDFSplitter() {
  const [file, setFile] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pageRange, setPageRange] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [toolMode, setToolMode] = useState('split'); // 'split' or 'images'

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setResultBlob(null);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdf.getPageCount());
      setPageRange(`1-${pdf.getPageCount()}`);
    } catch (err) {
      console.error(err);
    }
  };

  const parseRanges = (rangeStr, total) => {
    const pages = new Set();
    const parts = rangeStr.split(',').map(p => p.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= total) pages.add(i - 1);
        }
      } else {
        const p = Number(part);
        if (p >= 1 && p <= total) pages.add(p - 1);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file || !pageRange) return;
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const splitPdfDoc = await PDFDocument.create();
      
      const pageIndices = parseRanges(pageRange, totalPages);
      const copiedPages = await splitPdfDoc.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => splitPdfDoc.addPage(page));

      const splitPdfBytes = await splitPdfDoc.save();
      setResultBlob(new Blob([splitPdfBytes], { type: 'application/pdf' }));
    } catch (error) {
      console.error("Split failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleExportImages = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress({ current: 0, total: totalPages });
    
    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
      GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const zip = new JSZip();
      const folder = zip.folder(`images_${file.name.split('.')[0]}`);

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        const imgBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        folder.file(`page_${i}.jpg`, imgBlob);
        
        setProgress(prev => ({ ...prev, current: i }));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      setResultBlob(content);
    } catch (err) {
      console.error("Export images failed:", err);
      alert("Failed to extract images. This may happen with complex encrypted PDFs.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = toolMode === 'split' ? `split_${file.name}` : `images_${file.name.split('.')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">PDF Splitter & Export</h1>
          <p>The total document workstation. Split and extract pages or convert PDFs to High-Res images.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept=".pdf" 
            title="Upload PDF Document" 
            subtitle="Local processing with no data leaks."
          />
        ) : (
          <div className="tool-workspace refinement-grid" style={{ gridTemplateColumns: '1fr 360px' }}>
            <div className="file-info glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '2rem' }}>
               <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '3rem', display: 'block' }}>📄</span>
                  <h3 style={{ margin: '1rem 0 0.5rem' }}>{file.name}</h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{totalPages} Pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
               </div>
               
               {processing && toolMode === 'images' && (
                 <div style={{ width: '100%', marginTop: '2rem' }}>
                    <p style={{ fontSize: '0.75rem', marginBottom: '8px', color: 'var(--secondary)' }}>Rendering Page {progress.current} of {progress.total}</p>
                    <div style={{ height: '4px', background: '#111', borderRadius: '2px', overflow: 'hidden' }}>
                       <div style={{ height: '100%', background: 'var(--accent-gradient)', width: `${(progress.current / progress.total) * 100}%`, transition: 'width 0.2s' }} />
                    </div>
                 </div>
               )}
            </div>

            <div className="controls-panel glass-card" style={{ padding: '1.5rem' }}>
               <div className="mode-toggle" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                  <button onClick={() => { setToolMode('split'); setResultBlob(null); }} className={`btn-secondary btn-sm ${toolMode === 'split' ? 'btn-active' : ''}`} style={{ flex: 1 }}>Split PDF</button>
                  <button onClick={() => { setToolMode('images'); setResultBlob(null); }} className={`btn-secondary btn-sm ${toolMode === 'images' ? 'btn-active' : ''}`} style={{ flex: 1 }}>To Images</button>
               </div>

               {toolMode === 'split' ? (
                 <div className="range-settings">
                   <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Split Ranges</label>
                   <input 
                      type="text" 
                      value={pageRange} 
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g. 1, 3-5, 10"
                      style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }}
                   />
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Separate ranges with commas.</p>
                 </div>
               ) : (
                 <div className="export-settings">
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Image Quality</label>
                    <p style={{ fontSize: '0.8rem', color: '#fff' }}>Every page will be rendered as a **High-Resolution (2.0x)** JPEG file and packaged into a ZIP.</p>
                 </div>
               )}

               <div className="tool-actions" style={{ marginTop: '2.5rem' }}>
                  {!resultBlob ? (
                    <button 
                      className="btn-primary" 
                      onClick={toolMode === 'split' ? handleSplit : handleExportImages} 
                      disabled={processing}
                      style={{ width: '100%' }}
                    >
                      {processing ? "Processing Workspace..." : toolMode === 'split' ? "🛠️ Split & Extract" : "📸 Convert to Images"}
                    </button>
                  ) : (
                    <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download Result</button>
                       <SharingLink file={resultBlob} fileName={toolMode === 'split' ? 'split.pdf' : 'images.zip'} />
                       <button className="btn-secondary" onClick={() => setResultBlob(null)} style={{ opacity: 0.6 }}>Change settings</button>
                    </div>
                  )}
                  <button className="btn-secondary" onClick={() => setFile(null)} style={{ width: '100%', marginTop: '1rem', opacity: 0.6 }}>Restart</button>
               </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
         .btn-active { background: var(--secondary) !important; color: black !important; }
      `}</style>
    </div>
  );
}
