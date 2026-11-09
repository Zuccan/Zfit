import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TagScene } from './TagScene';
import { LoaderTransition } from './LoaderTransition';
import './Loader.css';

/**
 * ZfitsLoader (V9)
 * Industrial Retail Rolling Shutter + Interactive Tag Trigger:
 * - Hanging black ZFITs fashion tag suspended in front of closed architectural rolling shutter
 * - 38 horizontal interlocking slats spanning the full viewport
 * - Downward intentional pull on the tag activates the shutter mechanism
 * - Shutter slats roll UPWARD and wrap into top concealed roller drum
 * - Homepage hero is progressively revealed behind the rising shutter from bottom to top
 * - Clean editorial design: zero instructions, zero skip buttons, zero scrollbars
 */
export function ZfitsLoader({ onHeroRevealReady, onComplete }) {
  const overlayRef = useRef(null);
  const isTransitioningRef = useRef(false);

  const [rollProgress, setRollProgress] = useState(0);
  const [clipProgress, setClipProgress] = useState(0);
  const [tagOpacity, setTagOpacity] = useState(1);

  // Disable page scrolling during the interactive loader
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Triggered when user pulls tag downward past activation threshold
  const handleTriggerShutter = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.orchestrateShutterOpening({
      onUpdateRollProgress: (p) => setRollProgress(p),
      onUpdateClipProgress: (p) => setClipProgress(p),
      onUpdateTagOpacity: (o) => setTagOpacity(o),
      onHeroRevealReady,
      onComplete,
    });
  }, [onHeroRevealReady, onComplete]);

  // Keyboard Escape accessibility fallback
  const handleKeyboardSkip = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    LoaderTransition.animateSkip({
      onUpdateRollProgress: (p) => setRollProgress(p),
      onUpdateClipProgress: (p) => setClipProgress(p),
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

  // Bottom edge percentage for clipping (100% when closed, 0% when fully open)
  const bottomEdgePercent = Math.max(0, Math.min(100, (1 - clipProgress) * 100));

  const clipStyle = clipProgress > 0
    ? {
        clipPath: `polygon(0 0, 100% 0, 100% ${bottomEdgePercent.toFixed(2)}%, 0 ${bottomEdgePercent.toFixed(2)}%)`,
        WebkitClipPath: `polygon(0 0, 100% 0, 100% ${bottomEdgePercent.toFixed(2)}%, 0 ${bottomEdgePercent.toFixed(2)}%)`,
      }
    : undefined;

  return (
    <div
      ref={overlayRef}
      className="zfits-3d-loader-root"
      style={clipStyle}
      role="dialog"
      aria-label="ZFITs Boutique Entrance"
    >
      {/* Interactive 3D WebGL Canvas Layer */}
      <div className="zfits-3d-canvas-wrap">
        <TagScene
          rollProgress={rollProgress}
          onTriggerShutter={handleTriggerShutter}
          tagOpacity={tagOpacity}
        />
      </div>

      {/* Shutter bottom edge drop shadow cast onto homepage during upward roll */}
      {clipProgress > 0 && clipProgress < 0.99 && (
        <div
          className="zfits-shutter-bottom-shadow"
          style={{ top: `${bottomEdgePercent}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
