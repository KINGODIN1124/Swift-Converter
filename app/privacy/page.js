import './privacy.css';

export default function PrivacyPage() {
  return (
    <div className="privacy-page animate-fade-in">
      <section className="privacy-hero">
        <div className="container">
          <h1 className="gradient-text">Privacy Policy</h1>
          <p className="subtitle">Your privacy is our core mission. No uploads, no tracking.</p>
        </div>
      </section>

      <section className="privacy-content">
        <div className="container">
          <div className="glass-card main-card">
            <h2>The No-Uploads Guarantee</h2>
            <p className="intro-text">
              SwiftConvert is designed as a <strong>Local-First Tool</strong>. 
              This policy explains exactly how your data is handled. Simple version: 
              <strong> We never see your files.</strong>
            </p>

            <div className="policy-section">
              <h3>1. Data Processing</h3>
              <p>
                All file conversions, merging, and compression happen entirely within your 
                browser using client-side technologies like WebAssembly. We do not 
                possess, operate, or maintain any backend servers that handle user files.
              </p>
            </div>

            <div className="policy-section">
              <h3>2. File Storage</h3>
              <p>
                SwiftConvert does not store your files. Once you close your browser tab, 
                all traces of your files are permanently cleared from your browser's 
                temporary memory. No permanent copies are ever created.
              </p>
            </div>

            <div className="policy-section">
              <h3>3. Security</h3>
              <p>
                Since your files never leave your computer, they are as secure as your 
                personal device. There is no risk of a "data breach" from our end because 
                we don't collect any data to breach.
              </p>
            </div>

            <div className="policy-section">
              <h3>4. Analytics & Cookies</h3>
              <p>
                We may use minimal, anonymous analytics to understand site usage and improve our tools. 
                We do not track identifiable information about you or the content of your files.
              </p>
            </div>

            <div className="policy-footer">
              <p>Last Updated: April 1, 2026</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
