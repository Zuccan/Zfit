import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Home.css';
import char1 from '../assets/Characters/char1.png';
import char4 from '../assets/Characters/char4.png';
import char3 from '../assets/Characters/char3.png';
import char2 from '../assets/Characters/char2.png';

/**
 * 5 Signature Editorial Themes:
 * 1. Rose Pink (Look 01)
 * 2. Oxblood Burgundy (Look 02)
 * 3. Warm Rust Orange (Look 03)
 * 4. Forest Green (Look 04)
 * 5. Black & White (Monochrome Noir)
 */
const THEMES = [
  {
    id: 'pink',
    name: 'Rose Pink',
    color: '#FB7EA4',
    bgGradient: 'radial-gradient(ellipse 95% 85% at 50% 12%, #852243 0%, #4D1225 45%, #0c0c0e 100%)',
    accent: '#FB7EA4',
    accentLight: '#FFBCD0',
    accentGlow: 'rgba(251, 126, 164, 0.38)',
    tagBg: 'rgba(251, 126, 164, 0.16)',
    tagBorder: 'rgba(251, 126, 164, 0.38)',
    tagText: '#FFAFC7',
    badgeBg: 'rgba(251, 126, 164, 0.18)',
    navBorder: 'rgba(251, 126, 164, 0.22)',
    heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(251, 126, 164, 0.24) 0%, transparent 70%)',
    outfitId: 1,
  },
  {
    id: 'burgundy',
    name: 'Oxblood Burgundy',
    color: '#450E16',
    bgGradient: 'radial-gradient(ellipse 95% 85% at 50% 12%, #5E1220 0%, #360910 45%, #0c0c0e 100%)',
    accent: '#D43856',
    accentLight: '#FFA4B4',
    accentGlow: 'rgba(212, 56, 86, 0.38)',
    tagBg: 'rgba(212, 56, 86, 0.16)',
    tagBorder: 'rgba(212, 56, 86, 0.38)',
    tagText: '#FFA4B4',
    badgeBg: 'rgba(212, 56, 86, 0.18)',
    navBorder: 'rgba(212, 56, 86, 0.22)',
    heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(212, 56, 86, 0.24) 0%, transparent 70%)',
    outfitId: 2,
  },
  {
    id: 'orange',
    name: 'Warm Rust',
    color: '#F46208',
    bgGradient: 'radial-gradient(ellipse 95% 85% at 50% 12%, #853300 0%, #4D1D00 45%, #0c0c0e 100%)',
    accent: '#F46208',
    accentLight: '#FFAE6A',
    accentGlow: 'rgba(244, 98, 8, 0.38)',
    tagBg: 'rgba(244, 98, 8, 0.16)',
    tagBorder: 'rgba(244, 98, 8, 0.38)',
    tagText: '#FFC593',
    badgeBg: 'rgba(244, 98, 8, 0.18)',
    navBorder: 'rgba(244, 98, 8, 0.22)',
    heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(244, 98, 8, 0.24) 0%, transparent 70%)',
    outfitId: 3,
  },
  {
    id: 'green',
    name: 'Forest Green',
    color: '#1B3D31',
    bgGradient: 'radial-gradient(ellipse 95% 85% at 50% 12%, #1C4837 0%, #0F271E 45%, #0c0c0e 100%)',
    accent: '#389B78',
    accentLight: '#7ED6B8',
    accentGlow: 'rgba(56, 155, 120, 0.38)',
    tagBg: 'rgba(56, 155, 120, 0.16)',
    tagBorder: 'rgba(56, 155, 120, 0.38)',
    tagText: '#A1EDD5',
    badgeBg: 'rgba(56, 155, 120, 0.18)',
    navBorder: 'rgba(56, 155, 120, 0.22)',
    heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(56, 155, 120, 0.24) 0%, transparent 70%)',
    outfitId: 4,
  },
  {
    id: 'monochrome',
    name: 'Black & White',
    color: '#FFFFFF',
    isSplit: true,
    bgGradient: 'radial-gradient(ellipse 95% 85% at 50% 12%, #26262B 0%, #151518 45%, #08080a 100%)',
    accent: '#FFFFFF',
    accentLight: '#F5F5F7',
    accentGlow: 'rgba(255, 255, 255, 0.35)',
    tagBg: 'rgba(255, 255, 255, 0.08)',
    tagBorder: 'rgba(255, 255, 255, 0.28)',
    tagText: '#FFFFFF',
    badgeBg: 'rgba(255, 255, 255, 0.12)',
    navBorder: 'rgba(255, 255, 255, 0.15)',
    heroGlow: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255, 255, 255, 0.18) 0%, transparent 70%)',
    outfitId: null,
  },
];

