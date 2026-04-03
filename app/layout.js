import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "SwiftConvert | Modern File Transformation Suite",
  description: "The fastest, most secure way to convert PDFs, images, and media tools locally in your browser.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar />
        <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
