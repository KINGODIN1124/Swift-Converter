'use client';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';
import './pdf-split.css';

export default function PDFSplitter() {
  const [file, setFile] = useState(null);
  const [splitPdf, setSplitPdf] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [pageRange, setPageRange] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setSplitPdf(null);
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
      const splitBlob = new Blob([splitPdfBytes], { type: 'application/pdf' });
      setSplitPdf(splitBlob);
    } catch (error) {
      console.error("PDF Split failed:", error);
      alert("Something went wrong during splitting. Check your range format (e.g., 1, 3-5).");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!splitPdf) return;
    const url = URL.createObjectURL(splitPdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = `split_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">PDF Splitter</h1>
          <p>Extract specific pages or page ranges from your document. Local and secure.</p>
        </div>

        <div className="pdf-split-workspace">
          <div className="upload-section">
            {!file ? (
              <DropZone 
                onFileSelect={handleFileSelect} 
                accept=".pdf" 
                title="Select PDF to Split" 
                subtitle="Only one document at a time for splitting."
              />
            ) : (
              <div className="selected-file-card glass-card">
                 <div className="file-info">
                   <span className="file-icon">📄</span>
                   <div className="text-info">
                     <h3>{file.name}</h3>
                     <p>{totalPages} Pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                   </div>
                   <button className="remove-btn" onClick={() => setFile(null)}>Change</button>
                 </div>
              </div>
            )}
          </div>

          {file && (
            <div className="split-options-section glass-card">
              <div className="range-input-group">
                <label>Define Page Ranges (e.g. 1, 3-5, 8)</label>
                <input 
                  type="text" 
                  value={pageRange} 
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g., 1, 3-5"
                  className="range-input"
                />
              </div>
              
              <div className="pdf-actions">
                {!splitPdf ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleSplit} 
                    disabled={!pageRange || processing}
                  >
                    {processing ? "Splitting..." : "Extract Pages"}
                  </button>
                ) : (
                  <div className="result-actions">
                    <button className="btn-primary" onClick={download}>Download Split PDF</button>
                    <SharingLink file={splitPdf} fileName={`split_${file.name}`} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
