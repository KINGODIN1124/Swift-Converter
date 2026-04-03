'use client';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import DropZone from '@/components/DropZone';
import '../image-compressor/tool.css';
import './pdf-merge.css';

export default function PDFMerger() {
  const [files, setFiles] = useState([]);
  const [mergedPdf, setMergedPdf] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = (newFiles) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setMergedPdf(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    try {
      const mergedPdfDoc = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdfDoc.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
      }

      const mergedPdfBytes = await mergedPdfDoc.save();
      const mergedBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      setMergedPdf(mergedBlob);
    } catch (error) {
      console.error("PDF Merge failed:", error);
      alert("Something went wrong during merging.");
    } finally {
      setProcessing(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setMergedPdf(null);
  };

  const download = () => {
    if (!mergedPdf) return;
    const url = URL.createObjectURL(mergedPdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = `merged_document.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">PDF Merger</h1>
          <p>Combine multiple PDF files into one. Fast, secure, and private.</p>
        </div>

        <div className="pdf-merge-workspace">
          <div className="upload-section">
            <DropZone 
              onFileSelect={handleFileSelect} 
              accept=".pdf" 
              multiple={true}
              title="Add PDF Files" 
              subtitle="Drag multiple PDF files here or click to browse."
            />
          </div>

          {files.length > 0 && (
            <div className="pdf-list-section glass-card">
              <div className="list-header">
                <h3>Files to Merge ({files.length})</h3>
                <button className="btn-secondary btn-sm" onClick={() => setFiles([])}>Clear All</button>
              </div>
              <ul className="pdf-list">
                {files.map((file, index) => (
                  <li key={index} className="pdf-item">
                    <span className="pdf-icon">📄</span>
                    <span className="pdf-name">{file.name}</span>
                    <button className="remove-btn" onClick={() => removeFile(index)}>✕</button>
                  </li>
                ))}
              </ul>
              
              <div className="pdf-actions">
                {!mergedPdf ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleMerge} 
                    disabled={files.length < 2 || processing}
                  >
                    {processing ? "Merging..." : "Merge PDF Files"}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={download}>Download Merged PDF</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
