import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CharacterStage
 * Unified spatial composition for the ZFITS Virtual Fashion Studio:
 * - Layer 3B: Outer atmospheric garment duplicate (soft radiant volume & ambient color bloom)
 * - Layer 3A: Inner recognizable oversized garment cutout (distinct collar, sleeves, shoulders, drop-shadow depth)
 * - Layer 5: Studio floor reflection & ground contact shadow
 * - Layer 4: Sharp foreground fashion avatar horizontally centered relative to the viewport
 */
export const CharacterStage = memo(function CharacterStage({ currentScene }) {
  return (
    <div className="zfits-stage-chamber" aria-hidden="false">
      {/* UNIFIED CO-ANCHORED STAGE COMPOSITION: Shared horizontal & vertical coordinate frame */}
      <div className="zfits-stage-composition">
        {/* LAYER 5: Studio floor reflection spotlight directly beneath sneakers */}
        <div
          className="zfits-floor-spotlight"
          style={{
            background: currentScene.floorSpotlight || 'transparent',
          }}
          aria-hidden="true"
        />

        {/* LAYER 3B: Outer Atmospheric Garment Duplicate (Larger scale, softer bloom) */}
        <div className="zfits-garment-chamber atmospheric" aria-hidden="true">
          <AnimatePresence mode="sync">
            <motion.div
              key={`atm-${currentScene.id}`}
              className="zfits-garment-frame"
              initial={{ opacity: 0 }}
              animate={{
                opacity: currentScene.garmentAtmosphericOpacity ?? 0.38,
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
                  filter: `blur(${currentScene.garmentAtmosphericBlur ?? 34}px) saturate(140%)`,
                  transform: `scale(${currentScene.garmentAtmosphericScale ?? 1.72})`,
                }}
                loading="eager"
                decoding="sync"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* LAYER 3A: Inner Recognizable Garment Cutout (Distinct shape, enhanced contrast & 3D shadow) */}
        <div className="zfits-garment-chamber recognizable" aria-hidden="true">
          <AnimatePresence mode="sync">
            <motion.div
              key={`rec-${currentScene.id}`}
              className="zfits-garment-frame"
              initial={{ opacity: 0 }}
              animate={{
                opacity: currentScene.garmentRecognizableOpacity ?? 0.65,
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
                  filter: `blur(${currentScene.garmentRecognizableBlur ?? 14}px) contrast(1.18) saturate(128%) drop-shadow(0 10px 36px rgba(0, 0, 0, 0.30))`,
                  transform: `scale(${currentScene.garmentRecognizableScale ?? 1.52})`,
                }}
                loading="eager"
                decoding="sync"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* LAYER 5: Studio ground contact shadow under white sneakers */}
        <div className="zfits-sneaker-shadow" aria-hidden="true" />

        {/* LAYER 4: Sharp Foreground Character (Co-anchored to same composition frame) */}
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
    </div>
  );
});
