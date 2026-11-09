import React, { useRef, useEffect, useCallback } from 'react';
import { TagScene } from './TagScene';
import { LoaderTransition } from './LoaderTransition';
import './Loader.css';

/**
 * ZfitsLoader (V8)
 * Physically Connected Installation:
 * - 3D Full-Width Ivory Header Panel
 * - Black Braided Cotton Suspension Rope connected to the header's underside bracket
 * - Ultra-Thin Black ZFITs Fashion Tag hanging beneath
 * - Pure editorial installation: No skip buttons, no drag hints, no UI clutter
 * - Downward pull releases header breakaway constraint -> entire assembly falls under real gravity
 * - Full-screen warm ivory cover transition reveals the ZFITs homepage hero
 */
export function ZfitsLoader({ onHeroRevealReady, onComplete }) {
  const overlayRef = useRef(null);
  const coverRef = useRef(null);
  const isTransitioningRef = useRef(false);

  // Disable page scrolling during the interactive loader experience
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Called when the falling physical assembly exits past the bottom of the viewport under gravity
  const handleAssemblyExit = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.orchestrateAssemblyExit({
      coverEl: coverRef.current,
      loaderOverlayEl: overlayRef.current,
      onHeroRevealReady,
      onComplete,
    });
  }, [onHeroRevealReady, onComplete]);

  // Keyboard Escape accessibility fallback
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

  return (
    <>
      <div
        ref={overlayRef}
        className="zfits-3d-loader-root"
        role="dialog"
        aria-label="ZFITs Entry Experience"
      >
        {/* Interactive 3D WebGL Canvas Layer */}
        <div className="zfits-3d-canvas-wrap">
          <TagScene onAssemblyExit={handleAssemblyExit} />
        </div>
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
