'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo, Suspense } from 'react';
import ToolCard from '@/components/ToolCard';
import './app.css';
import { usePlatform } from '@/hooks/usePlatform';

function HomeContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const [searchTerm, setSearchTerm] = useState('');
  const { isNative } = usePlatform();

  const tools = useMemo(() => [
    {
      title: "PDF Translator",
      description: "Instantly translate entire PDF files to 50+ languages.",
      icon: "🌐",
      href: "/tools/pdf-translator",
      tag: "Pro",
      category: "pdf"
    },
    {
      title: "AI Background Eraser",
      description: "Remove image backgrounds instantly using local AI.",
      icon: "🪄",
      href: "/tools/background-eraser",
      tag: "New",
      category: "ai"
    },
    {
      title: "Cloud Share",
      description: "Get a temporary sharing URL for any media file.",
      icon: "☁️",
      href: "/tools/cloud-share",
      category: "social"
    },
    {
      title: "Image Compressor",
      description: "Reduce image file size with zero quality loss.",
      icon: "🖼️",
      href: "/tools/image-compressor",
      category: "image"
    },
    {
      title: "Object Scanner",
      description: "Extract editable text from any photo using OCR.",
      icon: "🔍",
      href: "/tools/object-scanner",
      category: "ai"
    },
    {
      title: "PDF Splitter",
      description: "Extract specific pages from any PDF document.",
      icon: "✂️",
      href: "/tools/pdf-split",
      category: "pdf"
    },
    {
      title: "HTML to PDF",
      description: "Turn web code or snippets into professional PDFs.",
      icon: "📄",
      href: "/tools/html-to-pdf",
      category: "dev"
    },
    {
      title: "Code Prettifier",
      description: "Format JSON, JS, HTML, and CSS instantly.",
      icon: "💻",
      href: "/tools/code-prettifier",
      category: "dev"
    },
    {
      title: "GIF Master",
      description: "Create high-quality GIFs from your video files.",
      icon: "🎞️",
      href: "/tools/video-to-gif",
      category: "video"
    },
    {
      title: "Audio Snipper",
      description: "Cut and trim MP3s with precision.",
      icon: "🎵",
      href: "/tools/audio-trim",
      category: "video"
    },
    {
      title: "Meme Generator",
      description: "Add captions to your photos locally and privately.",
      icon: "🤡",
      href: "/tools/meme-generator",
      category: "image"
    },
    {
      title: "PDF Merger",
      description: "Combine multiple PDF files into a single document.",
      icon: "📑",
      href: "/tools/pdf-merge",
      category: "pdf"
    },
    {
      title: "Video to MP3",
      description: "Extract high-quality audio from any video file.",
      icon: "🎧",
      href: "/tools/video-to-mp3",
      category: "video"
    },
    {
      title: "Image Converter",
      description: "Convert between JPG, PNG, and WebP instantly.",
      icon: "🔄",
      href: "/tools/image-converter",
      category: "image"
    },
    {
      title: "Word to PDF",
      description: "Convert Word documents to PDF files instantly.",
      icon: "📝",
      href: "/tools/word-to-pdf",
      category: "pdf"
    },
    {
      title: "Resize Image",
      description: "Change dimensions for social media or print.",
      icon: "📐",
      href: "/tools/image-resize",
      category: "image"
    }
  ], []);

  const filteredTools = useMemo(() => {
    let result = tools;
    if (categoryFilter) {
      result = result.filter(tool => tool.category === categoryFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(tool => 
        tool.title.toLowerCase().includes(lower) || 
        tool.description.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [tools, categoryFilter, searchTerm]);

  const categoryChips = [
    { label: 'All', value: null },
    { label: 'PDF', value: 'pdf' },
    { label: 'Image', value: 'image' },
    { label: 'Video', value: 'video' },
    { label: 'Dev', value: 'dev' },
    { label: 'AI', value: 'ai' },
    { label: 'Share', value: 'social' }
  ];

  return (
    <div className="home-page animate-fade-in">
      {!isNative ? (
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <span className="badge">100% Private • Browser-Based</span>
              <h1 className="hero-title">
                The <span className="gradient-text">Fastest</span> way to <br />
                Transform your files.
              </h1>
              <p className="hero-subtitle">
                Convert, merge, and compress your files locally. No uploads, no waiting, 
                and total privacy for your sensitive documents.
              </p>
              <div className="hero-actions">
                <a href="#tools" className="btn-primary">Explore All Tools</a>
                <a href="#features" className="btn-secondary">How it works</a>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <header className="mobile-header">
           <div className="container">
             <h1 className="gradient-text">SwiftConvert</h1>
             <div className="mobile-search-bar">
               <span className="search-icon">🔍</span>
               <input 
                 type="text" 
                 placeholder="Search tools..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="category-chips">
                {categoryChips.map(chip => (
                  <a 
                    key={chip.label} 
                    href={chip.value ? `/#tools?category=${chip.value}` : '/#tools'} 
                    className={`chip ${categoryFilter === chip.value ? 'active' : ''}`}
                  >
                    {chip.label}
                  </a>
                ))}
             </div>
           </div>
        </header>
      )}

      <section id="tools" className="tools-section">
        <div className="container">
          {!isNative && (
            <div className="section-header">
              <h2>
                {categoryFilter ? (
                  <>Filtered <span className="gradient-text">{categoryFilter.toUpperCase()}</span> Tools</>
                ) : (
                  <>Our Core <span className="gradient-text">Tools</span></>
                )}
              </h2>
            </div>
          )}
          
          <div className="tools-grid">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool, index) => (
                <ToolCard key={index} {...tool} />
              ))
            ) : (
              <div className="no-results glass-card">
                <p>No tools found for "{searchTerm}"</p>
                <button className="btn-secondary" onClick={() => setSearchTerm('')}>Clear Search</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {isNative && (
        <div style={{ height: '80px' }} />
      )}

      {!isNative && (
        <section id="features" className="features-section">
          <div className="container">
            <div className="features-grid">
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <h3>Privacy-First</h3>
                <p>Your files never leave your computer. Processing happens entirely in your browser.</p>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <h3>Blinking Speed</h3>
                <p>Skip the upload/download queues. Get your processed files instantly.</p>
              </div>
              <div className="feature">
                <span className="feature-icon">🆓</span>
                <h3>Always Free</h3>
                <p>Professional grade tools with no hidden costs or subscription traps.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading tools...</div>}>
      <HomeContent />
    </Suspense>
  );
}
