'use client';
import { useState, useRef } from 'react';
import SharingLink from '@/components/SharingLink';
import DropZone from '@/components/DropZone';
import '../image-compressor/tool.css';
import './html-to-pdf.css';

export default function HTMLToPDF() {
  const [html, setHtml] = useState('<h1>Hello SwiftConvert!</h1>\n<p>Start typing your HTML code here to see a live preview and convert it to a PDF.</p>');
  const [pdfBlob, setPdfBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const previewRef = useRef(null);

  const handleConvert = async () => {
    if (!html) return;
    setProcessing(true);
    setPdfBlob(null);

    try {
      // Lazy load html2pdf to avoid SSR errors
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 10,
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
    link.download = `web_document.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">HTML to PDF</h1>
          <p>Instantly transform HTML snippets into professional PDF documents.</p>
        </div>

        <div className="html-pdf-workspace">
          <div className="editor-section glass-card">
            <div className="label-bar">
              <label>HTML Code Editor</label>
              <button className="btn-secondary btn-sm" onClick={() => setHtml('')}>Clear</button>
            </div>
            <textarea 
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Paste your HTML here..."
              className="html-textarea"
            />
          </div>

          <div className="preview-section glass-card">
            <label className="preview-label">Live Preview</label>
            <div 
              className="html-preview"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          <div className="actions-section glass-card">
            {!pdfBlob ? (
              <button 
                className="btn-primary" 
                onClick={handleConvert}
                disabled={!html || processing}
                style={{ width: '100%' }}
              >
                {processing ? '🔄 Converting...' : '✨ Generate PDF'}
              </button>
            ) : (
              <div className="result-actions">
                <button className="btn-primary" onClick={download}>📥 Download PDF</button>
                <SharingLink file={pdfBlob} fileName="web_document.pdf" />
                <button className="btn-secondary" onClick={() => setPdfBlob(null)}>Convert more</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
