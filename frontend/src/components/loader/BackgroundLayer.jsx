import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BackgroundLayer (Layer A)
 * Full-screen environmental color gradient matching the editorial scenes
 * with subtle lens vignette border.
 */
export const BackgroundLayer = memo(function BackgroundLayer({ currentScene }) {
  const { center, mid, edge, vignette } = currentScene.palette;

  return (
    <div className="zfits-bg-layer-root" aria-hidden="true">
      {/* Environmental Radial Gradient with smooth crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${currentScene.id}`}
          className="zfits-bg-gradient"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          style={{
            background: `radial-gradient(ellipse 92% 85% at 50% 36%, ${center} 0%, ${mid} 50%, ${edge} 100%)`,
          }}
        />
      </AnimatePresence>

      {/* Subtle Lens Inset Vignette Frame */}
      <div
        className="zfits-vignette-frame"
        style={{
          boxShadow: `inset 0 0 clamp(60px, 8vw, 140px) ${vignette}`,
        }}
      />
    </div>
  );
});
