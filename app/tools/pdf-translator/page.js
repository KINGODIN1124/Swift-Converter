'use client';
import { useState, useEffect, useRef } from 'react';
import DropZone from '@/components/DropZone';
import '../image-compressor/tool.css';
import './translator.css';
import { CONFIG } from '@/lib/config';

export default function PDFTranslator() {
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState('hi'); // Hindi as default for demo
  const [processing, setProcessing] = useState(false);
  const [translatedPdf, setTranslatedPdf] = useState(null);
  const [progress, setProgress] = useState('');
  
  const pdfjsRef = useRef(null);
  const jsPDFRef = useRef(null);

  useEffect(() => {
    // Dynamically load libraries only in the browser
    const loadLibs = async () => {
      const pdfjs = await import('pdfjs-dist');
      const { jsPDF } = await import('jspdf');
      
      pdfjsRef.current = pdfjs;
      jsPDFRef.current = jsPDF;

      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      }
    };
    loadLibs();
  }, []);

  const languages = [
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ur', name: 'Urdu' },
    { code: 'ar', name: 'Arabic' },
    { code: 'en', name: 'English' },
  ];

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setTranslatedPdf(null);
  };

  const translateText = async (text, to) => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, to })
      });
      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const handleTranslate = async () => {
    if (!file || !pdfjsRef.current || !jsPDFRef.current) return;
    setProcessing(true);
    setProgress('Extracting text from PDF...');

    try {
      const pdfjs = pdfjsRef.current;
      const jsPDF = jsPDFRef.current;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
      }

      setProgress(`Translating content to ${languages.find(l => l.code === targetLang).name}...`);
      
      // Since large texts can fail, we split by paragraphs
      const paragraphs = fullText.split('\n\n').filter(p => p.trim() !== '');
      const translatedParagraphs = [];
      
      for (let p of paragraphs) {
          const translated = await translateText(p, targetLang);
          translatedParagraphs.push(translated);
      }

      setProgress('Generating new PDF...');
      const doc = new jsPDF();
      
      // Simple layout: title and text
      doc.setFontSize(18);
      doc.text(`Translated Document (${languages.find(l => l.code === targetLang).name})`, 20, 20);
      doc.setFontSize(12);
      
      let y = 40;
      translatedParagraphs.forEach(text => {
          const splitText = doc.splitTextToSize(text, 170);
          if (y + (splitText.length * 7) > 280) {
              doc.addPage();
              y = 20;
          }
          doc.text(splitText, 20, y);
          y += (splitText.length * 7) + 10;
      });

      const pdfBlob = doc.output('blob');
      setTranslatedPdf(pdfBlob);
      setProgress('Done!');
    } catch (error) {
      console.error("Translation tool failed:", error);
      alert("Something went wrong. Please try with a smaller PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!translatedPdf) return;
    const url = URL.createObjectURL(translatedPdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translated_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">PDF Translator</h1>
          <p>Translate entire PDF documents into Hindi, Arabic, Japanese, and more.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept=".pdf" 
            title="Upload PDF to Translate" 
            subtitle="Securely extract and translate content while keeping your data private."
          />
        ) : (
          <div className="tool-workspace">
            <div className="file-info glass-card">
              <div className="pdf-preview-placeholder">📄</div>
              <div className="file-details">
                <h3>{file.name}</h3>
                <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>

            <div className="tool-controls glass-card">
              <div className="control-group">
                <label>Target Language</label>
                <select 
                  value={targetLang} 
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="lang-select"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              {processing && <p className="progress-status">{progress}</p>}

              <div className="tool-actions">
                {!translatedPdf ? (
                  <button 
                    className="btn-primary" 
                    onClick={handleTranslate} 
                    disabled={processing}
                  >
                    {processing ? "Translating..." : "Start Translation"}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={download}>Download Translated PDF</button>
                )}
                <button className="btn-secondary" onClick={() => setFile(null)}>Try different file</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
