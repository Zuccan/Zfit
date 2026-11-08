import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CharacterStage
 * Unified spatial composition for the ZFITS Virtual Fashion Studio:
 * - Layer 3B: Outer atmospheric garment duplicate (soft volume & ambient color bloom)
 * - Layer 3A: Inner recognizable oversized garment cutout (distinct collar, sleeves, shoulders)
 * - Layer 5: Studio floor reflection & ground contact shadow
 * - Layer 4: Sharp foreground fashion avatar horizontally centered relative to the viewport
 */
export const CharacterStage = memo(function CharacterStage({ currentScene }) {
  return (
    <div className="zfits-stage-chamber" aria-hidden="false">
      {/* LAYER 3B: Outer Atmospheric Garment Duplicate (Larger scale, softer blur) */}
      <div className="zfits-garment-chamber atmospheric" aria-hidden="true">
        <AnimatePresence mode="sync">
          <motion.div
            key={`atm-${currentScene.id}`}
            className="zfits-garment-frame"
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentScene.garmentAtmosphericOpacity ?? 0.22,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.9,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <img
              src={currentScene.outfitSrc}
              alt=""
              className="zfits-blurred-garment atmospheric-blur"
              style={{
                filter: `blur(${currentScene.garmentAtmosphericBlur ?? 38}px) saturate(135%)`,
                transform: `scale(${currentScene.garmentAtmosphericScale ?? 1.66})`,
              }}
              loading="eager"
              decoding="sync"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* LAYER 3A: Inner Recognizable Garment Cutout (12-18px blur, distinct shape & details) */}
      <div className="zfits-garment-chamber recognizable" aria-hidden="true">
        <AnimatePresence mode="sync">
          <motion.div
            key={`rec-${currentScene.id}`}
            className="zfits-garment-frame"
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentScene.garmentRecognizableOpacity ?? 0.35,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.9,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <img
              src={currentScene.outfitSrc}
              alt=""
              className="zfits-blurred-garment recognizable-blur"
              style={{
                filter: `blur(${currentScene.garmentRecognizableBlur ?? 16}px) saturate(120%)`,
                transform: `scale(${currentScene.garmentRecognizableScale ?? 1.46})`,
              }}
              loading="eager"
              decoding="sync"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* LAYER 5: Studio floor reflection spotlight directly beneath sneakers */}
      <div
        className="zfits-floor-spotlight"
        style={{
          background: currentScene.floorSpotlight || 'transparent',
        }}
        aria-hidden="true"
      />

      {/* LAYER 5: Studio ground contact shadow under white sneakers */}
      <div className="zfits-sneaker-shadow" aria-hidden="true" />

      {/* LAYER 4: Sharp Foreground Character (Centered horizontally relative to actual viewport) */}
      <div
        className="zfits-character-box"
        role="img"
        aria-label={`Character: ${currentScene.name}`}
      >
        <AnimatePresence mode="sync">
          <motion.img
            key={`char-${currentScene.id}`}
            src={currentScene.characterSrc}
            alt={currentScene.name}
            className="zfits-character-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.85,
              ease: [0.4, 0, 0.2, 1],
            }}
            loading="eager"
            decoding="sync"
          />
        </AnimatePresence>
      </div>
    </div>
  );
});
