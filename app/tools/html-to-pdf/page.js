'use client';
import { useState, useRef } from 'react';
import SharingLink from '@/components/SharingLink';
import DropZone from '@/components/DropZone';
import '../image-compressor/tool.css';
import './html-to-pdf.css';

export default function HTMLToPDF() {
  const [html, setHtml] = useState('<h1>Hello SwiftConvert!</h1>\n<p>Start typing your HTML code here to see a live preview and convert it to a professional PDF document.</p>');
  const [pdfBlob, setPdfBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState(10);
  
  const handleConvert = async () => {
    if (!html) return;
    setProcessing(true);
    setPdfBlob(null);

    try {
      // Lazy load html2pdf to avoid SSR errors
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: [margin, margin],
        filename: 'swift_document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: orientation }
      };

      const worker = html2pdf().from(html).set(opt);
      const output = await worker.outputPdf('blob');
      setPdfBlob(output);
    } catch (error) {
      console.error("HTML to PDF failed:", error);
      alert("Something went wrong during conversion.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `html_document.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">HTML to PDF</h1>
          <p>Geometry Control. Format your code into professional documents with custom margins & orientation.</p>
        </div>

        <div className="html-pdf-workspace refinement-grid" style={{ gridTemplateColumns: '1fr 360px' }}>
          <div className="main-editor-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="editor-section glass-card">
                <div className="label-bar" style={{ padding: '10px 15px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>HTML Code Editor</label>
                  <button onClick={() => setHtml('')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.7rem' }}>Clear All</button>
                </div>
                <textarea 
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="Paste your HTML here..."
                  style={{ width: '100%', height: '300px', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.95rem', outline: 'none', padding: '1rem', fontFamily: 'monospace' }}
                />
              </div>

              <div className="preview-section glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                 <div style={{ padding: '10px 15px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Desktop Preview</label>
                 </div>
                 <div 
                    className="html-preview"
                    dangerouslySetInnerHTML={{ __html: html }}
                    style={{ padding: '2rem', background: '#fff', color: '#000', minHeight: '300px', overflowY: 'auto' }}
                 />
              </div>
          </div>

          <div className="controls-panel glass-card" style={{ padding: '1.5rem' }}>
             <div className="geometry-studio">
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block' }}>Geometry Studio</label>
                
                <div className="control-group" style={{ marginBottom: '1.5rem' }}>
                   <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Orientation</label>
                   <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setOrientation('portrait')}
                        className={`btn-secondary btn-sm ${orientation === 'portrait' ? 'btn-active' : ''}`}
                        style={{ flex: 1 }}
                      >
                         📄 Portrait
                      </button>
                      <button 
                        onClick={() => setOrientation('landscape')}
                        className={`btn-secondary btn-sm ${orientation === 'landscape' ? 'btn-active' : ''}`}
                        style={{ flex: 1 }}
                      >
                         🖼️ Landscape
                      </button>
                   </div>
                </div>

                <div className="control-group">
                   <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Margins: {margin}mm</label>
                   <input 
                      type="range" 
                      min="0" max="40" 
                      step="5"
                      value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value))}
                      style={{ width: '100%' }}
                   />
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '5px' }}>
                      <span>None</span>
                      <span>Normal</span>
                      <span>Wide</span>
                   </div>
                </div>
             </div>

             <div className="tool-actions" style={{ marginTop: '2.5rem' }}>
                {!pdfBlob ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleConvert}
                    disabled={!html || processing}
                    style={{ width: '100%' }}
                  >
                    {processing ? '⏳ Formatting PDF...' : '✨ Create PDF'}
                  </button>
                ) : (
                  <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download PDF</button>
                    <SharingLink file={pdfBlob} fileName="web_document.pdf" />
                    <button className="btn-secondary" onClick={() => setPdfBlob(null)} style={{ opacity: 0.6 }}>Revise Layout</button>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
      <style jsx>{`
         .btn-active { background: var(--secondary) !important; color: black !important; }
      `}</style>
    </div>
  );
}
