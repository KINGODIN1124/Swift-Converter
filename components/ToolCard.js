import Link from 'next/link';
import './ToolCard.css';

export default function ToolCard({ title, description, icon, href, tag }) {
  return (
    <Link href={href} className="tool-card glass-card">
      <div className="tool-icon">{icon}</div>
      <div className="tool-content">
        <div className="tool-header">
          <h3>{title}</h3>
          {tag && <span className="tool-tag">{tag}</span>}
        </div>
        <p>{description}</p>
      </div>
      <div className="tool-footer">
        <span className="learn-more">Open Tool →</span>
      </div>
    </Link>
  );
}
