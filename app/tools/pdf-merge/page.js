'use client';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';
import './pdf-merge.css';

export default function PDFMerger() {
  const [files, setFiles] = useState([]);
  const [mergedPdf, setMergedPdf] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

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
      setMergedPdf(new Blob([mergedPdfBytes], { type: 'application/pdf' }));
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

  const onDragStart = (index) => setDraggedItemIndex(index);
  
  const onDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newFiles = [...files];
    const item = newFiles[draggedItemIndex];
    newFiles.splice(draggedItemIndex, 1);
    newFiles.splice(index, 0, item);
    setDraggedItemIndex(index);
    setFiles(newFiles);
  };

  const moveItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    const newFiles = [...files];
    const item = newFiles[index];
    newFiles.splice(index, 1);
    newFiles.splice(newIndex, 0, item);
    setFiles(newFiles);
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
          <p>Tactile Stacking. Drag and reorder your documents to create the perfect sequence.</p>
        </div>

        <div className="pdf-merge-workspace refinement-grid" style={{ gridTemplateColumns: files.length > 0 ? '1fr 360px' : '1fr' }}>
          <div className="upload-section">
            <DropZone 
              onFileSelect={handleFileSelect} 
              accept=".pdf" 
              multiple={true}
              title="Add Documents" 
              subtitle="Drag multiple PDF files to start stacking."
            />
          </div>

          {files.length > 0 && (
            <div className="pdf-list-section glass-card" style={{ padding: '1.5rem' }}>
              <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', margin: 0 }}>Stack Order ({files.length})</h3>
                <button className="btn-secondary btn-sm" onClick={() => setFiles([])} style={{ fontSize: '0.6rem' }}>Clear All</button>
              </div>

              <div className="pdf-sortable-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '5px' }}>
                {files.map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`} 
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={(e) => onDragOver(e, index)}
                    className="pdf-sort-item glass-card"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '10px 12px', 
                      cursor: 'grab', 
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      opacity: draggedItemIndex === index ? 0.5 : 1
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', width: '25px' }}>{index + 1}</span>
                    <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{file.name}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                       <button onClick={() => moveItem(index, -1)} disabled={index === 0} style={{ background: 'none', border: 'none', color: '#fff', padding: '4px', cursor: 'pointer', opacity: index === 0 ? 0.2 : 0.6 }}>▲</button>
                       <button onClick={() => moveItem(index, 1)} disabled={index === files.length - 1} style={{ background: 'none', border: 'none', color: '#fff', padding: '4px', cursor: 'pointer', opacity: index === files.length - 1 ? 0.2 : 0.6 }}>▼</button>
                       <button onClick={() => removeFile(index)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', padding: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pdf-actions">
                {!mergedPdf ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleMerge} 
                    disabled={files.length < 2 || processing}
                    style={{ width: '100%' }}
                  >
                    {processing ? "Stacking Documents..." : "📚 Start Merging"}
                  </button>
                ) : (
                  <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download Merged File</button>
                    <SharingLink file={mergedPdf} fileName="merged_document.pdf" />
                    <button className="btn-secondary" onClick={() => setMergedPdf(null)} style={{ opacity: 0.6 }}>Reorder again</button>
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
