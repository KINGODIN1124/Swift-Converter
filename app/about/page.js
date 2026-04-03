import './about.css';

export default function AboutPage() {
  return (
    <div className="about-page animate-fade-in">
      <section className="about-hero">
        <div className="container">
          <h1 className="gradient-text">About SwiftConvert</h1>
          <p className="subtitle">Fast, Secure, and 100% Private File Transformation.</p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="glass-card main-card">
            <h2>The Local-First Revolution</h2>
            <p>
              SwiftConvert was built on a simple premise: <strong>your files belong to you.</strong> 
              Traditional online converters require you to upload sensitive documents to their servers, 
              where they are processed and stored. We believe there's a better way.
            </p>
            
            <div className="features-highlight">
              <div className="highlight-item">
                <span className="icon">🚀</span>
                <h3>No Uploads</h3>
                <p>Processing happens entirely in your browser using WebAssembly. Your files never leave your device.</p>
              </div>
              <div className="highlight-item">
                <span className="icon">🛡️</span>
                <h3>Total Privacy</h3>
                <p>Since nothing is uploaded, there's no risk of data breaches or unauthorized access to your files.</p>
              </div>
              <div className="highlight-item">
                <span className="icon">⚡</span>
                <h3>Instant Speed</h3>
                <p>Skip the upload/download queues. Most conversions are complete in milliseconds.</p>
              </div>
            </div>

            <div className="tech-stack-info">
              <h3>Always Evolving</h3>
              <p>
                SwiftConvert is built on the latest browser technologies to ensure that 
                your data never leaves your sight. We are committed to maintaining a 
                transparent, secure, and lightning-fast platform for all your daily 
                file transformation needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
