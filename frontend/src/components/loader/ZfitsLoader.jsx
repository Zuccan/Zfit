import React, { useRef, useEffect, useCallback } from 'react';
import { TagScene } from './TagScene';
import { LoaderTransition } from './LoaderTransition';
import './Loader.css';

/**
 * ZfitsLoader (V13)
 * Full-Screen Slide-Down Loader + Progressive Hero Reveal:
 * - Minimal, clean warm-white studio environment (#F8F7F4)
 * - Ultra-thin black ZFITs fashion tag suspended by black cotton rope
 * - Natural swing, 360° spinning inertia, and pointer drag interactions
 * - Deliberate downward pull triggers full-screen vertical slide-down
 * - The entire loader panel slides down (0% -> 100%), progressively unveiling the luxury hero
 * - Keyboard Escape shortcut for instant accessibility
 */
export function ZfitsLoader({ onHeroRevealReady, onComplete }) {
  const panelRef = useRef(null);
  const isTransitioningRef = useRef(false);

  // Trigger slide-down transition
  const handleTriggerSlideDown = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.orchestrateSlideDown({
      panelEl: panelRef.current,
      onHeroRevealReady,
      onComplete,
    });
  }, [onHeroRevealReady, onComplete]);

  // Keyboard Escape accessibility shortcut
  const handleKeyboardSkip = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.animateSkip({
      panelEl: panelRef.current,
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
      ref={panelRef}
      className="zfits-loader-panel"
      role="dialog"
      aria-label="ZFITs Fashion Studio Entry"
    >
      {/* Interactive 3D WebGL Canvas Layer */}
      <div className="zfits-3d-canvas-wrap">
        <TagScene onTriggerSlideDown={handleTriggerSlideDown} />
      </div>
    </div>
  );
}
