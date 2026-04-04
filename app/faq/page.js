'use client';
import { useState } from 'react';
import './faq.css';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Is SwiftConvert completely free?",
      a: "Yes! All current tools are 100% free with no hidden charges or premium tiers for basic usage."
    },
    {
      q: "Are my files safe and private?",
      a: "Absolutely. We use a 'Local-First' architecture. This means your files are processed entirely in your browser using WebAssembly. They are never uploaded to any server."
    },
    {
      q: "Which file formats do you support?",
      a: "We currently support PDF, JPG, PNG, WebP, DOCX, and common video formats like MP4 and MOV."
    },
    {
      q: "Do I need to create an account?",
      a: "No registration is required. You can start using any tool immediately with just one click."
    },
    {
      q: "The PDF Translator isn't keeping my layout exactly. Why?",
      a: "Our translator focuses on accurate text translation and clean formatting. Perfect layout preservation (including overlapping images and complex grids) is a roadmap feature currently in development."
    }
  ];

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page animate-fade-in">
      <div className="container">
        <div className="faq-header">
          <h1 className="gradient-text">Frequently Asked Questions</h1>
          <p>Everything you need to know about SwiftConvert.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item glass-card ${openIndex === index ? 'active' : ''}`} onClick={() => toggle(index)}>
              <div className="faq-question">
                <h3>{faq.q}</h3>
                <span className="arrow">{openIndex === index ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
