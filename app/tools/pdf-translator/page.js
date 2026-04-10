'use client';
import { useState, useEffect, useRef } from 'react';
import DropZone from '@/components/DropZone';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';
import './translator.css';
import { CONFIG } from '@/lib/config';

export default function PDFTranslator() {
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState('hi');
  const [processing, setProcessing] = useState(false);
  const [translatedPdf, setTranslatedPdf] = useState(null);
  const [progress, setProgress] = useState('');
  
  // Smart Cache
  const [cache, setCache] = useState({});

  const pdfjsRef = useRef(null);
  const jsPDFRef = useRef(null);

  useEffect(() => {
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
    // Load cache from sessionStorage
    const savedCache = sessionStorage.getItem('translation_cache');
    if (savedCache) setCache(JSON.parse(savedCache));
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
    const cacheKey = `${to}:${text.substring(0, 50)}`; // Simplified key
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, to })
      });
      const data = await response.json();
      const result = data.translatedText || text;
      
      // Update cache
      const newCache = { ...cache, [cacheKey]: result };
      setCache(newCache);
      sessionStorage.setItem('translation_cache', JSON.stringify(newCache));
      
      return result;
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

      const paragraphs = fullText.split('\n\n').filter(p => p.trim() !== '');
      const translatedParagraphs = [];
      
      let count = 0;
      for (let p of paragraphs) {
          count++;
          setProgress(`Translating content (${count}/${paragraphs.length})...`);
          const translated = await translateText(p, targetLang);
          translatedParagraphs.push(translated);
      }

      setProgress('Generating new PDF...');
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Translated Document`, 20, 20);
      doc.setFontSize(11);
      
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
      setProgress('Translation Completed!');
    } catch (error) {
      console.error("Translation failed:", error);
      alert("Something went wrong. High-density PDFs may require more memory.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!translatedPdf) return;
    const url = URL.createObjectURL(translatedPdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translated_${file.name.split('.')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">PDF Translator</h1>
          <p>Smart Knowledge. Translate documents with intelligent caching and local reconstruction.</p>
        </div>

        {!file ? (
          <DropZone 
            onFileSelect={handleFileSelect} 
            accept=".pdf" 
            title="Upload PDF" 
            subtitle="Securely extract and translate content locally."
          />
        ) : (
          <div className="tool-workspace refinement-grid" style={{ gridTemplateColumns: '1fr 380px' }}>
            <div className="file-info glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '2rem' }}>
               <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', textAlign: 'center', width: '100%' }}>
                  <span style={{ fontSize: '3rem', display: 'block' }}>🌐</span>
                  <h3 style={{ margin: '1rem 0 0.5rem' }}>{file.name}</h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{(file.size / 1024).toFixed(2)} KB • Prepared for conversion</p>
               </div>
               
               {processing && (
                 <div style={{ width: '100%', marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', marginBottom: '10px', color: 'var(--secondary)' }}>{progress}</p>
                    <div style={{ height: '4px', background: '#111', borderRadius: '2px', overflow: 'hidden' }}>
                       <div className="progress-fill-animate" style={{ height: '100%', background: 'var(--accent-gradient)', width: '100%' }} />
                    </div>
                 </div>
               )}
            </div>

            <div className="controls-panel glass-card" style={{ padding: '1.5rem' }}>
               <div className="language-settings">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Target Destination</label>
                  <select 
                    value={targetLang} 
                    onChange={(e) => setTargetLang(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.8rem' }}>💨 Caching is active. Repeated segments will translate instantly.</p>
               </div>

               <div className="tool-actions" style={{ marginTop: '2.5rem' }}>
                  {!translatedPdf ? (
                    <button 
                      className="btn-primary" 
                      onClick={handleTranslate} 
                      disabled={processing}
                      style={{ width: '100%' }}
                    >
                      {processing ? "⏳ Synchronizing..." : `🌍 Translate to ${languages.find(l => l.code === targetLang).name}`}
                    </button>
                  ) : (
                    <div className="result-actions" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <button className="btn-primary" onClick={download} style={{ width: '100%' }}>📥 Download Translated PDF</button>
                       <SharingLink file={translatedPdf} fileName="translated.pdf" />
                       <button className="btn-secondary" onClick={() => setTranslatedPdf(null)} style={{ opacity: 0.6 }}>Revise Content</button>
                    </div>
                  )}
                  <button className="btn-secondary" onClick={() => setFile(null)} style={{ width: '100%', marginTop: '1rem', opacity: 0.6 }}>Restart</button>
               </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
         @keyframes flow { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
         .progress-fill-animate { background-size: 200% 200% !important; animation: flow 2s linear infinite; }
      `}</style>
    </div>
  );
}
