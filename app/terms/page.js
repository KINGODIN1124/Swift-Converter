import './terms.css';

export default function TermsPage() {
  return (
    <div className="terms-page animate-fade-in">
      <div className="container">
        <div className="terms-header">
          <h1 className="gradient-text">Terms of Service</h1>
          <p>Last updated: April 4, 2026</p>
        </div>

        <div className="terms-content glass-card">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using SwiftConvert, you agree to be bound by these Terms of Service. 
              If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              SwiftConvert provides automated file transformation tools, including PDF, image, and 
              video processing. The service is provided "as is" and "as available."
            </p>
          </section>

          <section>
            <h2>3. Privacy & Data Handling</h2>
            <p>
              Our service is designed to be privacy-first. We do not store, view, or transmit 
              any file data to our servers. All processing is done locally in your browser.
            </p>
          </section>

          <section>
            <h2>4. User Responsibilities</h2>
            <p>
              You are responsible for ensuring you have the legal right to process the files 
              you upload to the tool. We are not liable for any misuse of the service or 
              unauthorized processing of protected content.
            </p>
          </section>

          <section>
            <h2>5. Limitation of Liability</h2>
            <p>
              SwiftConvert and its creators shall not be liable for any direct, indirect, 
              incidental, or consequential damages resulting from the use or inability to 
              use the service.
            </p>
          </section>

          <section>
            <h2>6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use 
              of the service after changes are posted constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
