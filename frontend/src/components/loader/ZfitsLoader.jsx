import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { TagScene } from './TagScene';
import { LoaderTransition } from './LoaderTransition';
import './Loader.css';

/**
 * ZfitsLoader (V7)
 * Coordinated 3D Hanging Tag Loader with Solid Header Detachment & Warm Ivory Cover Reveal:
 * - Suspended 3D black paper tag with coupled Verlet rope physics
 * - Uncapped real-time header translation following the user's downward pull
 * - On deliberate pull, the entire header panel physically DETACHES and FALLS OUT of the viewport
 * - Full-screen warm ivory and white cover-down transition to unveil the homepage hero
 * - Pure editorial UI: No skip button cluttering the scene
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

  // Real-time synchronization: translate header down as tag is pulled down (no artificial 105px cap)
  const handlePullProgress = useCallback(({ pullPixels, screenDx, isDraggingCard }) => {
    if (isTransitioningRef.current || !headerRef.current) return;

    if (isDraggingCard && pullPixels > 0) {
      // Responsive 1:0.52 motion ratio without artificial clamp
      const headerY = pullPixels * 0.52;
      const tilt = typeof screenDx === 'number' ? Math.max(-2.5, Math.min(2.5, (screenDx / 350) * 2)) : 0;
      headerRef.current.style.transform = `translate3d(0, ${headerY}px, 0) rotate(${tilt}deg)`;
    } else if (!isDraggingCard) {
      // When released without triggering threshold, smoothly spring header back to top
      gsap.to(headerRef.current, {
        y: 0,
        rotation: 0,
        duration: 0.45,
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

  // Keyboard Escape accessibility shortcut (no visible button)
  const handleKeyboardSkip = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.animateSkip({
      coverEl: coverRef.current,
      loaderOverlayEl: overlayRef.current,
      onHeroRevealReady,
      onComplete,
    });
  }, [onHeroRevealReady, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleKeyboardSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyboardSkip]);

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
        {/* Synchronized Editorial Header (Solid Detachable Panel) */}
        <header ref={headerRef} className="loader-header">
          <div className="loader-brand">
            <span className="loader-brand-title">ZFITs</span>
            <span className="loader-brand-sub">/ AI Personal Stylist</span>
          </div>
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

      {/* Full-Screen Warm Ivory & White Cover-Down Curtain */}
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
