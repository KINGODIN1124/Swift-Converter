'use client';
import { usePlatform } from "@/hooks/usePlatform";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import CapacitorProvider from "@/components/CapacitorProvider";

export default function ClientLayout({ children }) {
  const { isNative } = usePlatform();

  return (
    <div className={isNative ? 'has-mobile-nav' : ''}>
      <CapacitorProvider>
        {!isNative && <Navbar />}
        <main style={{ 
          paddingTop: isNative ? '20px' : 'var(--header-height)', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          {children}
        </main>
        {!isNative && <Footer />}
        {isNative && <MobileBottomNav />}
      </CapacitorProvider>
    </div>
  );
}
