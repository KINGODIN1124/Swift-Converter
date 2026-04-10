'use client';
import { useState } from 'react';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';

export default function WordToPDF() {
  const [files, setFiles] = useState([]);
  const [zipBlob, setZipBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles];
    setFiles(fileArray);
    setZipBlob(null);
    setProgress({ current: 0, total: 0 });
  };

  const convertDocument = async (file) => {
    const html2pdf = (await import('html2pdf.js')).default;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;
    
    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.padding = '40px';
    element.style.color = '#000';
    element.style.backgroundColor = '#fff';
    element.style.width = '800px'; 
    element.className = 'docx-to-pdf-content';
    
    const opt = {
      margin: 1,
      filename: `${file.name.split('.')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    const pdfBlob = await html2pdf().from(element).set(opt).outputPdf('blob');
    return { name: `${file.name.split('.')[0]}.pdf`, blob: pdfBlob };
  };

  const handleBatchConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress({ current: 0, total: files.length });
    
    const zip = new JSZip();
    const folder = zip.folder(`swift_pdfs_${new Date().getTime()}`);

    try {
      for (let i = 0; i < files.length; i++) {
        const result = await convertDocument(files[i]);
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
    link.download = `converted_documents.zip`;
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
          <h1 className="gradient-text">Word to PDF</h1>
          <p>Production Speed. Process multiple Word documents locally and download as a ZIP package.</p>
        </div>

        {files.length === 0 ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept=".docx" 
            multiple={true}
            title="Upload Documents" 
            subtitle="Drag multiple .docx files to start batch conversion."
          />
        ) : (
          <div className="tool-workspace refinement-grid" style={{ gridTemplateColumns: '1fr 360px' }}>
            <div className="file-list-preview glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '2rem' }}>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '15px', width: '100%', maxHeight: '400px', overflowY: 'auto' }}>
                  {files.map((f, i) => (
                    <div key={i} className="glass-card" style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '12px' }}>
                       <span style={{ fontSize: '1.5rem' }}>📄</span>
                       <span style={{ fontSize: '0.6rem', marginTop: '5px', color: 'var(--text-dim)', textAlign: 'center', padding: '0 5px', wordBreak: 'break-all' }}>{f.name}</span>
                    </div>
                  ))}
               </div>
               
               {processing && (
                 <div style={{ width: '100%', marginTop: '2rem' }}>
                    <p style={{ fontSize: '0.75rem', marginBottom: '8px', color: 'var(--secondary)' }}>Converting Doc {progress.current} of {progress.total}</p>
                    <div style={{ height: '4px', background: '#111', borderRadius: '2px', overflow: 'hidden' }}>
                       <div style={{ height: '100%', background: 'var(--primary)', width: `${(progress.current / progress.total) * 100}%`, transition: 'width 0.2s' }} />
                    </div>
                 </div>
               )}
            </div>

            <div className="controls-panel glass-card" style={{ padding: '1.5rem' }}>
               <div className="batch-info">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Batch Status</label>
                  <p style={{ fontSize: '0.8rem', color: '#fff' }}>Converting {files.length} documents to PDF. Every file is processed 100% locally in your session.</p>
               </div>

               <div className="tool-actions" style={{ marginTop: '2.5rem' }}>
                  {!zipBlob ? (
                    <button 
                      className="btn-primary" 
                      onClick={handleBatchConvert} 
                      disabled={processing}
                      style={{ width: '100%' }}
                    >
                      {processing ? "🏭 Processing Collection..." : `🚀 Convert ${files.length} Docs`}
                    </button>
                  ) : (
                    <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download ZIP Package</button>
                       <SharingLink file={zipBlob} fileName="converted_docs.zip" />
                    </div>
                  )}
                  <button className="btn-secondary" onClick={reset} style={{ width: '100%', marginTop: '1rem', opacity: 0.6 }}>Restart</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
