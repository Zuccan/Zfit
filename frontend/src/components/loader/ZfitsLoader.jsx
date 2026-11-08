import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { LOADER_SCENES, MOTION_CONFIG } from './loaderConfig';
import { BackgroundLayer } from './BackgroundLayer';
import { CharacterStage } from './CharacterStage';
import { LoadingProgress } from './LoadingProgress';
import './ZfitsLoader.css';

/**
 * ZfitsLoader
 * Premium AI Personal Styling Companion inside a Virtual Fashion Studio.
 * Exact 6-Layer Architecture:
 * - Layer 1: Base environmental studio background
 * - Layer 2: Atmospheric lighting & texture
 * - Layer 3: Oversized blurred active garment (dual-layer: atmospheric duplicate + recognizable silhouette)
 * - Layer 4: Sharp foreground character centered relative to actual viewport width
 * - Layer 5: Studio floor reflection & ground contact shadow
 * - Layer 6: Editorial header, progress indicator & outfit information
 */
export function ZfitsLoader({
  onComplete,
  scenes = LOADER_SCENES,
  duration = MOTION_CONFIG.totalDurationSeconds,
}) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [displayedPercent, setDisplayedPercent] = useState(1);
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const progressMotion = useMotionValue(1);
  const animationControlsRef = useRef(null);
  const exitTimeoutRef = useRef(null);

  // 1. Hardware Asset Preload & Decode with Mobile-Optimized Instant-Start
  useEffect(() => {
    let isCancelled = false;

    // Safety fallback: Never keep loader waiting on slower mobile networks
    const safetyTimer = setTimeout(() => {
      if (!isCancelled) setIsAssetsReady(true);
    }, 450);

    async function preloadAssets() {
      try {
        // Eagerly decode only the first active scene (char1 + shirt1) for immediate start
        const firstLookImgs = [scenes[0].characterSrc, scenes[0].outfitSrc];
        const initialPromises = firstLookImgs.map((src) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            if ('decode' in img) {
              img.decode().then(resolve).catch(resolve);
            } else {
              img.onload = resolve;
              img.onerror = resolve;
            }
          });
        });

        await Promise.all([
          ...initialPromises,
          document.fonts ? document.fonts.ready : Promise.resolve(),
        ]);

        if (!isCancelled) {
          clearTimeout(safetyTimer);
          setIsAssetsReady(true);
        }

        // Non-blocking background caching of subsequent outfits
        for (let i = 1; i < scenes.length; i++) {
          const imgC = new Image();
          imgC.src = scenes[i].characterSrc;
          const imgO = new Image();
          imgO.src = scenes[i].outfitSrc;
        }
      } catch (err) {
        console.warn('Preload fallback:', err);
        if (!isCancelled) {
          clearTimeout(safetyTimer);
          setIsAssetsReady(true);
        }
      }
    }

    preloadAssets();

    return () => {
      isCancelled = true;
      clearTimeout(safetyTimer);
      if (animationControlsRef.current) animationControlsRef.current.stop();
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, [scenes]);

  // 2. Single Continuous Progress Animation Engine (1% to 100%)
  useEffect(() => {
    if (!isAssetsReady) return;

    const controls = animate(progressMotion, 100, {
      duration: duration,
      ease: [0.25, 0.1, 0.25, 1.0], // Continuous fashion editorial curve
      onUpdate: (latest) => {
        const rounded = Math.min(100, Math.max(1, Math.round(latest)));
        setDisplayedPercent(rounded);

        // Derive scene state strictly from progress intervals:
        // Scene 01 (Olive): 1% to 22% (shows 10% milestone)
        // Scene 02 (Burgundy): 22% to 48% (shows 30% milestone)
        // Scene 03 (White): 48% to 78% (shows 60% milestone)
        // Scene 04 (Black): 78% to 100% (shows 90% milestone)
        if (latest < 22) {
          setActiveSceneIndex(0);
        } else if (latest < 48) {
          setActiveSceneIndex(1);
        } else if (latest < 78) {
          setActiveSceneIndex(2);
        } else {
          setActiveSceneIndex(3);
        }
      },
      onComplete: () => {
        exitTimeoutRef.current = setTimeout(() => {
          setIsExiting(true);
          exitTimeoutRef.current = setTimeout(() => {
            if (onComplete) onComplete();
          }, MOTION_CONFIG.exitFadeSeconds * 1000);
        }, MOTION_CONFIG.finalHoldSeconds * 1000);
      },
    });

    animationControlsRef.current = controls;

    return () => {
      controls.stop();
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, [isAssetsReady, duration, progressMotion, onComplete]);

  // Keyboard shortcut: Escape to skip
  const handleSkip = useCallback(() => {
    if (animationControlsRef.current) animationControlsRef.current.stop();
    setDisplayedPercent(100);
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 350);
  }, [onComplete]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSkip]);

  const currentScene = scenes[activeSceneIndex];

  return (
    <motion.div
      className="zfits-loader-root"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: MOTION_CONFIG.exitFadeSeconds, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* LAYER 6 (Top): Subtle AI Studio Editorial Header */}
      <header className="zfits-loader-hud" aria-hidden="true">
        <div className="zfits-hud-brand">
          <span className="zfits-hud-title">ZFITS</span>
          <span className="zfits-hud-slash">/</span>
          <span className="zfits-hud-subtitle">AI PERSONAL STYLIST</span>
        </div>
        
      </header>

      {/* LAYER 1 & 2: Environmental Background Canvas & Lighting */}
      <BackgroundLayer currentScene={currentScene} />

      {/* LAYER 3, 4 & 5: Unified Virtual Studio Stage */}
      <CharacterStage currentScene={currentScene} />

      {/* LAYER 6 (Bottom-Right): Tabular Percentage & Active Look Info */}
      <LoadingProgress
        percentage={displayedPercent}
        currentScene={currentScene}
        sceneIndex={activeSceneIndex}
        totalScenes={scenes.length}
      />
    </motion.div>
  );
}
