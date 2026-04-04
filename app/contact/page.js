'use client';
import { useState } from 'react';
import './contact.css';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-page animate-fade-in">
      <div className="container">
        <div className="contact-header">
          <h1 className="gradient-text">Get in Touch</h1>
          <p>Questions? Feedback? We'd love to hear from you.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info glass-card">
            <div className="info-item">
              <span className="info-icon">📧</span>
              <div>
                <h3>Email Us</h3>
                <p>support@swiftconvert.com</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">💬</span>
              <div>
                <h3>Social</h3>
                <p>Twitter: @SwiftConvert</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <h3>Global</h3>
                <p>100% Remote & Self-Hosted</p>
              </div>
            </div>
          </div>

          <div className="contact-form-container glass-card">
            {submitted ? (
              <div className="success-message">
                <h2>Message Sent!</h2>
                <p>Thanks for reaching out. We'll get back to you shortly.</p>
                <button className="btn-secondary" onClick={() => setSubmitted(false)}>Send another</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows="5" placeholder="How can we help?" required></textarea>
                </div>
                <button type="submit" className="btn-primary">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
