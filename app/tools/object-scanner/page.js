'use client';
import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import SharingLink from '@/components/SharingLink';
import DropZone from '@/components/DropZone';
import '../image-compressor/tool.css';

export default function ObjectScanner() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setExtractedText('');
    setProgress(0);
  };

  const scanObject = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    
    try {
      // Lazy load tesseract to avoid SSR errors
      const { createWorker } = await import('tesseract.js');
      
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const { data: { text } } = await worker.recognize(file);
      setExtractedText(text);
      await worker.terminate();
    } catch (err) {
      console.error("OCR failed:", err);
      alert("Text recognition failed. Please try a clearer image.");
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(extractedText, 180);
    doc.text(splitText, 15, 20);
    doc.save(`scan_${file.name.split('.')[0]}.pdf`);
  };

  const exportWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
            "xmlns:w='urn:schemas-microsoft-com:office:word' "+
            "xmlns='http://www.w3.org/TR/REC-html40'>"+
            "<head><meta charset='utf-8'><title>Export HTML to Word</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + `<p style="white-space: pre-wrap;">${extractedText}</p>` + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scan_${file.name.split('.')[0]}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Object Scanner (OCR)</h1>
          <p>Scan & Export. Transform snapshots into professional PDF and Word documents instantly.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept="image/*" 
            title="Upload Photo" 
            subtitle="AI reads text from images 100% locally."
          />
        ) : (
          <div className="tool-workspace refinement-grid" style={{ gridTemplateColumns: extractedText ? '1fr 360px' : '1fr' }}>
            <div className="preview-area glass-card" style={{ padding: '1rem', background: '#000', borderRadius: '20px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {!extractedText ? (
                 <div style={{ textAlign: 'center', width: '100%' }}>
                    <img src={URL.createObjectURL(file)} alt="Original" style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '12px' }} />
                    {processing && (
                      <div style={{ marginTop: '2rem', padding: '0 2rem' }}>
                         <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '8px' }}>AI reading: {progress}%</p>
                         <div style={{ height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--accent-gradient)', width: `${progress}%`, transition: 'width 0.2s' }} />
                         </div>
                      </div>
                    )}
                 </div>
               ) : (
                 <textarea 
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    style={{ width: '100%', height: '500px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', outline: 'none', padding: '1rem', whiteSpace: 'pre-wrap' }}
                 />
               )}
            </div>

            {extractedText && (
              <div className="controls-area glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div className="export-hub">
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Professional Export</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                       <button className={`btn-primary ${isCopied ? 'copied' : ''}`} onClick={copyToClipboard} style={{ background: isCopied ? 'var(--secondary)' : '' }}>
                          {isCopied ? '✅ Copied!' : '📋 Copy to Clipboard'}
                       </button>
                       <button className="btn-secondary" onClick={exportPDF} style={{ width: '100%' }}>📄 Export as PDF Document</button>
                       <button className="btn-secondary" onClick={exportWord} style={{ width: '100%' }}>📝 Export as Word File</button>
                    </div>
                 </div>

                 <div className="sharing-hub" style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Collaborate</label>
                    <SharingLink file={new Blob([extractedText], { type: 'text/plain' })} fileName="extracted_text.txt" />
                 </div>

                 <button className="btn-secondary" onClick={() => setFile(null)} style={{ marginTop: 'auto', opacity: 0.6 }}>Scan another image</button>
              </div>
            )}

            {!extractedText && !processing && (
               <div className="tool-controls glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                  <button className="btn-primary" onClick={scanObject} style={{ width: '100%' }}>🔍 Extract Text from Image</button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
