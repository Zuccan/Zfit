import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { TagScene } from './TagScene';
import { ClothPhysics } from './ClothPhysics';
import { LoaderTransition } from './LoaderTransition';
import './Loader.css';

/**
 * ZfitsLoader (V12)
 * Physical Breakaway Fashion Tag + Realistic Fabric Release:
 * - Minimal, clean warm white studio environment (#F8F7F4)
 * - Suspended black ZFITs fashion tag attached to breakable upper anchor
 * - Downward pull builds tension; strong pull physically breaks upper connection
 * - Tag plummets under gravity with loose string and frayed fiber particles
 * - Breakaway immediately triggers suspended silk fabric drop
 * - Fabric cascades downward with authentic folds, unveiling the luxury homepage
 * - Authoritative State Machine:
 *   IDLE → DRAGGING → TENSIONED → DETACHED → FABRIC_RELEASED → HERO_REVEALED
 */
export function ZfitsLoader({ onHeroRevealReady, onComplete }) {
  const rootRef = useRef(null);

  // Track transition state
  const isTransitioningRef = useRef(false);
  const heroRevealedRef = useRef(false);

  // Particle-based Verlet cloth physics instance created once
  const clothPhysics = useMemo(() => {
    return new ClothPhysics({
      gravity: -14.0,
      damping: 0.982,
      iterations: 4,
    });
  }, []);

  // Frame-by-frame cloth progress handler
  const handleClothProgress = useCallback((result) => {
    if (result.isReleased) {
      const topPct = Math.max(0, Math.min(100, (1 - result.topEdgeNormalized) * 100));

      // Dynamically clip loader root in sync with the falling top edge of the silk
      if (rootRef.current) {
        rootRef.current.style.clipPath = `polygon(0 ${topPct.toFixed(2)}%, 100% ${topPct.toFixed(2)}%, 100% 100%, 0 100%)`;
        rootRef.current.style.webkitClipPath = `polygon(0 ${topPct.toFixed(2)}%, 100% ${topPct.toFixed(2)}%, 100% 100%, 0 100%)`;
      }

      // Trigger hero entrance as fabric falls past the upper third of the viewport
      if (topPct > 35 && !heroRevealedRef.current) {
        heroRevealedRef.current = true;
        if (onHeroRevealReady) onHeroRevealReady();
      }

      // Check if fabric has completely dropped out of the viewport
      if (result.isFullyExited && !isTransitioningRef.current) {
        isTransitioningRef.current = true;
        if (!heroRevealedRef.current) {
          heroRevealedRef.current = true;
          if (onHeroRevealReady) onHeroRevealReady();
        }
        if (onComplete) onComplete();
      }
    }
  }, [onHeroRevealReady, onComplete]);

  // Keyboard Escape accessibility fallback
  const handleKeyboardSkip = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.animateSkip({
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
    <div
      ref={rootRef}
      className="zfits-3d-loader-root"
      role="dialog"
      aria-label="ZFITs Fashion Studio Entry"
    >
      {/* Interactive 3D WebGL Canvas Layer */}
      <div className="zfits-3d-canvas-wrap">
        <TagScene
          clothPhysics={clothPhysics}
          onClothProgress={handleClothProgress}
        />
      </div>
    </div>
  );
}
