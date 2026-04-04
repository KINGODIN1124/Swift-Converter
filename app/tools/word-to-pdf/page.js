'use client';
import { useState } from 'react';
import mammoth from 'mammoth';
import DropZone from '@/components/DropZone';
import '../image-compressor/tool.css';

export default function WordToPDF() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setDone(false);
  };

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      const element = document.createElement('div');
      element.innerHTML = html;
      element.style.padding = '40px';
      element.style.color = '#000'; // PDF needs dark text on transparent/white background
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

      await html2pdf().from(element).set(opt).save();
      setDone(true);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Something went wrong during conversion. Ensure it's a valid .docx file.");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setDone(false);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Word to PDF</h1>
          <p>Transform your documents into professional PDF files instantly. 100% private.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept=".docx" 
            title="Upload Word Document" 
            subtitle="Only .docx files are supported for conversion."
          />
        ) : (
          <div className="tool-workspace">
            <div className="file-info glass-card">
              <div className="file-preview">
                <div className="docx-icon">📄</div>
              </div>
              <div className="file-details">
                <h3>{file.name}</h3>
                <p>Type: Microsoft Word Document</p>
                <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>

            <div className="tool-controls glass-card">
              <div className="status-info">
                {processing && <p className="warning-text">Converging document...</p>}
                {done && <p className="success-text">PDF Downloaded Successfully!</p>}
              </div>

              <div className="tool-actions">
                {!done ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleConvert} 
                    disabled={processing}
                  >
                    {processing ? "Converting..." : "Convert to PDF"}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={handleConvert}>Convert Again</button>
                )}
                <button className="btn-secondary" onClick={reset}>Try another file</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .docx-icon { font-size: 3rem; color: var(--primary); }
        .warning-text { color: var(--secondary); font-weight: 600; text-align: center; }
        .status-info { min-height: 80px; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
}
