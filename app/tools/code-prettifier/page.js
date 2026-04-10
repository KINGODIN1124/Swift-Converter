'use client';
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';
import '../html-to-pdf/html-to-pdf.css';

export default function CodePrettifier() {
  const [code, setCode] = useState('{\n"name": "swift-convert",\n"version":"1.0.0",\n"features":["fast","private","OLED"]\n}');
  const [language, setLanguage] = useState('json');
  const [formattedCode, setFormattedCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const codeCardRef = useRef(null);

  const languages = [
    { label: 'JSON', value: 'json', parser: 'json' },
    { label: 'JavaScript', value: 'javascript', parser: 'babel' },
    { label: 'HTML', value: 'html', parser: 'html' },
    { label: 'CSS', value: 'css', parser: 'css' }
  ];

  const handleFormat = async () => {
    if (!code) return;
    setProcessing(true);
    setFormattedCode('');

    try {
      const prettier = (await import('prettier/standalone')).default;
      const babel = (await import('prettier/plugins/babel')).default;
      const estree = (await import('prettier/plugins/estree')).default;
      const html = (await import('prettier/plugins/html')).default;
      const postcss = (await import('prettier/plugins/postcss')).default;

      const selectedLang = languages.find(l => l.value === language);
      const formatted = await prettier.format(code, {
        parser: selectedLang.parser,
        plugins: [babel, estree, html, postcss],
        semi: true,
        singleQuote: true,
        printWidth: 60,
      });
      setFormattedCode(formatted);
    } catch (error) {
      console.error("Format failure:", error);
      alert("Format failed. Check if your code is valid.");
    } finally {
      setProcessing(false);
    }
  };

  const takeSnapshot = async () => {
    if (!codeCardRef.current) return;
    try {
      const canvas = await html2canvas(codeCardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `code_snapshot.png`;
      link.click();
    } catch (err) {
      console.error("Snapshot failed:", err);
    }
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Code Prettifier</h1>
          <p>Snapshot Studio. Format your code and export as professional social media snapshots.</p>
        </div>

        <div className="html-pdf-workspace refinement-grid" style={{ gridTemplateColumns: '1fr 360px' }}>
          <div className="editor-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="editor-section glass-card">
                <div className="label-bar" style={{ padding: '10px 15px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontWeight: 800, outline: 'none', cursor: 'pointer' }}
                  >
                    {languages.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <button onClick={() => setCode('')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.7rem' }}>Clear</button>
                </div>
                <textarea 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your messy code here..."
                  style={{ width: '100%', height: '300px', background: 'transparent', border: 'none', color: '#61dafb', fontSize: '0.9rem', outline: 'none', padding: '1rem', fontFamily: 'monospace' }}
                />
              </div>

              {formattedCode && (
                <div className="snapshot-preview-container">
                   <div ref={codeCardRef} className="code-card-snapshot" style={{ background: 'linear-gradient(135deg, #1e1e1e, #0e0e0e)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                      <div className="window-controls" style={{ display: 'flex', gap: '6px', marginBottom: '15px' }}>
                         <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
                         <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
                         <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
                      </div>
                      <pre style={{ background: 'transparent', color: '#c9d1d9', fontSize: '14px', margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {formattedCode}
                      </pre>
                   </div>
                </div>
              )}
          </div>

          <div className="controls-panel glass-card" style={{ padding: '1.5rem' }}>
             <button 
               className="btn-primary" 
               onClick={handleFormat}
               disabled={!code || processing}
               style={{ width: '100%', marginBottom: '1.5rem' }}
             >
               {processing ? '📏 Prettifying...' : '✨ Format Code'}
             </button>
             
             {formattedCode && (
               <div className="export-hub">
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>Export Studio</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(formattedCode)} style={{ width: '100%' }}>📋 Copy Text</button>
                     <button className="btn-secondary" onClick={takeSnapshot} style={{ width: '100%' }}>📸 Capture as Image</button>
                     <SharingLink file={new Blob([formattedCode], { type: 'text/plain' })} fileName="code.txt" />
                  </div>
               </div>
             )}
             
             <button className="btn-secondary" onClick={() => setFormattedCode('')} style={{ width: '100%', marginTop: 'auto', opacity: 0.6 }}>Restart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
