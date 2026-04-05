import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

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
         <ClientLayout>
           {children}
         </ClientLayout>
      </body>
    </html>
  );
}
