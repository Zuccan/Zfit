import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TagScene } from './TagScene';
import { LoaderTransition } from './LoaderTransition';
import './Loader.css';

/**
 * ZfitsLoader
 * Master entry loader component:
 * - Suspended interactive 3D fashion tag in R3F
 * - Authentic ZFITs logo preservation
 * - Independent 3-DOF pendulum physics
 * - Deliberate downward pull-to-enter trigger
 * - Subtle skip & Escape key accessibility
 */
export function ZfitsLoader({ onComplete }) {
  const overlayRef = useRef(null);
  const masterGroupRef = useRef(null);
  const isTransitioningRef = useRef(false);

  const [isTensionHigh, setIsTensionHigh] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  // Trigger hero reveal when user pulls down past threshold and releases
  const triggerReveal = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.animateHeroReveal(masterGroupRef.current, overlayRef.current, {
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }, [onComplete]);

  // Fast skip for accessibility or immediate entry
  const handleSkip = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.animateSkip(overlayRef.current, {
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }, [onComplete]);

  // Handle keyboard Escape for immediate skip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  // Honor prefers-reduced-motion accessibility preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      handleSkip();
    }
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
    <div ref={overlayRef} className="zfits-3d-loader-root" role="dialog" aria-label="ZFITs Entry Experience">
      {/* Editorial Header */}
      <header className="loader-header">
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
          onTensionChange={setIsTensionHigh}
          onSceneReady={handleSceneReady}
        />
      </div>

      {/* Subtle Unobtrusive Interaction Guidance */}
      <footer className="loader-footer">
        <div className={`loader-hint ${isTensionHigh ? 'tension-high' : ''}`}>
          <span>{isTensionHigh ? 'Release to Enter' : 'Drag to Swing'}</span>
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
  );
}
