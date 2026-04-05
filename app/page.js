'use client';
import { useSearchParams } from 'next/navigation';
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
      description: "Instantly translate entire PDF files to Hindi, Arabic, Japanese, and more.",
      icon: "🌐",
      href: "/tools/pdf-translator",
      tag: "New",
      category: "pdf"
    },
    {
      title: "Image Compressor",
      description: "Reduce image file size with zero quality loss. Works offline in your browser.",
      icon: "🖼️",
      href: "/tools/image-compressor",
      tag: "Popular",
      category: "image"
    },
    {
      title: "PDF Merger",
      description: "Combine multiple PDF files into a single document effortlessly and securely.",
      icon: "📄",
      href: "/tools/pdf-merge",
      tag: "Free",
      category: "pdf"
    },
    {
      title: "Video to MP3",
      description: "Extract high-quality audio from any video file in seconds.",
      icon: "🎵",
      href: "/tools/video-to-mp3",
      tag: "Quick",
      category: "video"
    },
    {
      title: "Image Converter",
      description: "Convert between JPG, PNG, WebP, and more with a single click.",
      icon: "🔄",
      href: "/tools/image-converter",
      category: "image"
    },
    {
      title: "Word to PDF",
      description: "Convert Microsoft Word documents to professional PDF files instantly.",
      icon: "📑",
      href: "/tools/word-to-pdf",
      category: "pdf"
    },
    {
      title: "Resize Image",
      description: "Change image dimensions for social media, web, or print.",
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
    { label: 'Video', value: 'video' }
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
          <div className="section-header">
            <h2>
              {categoryFilter ? (
                <>Filtered <span className="gradient-text">{categoryFilter.toUpperCase()}</span> Tools</>
              ) : (
                <>Our Core <span className="gradient-text">Tools</span></>
              )}
            </h2>
          </div>
          
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

          {categoryFilter && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <a href="/#tools" className="btn-secondary">View All Tools</a>
            </div>
          )}
        </div>
      </section>

      {isNative && (
        <section className="mobile-support-links">
           <div className="container">
             <h3>Quick Links</h3>
             <div className="support-grid">
               <Link href="/about">About Us</Link>
               <Link href="/faq">FAQ</Link>
               <Link href="/privacy">Privacy Policy</Link>
               <Link href="/terms">Terms of Service</Link>
               <Link href="/contact">Contact Support</Link>
             </div>
           </div>
        </section>
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
