import Link from 'next/link';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer animate-fade-in">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link href="/" className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Swift<span className="gradient-text">Convert</span></span>
          </Link>
          <p className="footer-tagline">
            Fast, secure, and privacy-focused file tools right in your browser.
          </p>
        </div>
        
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Product</h4>
            <Link href="/pdf-tools">PDF Tools</Link>
            <Link href="/image-tools">Image Tools</Link>
            <Link href="/video-tools">Video Tools</Link>
          </div>
          
          <div className="footer-col">
            <h4>Company</h4>
            <Link href="/about">About Us</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
          
          <div className="footer-col">
            <h4>Support</h4>
            <Link href="/contact">Contact</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {currentYear} SwiftConvert. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
