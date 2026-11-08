import React from 'react';
import './Home.css';
import char1 from '../assets/Characters/char1.png';
import char4 from '../assets/Characters/char4.png';
import char3 from '../assets/Characters/char3.png';
import char2 from '../assets/Characters/char2.png';

export function Home({ onReplayLoader }) {
  const outfits = [
    {
      id: 1,
      title: 'Rose Casual Overshirt',
      color: 'Pastel Rose Pink',
      hex: '#FB7EA4',
      tag: 'DAILY CASUAL',
      characterImg: char1,
      pairing: 'White Relaxed Cargo + Rose Low Sneakers',
    },
    {
      id: 2,
      title: 'Heavyweight Drop Hoodie',
      color: 'Oxblood Burgundy',
      hex: '#450E16',
      tag: 'STREET LUXURY',
      characterImg: char4,
      pairing: 'Black Relaxed Cargo + Low White Sneakers',
    },
    {
      id: 3,
      title: 'Rust Tactical Overshirt',
      color: 'Warm Rust Orange',
      hex: '#F46208',
      tag: 'VIBRANT UTILITY',
      characterImg: char2,
      pairing: 'White Cargo Pants + Low Orange Sneakers',
    },
    {
      id: 4,
      title: 'Forest Utility Shirt',
      color: 'Deep Pine Green',
      hex: '#1B3D31',
      tag: 'MODERN MINIMAL',
      characterImg: char3,
      pairing: 'White Cargo Pants + Green Low Sneakers',
    },
  ];

  return (
    <div className="zfits-app-container">
      {/* Top Navigation */}
      <nav className="zfits-app-nav">
        <div className="nav-left">
          <a href="/" className="nav-logo">
            ZFITS<span className="logo-dot">.</span>
          </a>
          <span className="nav-badge">STUDIO SUITE</span>
        </div>

        <div className="nav-links">
          <a href="#wardrobe" className="active">WARDROBE</a>
          <a href="#outfits">CURATIONS</a>
          <a href="#ai-engine">AI STYLIST</a>
          <a href="#archive">ARCHIVE</a>
        </div>

        <div className="nav-actions">
          <button type="button" className="replay-btn" onClick={onReplayLoader}>
            <span className="replay-icon">↺</span>
            <span className="replay-text-desktop">REPLAY CINEMATIC LOADER</span>
            <span className="replay-text-mobile">REPLAY</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="zfits-app-main">
        {/* Hero Section */}
        <header className="app-hero">
          <span className="app-hero-tag">SS26 PERSONAL ARCHIVE</span>
          <h1 className="app-hero-heading">
            More Outfits.<br />Same Wardrobe.
          </h1>
          <p className="app-hero-sub">
            The AI-powered fashion platform that digitizes your clothes and curates cohesive,
            bespoke daily fits without buying fast fashion.
          </p>

          <div className="app-hero-cta">
            <button type="button" className="primary-cta-btn">
              OPEN AI CURATOR
            </button>
            <button type="button" className="secondary-cta-btn" onClick={onReplayLoader}>
              EXPERIENCE OPENING SEQUENCE
            </button>
          </div>
        </header>

        {/* Curation Grid */}
        <section className="app-curations-section">
          <div className="section-title-wrap">
            <h2>CURATED CAPSULE LOOKS</h2>
            <span className="look-count">04 GENERATED COMBINATIONS</span>
          </div>

          <div className="outfits-grid">
            {outfits.map((outfit) => (
              <div key={outfit.id} className="outfit-card">
                <div
                  className="outfit-card-preview"
                  style={{
                    background: `radial-gradient(circle at 50% 35%, ${outfit.hex} 0%, #08080a 100%)`,
                  }}
                >
                  <img
                    src={outfit.characterImg}
                    alt={outfit.title}
                    className="outfit-character-thumb"
                  />
                  <span className="outfit-pill">{outfit.tag}</span>
                </div>
                <div className="outfit-card-info">
                  <div className="outfit-color-indicator">
                    <span className="color-swatch" style={{ background: outfit.hex }} />
                    <span className="color-label">{outfit.color}</span>
                  </div>
                  <h3>{outfit.title}</h3>
                  <p>{outfit.pairing}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* App Footer */}
      <footer className="zfits-app-footer">
        <div className="footer-left">
          <span>ZFITS STUDIO TECHNOLOGIES</span>
          <span className="footer-dim">• ALL RIGHTS RESERVED</span>
        </div>
        <div className="footer-right">
          <button type="button" className="replay-footer-link" onClick={onReplayLoader}>
            Restart Loader Demo
          </button>
        </div>
      </footer>
    </div>
  );
}

