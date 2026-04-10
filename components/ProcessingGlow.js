'use client';
import './ProcessingGlow.css';

export default function ProcessingGlow({ label = 'Processing...' }) {
  return (
    <div className="processing-glow-container animate-fade-in">
       <div className="glow-orb">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
             <circle cx="50" cy="50" r="45" stroke="var(--secondary)" strokeWidth="2" fill="none" className="pulse-ring" />
             <circle cx="50" cy="50" r="30" fill="var(--secondary)" className="inner-glow" />
          </svg>
       </div>
       <p className="glow-label">{label}</p>
    </div>
  );
}
