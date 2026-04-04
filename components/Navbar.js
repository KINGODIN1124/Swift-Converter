import Link from 'next/link';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Swift<span className="gradient-text">Convert</span></span>
        </Link>
        
        <div className="nav-links">
          <Link href="/#tools" className="nav-link">Tools</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/privacy" className="nav-link">Privacy</Link>
        </div>

        <div className="nav-actions">
          <Link href="/#tools" className="btn-primary">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}