export function Home({ onReplayLoader }) {
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [prevTheme, setPrevTheme] = useState(THEMES[0]);

  const handleThemeChange = (newTheme) => {
    if (newTheme.id === activeTheme.id) return;
    setPrevTheme(activeTheme);
    setActiveTheme(newTheme);
  };

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
    <div
      className="zfits-app-container"
      style={{
        '--theme-accent': activeTheme.accent,
        '--theme-accent-light': activeTheme.accentLight,
        '--theme-accent-glow': activeTheme.accentGlow,
        '--theme-tag-bg': activeTheme.tagBg,
        '--theme-tag-border': activeTheme.tagBorder,
        '--theme-tag-text': activeTheme.tagText,
        '--theme-nav-border': activeTheme.navBorder,
        '--theme-badge-bg': activeTheme.badgeBg,
      }}
    >
      {/* ====================================================================
          TOP-TO-BOTTOM CASCADING THEME TRANSITION STAGE
          GPU-accelerated clipPath sweep revealing the incoming color curtain
          from top to bottom with fluid editorial deceleration.
          ==================================================================== */}
      <div className="zfits-theme-stage" aria-hidden="true">
        {/* Baseline Underlayer (Prevents white/dark flash during transition) */}
        <div
          className="zfits-theme-base"
          style={{ background: prevTheme.bgGradient }}
        />

        {/* Incoming Theme Curtain with Top-to-Bottom Wave Cascade */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTheme.id}
            className="zfits-theme-curtain"
            style={{
              background: activeTheme.bgGradient,
            }}
            initial={{
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
              opacity: 0.85,
            }}
            animate={{
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
              opacity: 1,
            }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1], // Luxury cubic editorial ease
            }}
          >
            {/* Ambient Hero Volumetric Flare */}
            <div
              className="zfits-theme-flare"
              style={{
                background: activeTheme.heroGlow,
              }}
            />

            {/* Glowing Traveling Wave Beam that sweeps from top to bottom */}
            <motion.div
              className="zfits-theme-sweep-line"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${activeTheme.accentLight} 50%, transparent 100%)`,
                boxShadow: `0 0 28px ${activeTheme.accentGlow}`,
              }}
              initial={{ top: '0%', opacity: 0.8 }}
              animate={{ top: '100%', opacity: [0.8, 1, 0] }}
              transition={{
                duration: 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Top Navigation */}
      <nav className="zfits-app-nav">
        <div className="nav-left">
          <a href="/" className="nav-logo">
            ZFITS<span className="logo-dot">.</span>
          </a>
          
        </div>

        <div className="nav-links">
          <a href="#wardrobe" className="active">WARDROBE</a>
          
          <a href="#ai-engine">AI STYLIST</a>
          <a href="#archive">ARCHIVE</a>
        </div>

        <div className="nav-actions">
          {/* Circular Theme Swatches */}
          <div
            className="nav-theme-swatches"
            role="radiogroup"
            aria-label="Studio Palette Theme"
          >
            {THEMES.map((theme) => {
              const isSelected = activeTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${theme.name} theme`}
                  title={`Switch to ${theme.name}`}
                  className={`nav-swatch-circle ${isSelected ? 'active' : ''} ${theme.isSplit ? 'split-theme' : ''}`}
                  style={{
                    background: theme.isSplit
                      ? 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 50%, #0c0c0e 50%, #0c0c0e 100%)'
                      : theme.color,
                    boxShadow: isSelected
                      ? `0 0 0 2px #0c0c0e, 0 0 0 4px #FFFFFF, 0 0 16px ${theme.accentGlow}`
                      : undefined,
                  }}
                  onClick={() => handleThemeChange(theme)}
                >
                  {isSelected && <span className={`swatch-indicator-dot ${theme.isSplit ? 'contrast-dot' : ''}`} />}
                </button>
              );
            })}
          </div>

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
          
          <h1 className="app-hero-heading">
            More Outfits.<br />
            <span className="hero-accent-text">Same Wardrobe.</span>
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
            {outfits.map((outfit) => {
              const isMatched = activeTheme.outfitId === outfit.id;
              return (
                <div
                  key={outfit.id}
                  className={`outfit-card ${isMatched ? 'theme-matched' : ''}`}
                  onClick={() => {
                    const matchedTheme = THEMES.find((t) => t.outfitId === outfit.id);
                    if (matchedTheme) handleThemeChange(matchedTheme);
                  }}
                  title="Click to activate this look's theme"
                >
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
                    <span className="outfit-pill">
                      {isMatched ? 'ACTIVE THEME' : outfit.tag}
                    </span>
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
              );
            })}
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

