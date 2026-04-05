'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './mobile-nav.css';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: '🏠', href: '/' },
    { label: 'PDF', icon: '📄', href: '/#tools?category=pdf' },
    { label: 'Image', icon: '🖼️', href: '/#tools?category=image' },
    { label: 'Support', icon: '⚙️', href: '/faq' }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <Link 
          key={item.label} 
          href={item.href} 
          className={`nav-item ${pathname === item.href ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
