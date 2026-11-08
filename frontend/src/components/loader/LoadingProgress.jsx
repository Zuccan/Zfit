import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LoadingProgress (Layer 6)
 * Permanently pinned to the bottom-right corner.
 * Features:
 * - Haas Regular tabular numerals for continuous progress interpolation (10%, 30%, 60%, 90%)
 * - Subtle active look identifier and outfit name synchronized to scene changes
 * - Completely independent positioning (fixed viewport dock, zero influence on character center)
 */
export const LoadingProgress = memo(function LoadingProgress({
  percentage,
  currentScene,
  sceneIndex,
  totalScenes,
}) {
  return (
    <aside
      className="zfits-progress-dock"
      aria-live="polite"
      aria-label={`Styling curation: ${percentage}%`}
    >
      {/* Editorial look index and active outfit info */}
      <div className="zfits-progress-meta">
        <span className="zfits-meta-tag">{currentScene.code || `LOOK 0${sceneIndex + 1} // 0${totalScenes}`}</span>
        <span className="zfits-meta-sep">.</span>
        <div className="zfits-meta-title-viewport">
          <AnimatePresence mode="wait">
            <motion.span
              key={currentScene.id}
              className="zfits-meta-title"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {currentScene.name}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Permanently anchored tabular percentage digits */}
      <div className="zfits-percentage-row">
        <span className="zfits-numeral-digits">{percentage}</span>
        <span className="zfits-numeral-percent">%</span>
      </div>
    </aside>
  );
});
