import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { TagScene } from './TagScene';
import { LoaderTransition } from './LoaderTransition';
import './Loader.css';

/**
 * ZfitsLoader (V6)
 * Coordinated 3D Hanging Tag Loader with Header Following & Full-Screen Cover Reveal:
 * - Suspended 3D black paper tag with coupled Verlet rope physics
 * - Real-time header translation following the user's downward pull
 * - Deliberate downward pull detection triggers orchestrated website-opening sequence
 * - Full-screen cover-down transition to unveil the homepage hero
 * - Unobtrusive skip control with keyboard Escape support
 */
export function ZfitsLoader({ onHeroRevealReady, onComplete }) {
  const overlayRef = useRef(null);
  const masterGroupRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const coverRef = useRef(null);
  const isTransitioningRef = useRef(false);

  const [isTensionHigh, setIsTensionHigh] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  // Real-time synchronization: translate header down as tag is pulled down
  const handlePullProgress = useCallback(({ pullPixels, isDraggingCard }) => {
    if (isTransitioningRef.current || !headerRef.current) return;

    if (isDraggingCard && pullPixels > 0) {
      // Controlled motion ratio: 140px pull translates header down by ~50px
      const headerY = Math.min(105, pullPixels * 0.38);
      headerRef.current.style.transform = `translate3d(0, ${headerY}px, 0)`;
    } else if (!isDraggingCard) {
      // When released or during normal swinging, spring header back to top smoothly
      gsap.to(headerRef.current, {
        y: 0,
        duration: 0.42,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }
  }, []);

  // Trigger coordinated opening sequence when user pulls down past threshold and releases
  const triggerReveal = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.orchestrateOpeningSequence({
      masterGroup: masterGroupRef.current,
      headerEl: headerRef.current,
      coverEl: coverRef.current,
      loaderOverlayEl: overlayRef.current,
      footerEl: footerRef.current,
      onHeroRevealReady,
      onComplete,
    });
  }, [onHeroRevealReady, onComplete]);

  // Fast skip if user explicitly chooses to skip
  const handleSkip = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.animateSkip({
      coverEl: coverRef.current,
      loaderOverlayEl: overlayRef.current,
      onHeroRevealReady,
      onComplete,
    });
  }, [onHeroRevealReady, onComplete]);

  // Handle keyboard Escape for manual skip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  // Once 3D scene mounts and is ready, trigger smooth entrance drop
  const handleSceneReady = useCallback(() => {
    if (hasEntered) return;
    setHasEntered(true);
    if (masterGroupRef.current) {
      LoaderTransition.animateEntry(masterGroupRef.current);
    }
  }, [hasEntered]);

  return (
    <>
      <div ref={overlayRef} className="zfits-3d-loader-root" role="dialog" aria-label="ZFITs Entry Experience">
        {/* Synchronized Editorial Header */}
        <header ref={headerRef} className="loader-header">
          <div className="loader-brand">
            <span className="loader-brand-title">ZFITs</span>
            <span className="loader-brand-sub">/ AI Personal Stylist</span>
          </div>

          <button
            className="loader-skip-btn"
            onClick={handleSkip}
            aria-label="Skip interactive loader"
            title="Press Esc or click to skip"
          >
            <span>Skip</span>
            <span aria-hidden="true">↵</span>
          </button>
        </header>

        {/* Interactive 3D WebGL Canvas Layer */}
        <div className="zfits-3d-canvas-wrap">
          <TagScene
            masterGroupRef={masterGroupRef}
            onPullTrigger={triggerReveal}
            onPullProgress={handlePullProgress}
            onTensionChange={setIsTensionHigh}
            onSceneReady={handleSceneReady}
          />
        </div>

        {/* Unobtrusive Interaction Guidance */}
        <footer ref={footerRef} className="loader-footer">
          <div className={`loader-hint ${isTensionHigh ? 'tension-high' : ''}`}>
            <span>{isTensionHigh ? 'Release to Enter' : 'Drag Card or Cord to Swing'}</span>
            <span className="loader-hint-dot" aria-hidden="true" />
            <span>{isTensionHigh ? 'ZFITs Studio' : 'Pull Down to Enter'}</span>
          </div>

          <div className={`loader-pull-indicator ${isTensionHigh ? 'tension-high' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 13 12 18 17 13" />
              <polyline points="7 6 12 11 17 6" />
            </svg>
          </div>
        </footer>
      </div>

      {/* Dedicated Full-Screen Cover-Down Curtain */}
      <div ref={coverRef} className="zfits-cover-curtain" aria-hidden="true">
        <div className="cover-leading-glow" />
        <div className="cover-brand-mark">
          <span className="cover-brand-title">ZFITS</span>
          <span className="cover-brand-sub">STUDIO</span>
        </div>
      </div>
    </>
  );
}
