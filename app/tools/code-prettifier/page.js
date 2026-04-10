'use client';
import { useState } from 'react';
import SharingLink from '@/components/SharingLink';
import '../image-compressor/tool.css';
import '../html-to-pdf/html-to-pdf.css';

export default function CodePrettifier() {
  const [code, setCode] = useState('{\n"name": "swift-convert",\n"version":"1.0.0",\n"features":["fast","private","OLED"]\n}');
  const [language, setLanguage] = useState('json');
  const [formattedCode, setFormattedCode] = useState('');
  const [processing, setProcessing] = useState(false);

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
      // Lazy load prettier for SSR safety
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
        printWidth: 80,
      });
      setFormattedCode(formatted);
    } catch (error) {
      console.error("Format failure:", error);
      alert("Format failed. Check if your code is valid for the selected language.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!formattedCode) return;
    const blob = new Blob([formattedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted_code.${language === 'javascript' ? 'js' : language}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tool-container animate-fade-in">
      <div className="container">
        <div className="tool-header-content">
          <h1 className="gradient-text">Code Prettifier</h1>
          <p>Instantly format your messy code into clean, readable structures.</p>
        </div>

        <div className="html-pdf-workspace">
          <div className="editor-section glass-card">
            <div className="label-bar">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="lang-select"
              >
                {languages.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <button className="btn-secondary btn-sm" onClick={() => setCode('')}>Clear</button>
            </div>
            <textarea 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your messy code here..."
              className="html-textarea"
              style={{ height: '400px', color: '#61dafb' }}
            />
          </div>

          <div className="preview-section glass-card">
            <label className="preview-label">Formatted Output</label>
            <pre className="html-preview" style={{ background: '#0d1117', color: '#c9d1d9', whiteSpace: 'pre-wrap' }}>
              {formattedCode || 'Your formatted code will appear here...'}
            </pre>
          </div>

          <div className="actions-section glass-card">
            <button 
              className="btn-primary" 
              onClick={handleFormat}
              disabled={!code || processing}
              style={{ width: '100%' }}
            >
              {processing ? '🔄 Formatting...' : '✨ Format Code'}
            </button>
            
            {formattedCode && (
              <div className="result-actions" style={{ marginTop: '1rem' }}>
                <button className="btn-primary" onClick={download}>📥 Download File</button>
                <SharingLink 
                  file={new Blob([formattedCode], { type: 'text/plain' })} 
                  fileName={`formatted.${language}`} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
