import gsap from 'gsap';

/**
 * LoaderTransition (V9)
 * Orchestrates the Retail Rolling Shutter Opening Sequence:
 * - Upward roll of 38 horizontal interlocking slats into top cylindrical roller housing
 * - Progressive reveal of the ZFITs homepage hero behind the rising shutter from bottom to top
 * - Clean handoff to homepage interactive state with zero falling panels
 */
export const LoaderTransition = {
  /**
   * Orchestrates the rolling shutter reveal sequence
   */
  orchestrateShutterOpening({
    onUpdateRollProgress,
    onUpdateTagOpacity,
    onUpdateClipProgress,
    onHeroRevealReady,
    onComplete,
  }) {
    const isReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReducedMotion) {
      if (onUpdateRollProgress) onUpdateRollProgress(1);
      if (onUpdateClipProgress) onUpdateClipProgress(1);
      if (onHeroRevealReady) onHeroRevealReady();
      if (onComplete) onComplete();
      return gsap.timeline();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    const state = {
      progress: 0,
      tagOpacity: 1,
    };

    // 1. Roll shutter slats upward into top housing over 1.25s
    tl.to(state, {
      progress: 1.0,
      duration: 1.25,
      ease: 'power3.inOut',
      onUpdate: () => {
        if (onUpdateRollProgress) {
          onUpdateRollProgress(state.progress);
        }
        if (onUpdateClipProgress) {
          onUpdateClipProgress(state.progress);
        }
      },
    }, 0);

    // 2. Tag smoothly ascends and fades as the bottom slat clears the center (around 0.55s - 0.95s)
    tl.to(state, {
      tagOpacity: 0,
      duration: 0.40,
      ease: 'power2.in',
      onUpdate: () => {
        if (onUpdateTagOpacity) {
          onUpdateTagOpacity(state.tagOpacity);
        }
      },
    }, 0.55);

    // 3. Hero content begins staggered entrance as the shutter clears the main viewport (at 0.75s)
    tl.add(() => {
      if (onHeroRevealReady) {
        onHeroRevealReady();
      }
    }, 0.75);

    return tl;
  },

  /**
   * Fast Skip Transition (Keyboard Accessibility - Escape key)
   */
  animateSkip({
    onUpdateRollProgress,
    onUpdateClipProgress,
    onHeroRevealReady,
    onComplete,
  }) {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    const state = { progress: 0 };

    tl.to(state, {
      progress: 1.0,
      duration: 0.45,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (onUpdateRollProgress) onUpdateRollProgress(state.progress);
        if (onUpdateClipProgress) onUpdateClipProgress(state.progress);
      },
    }, 0);

    tl.add(() => {
      if (onHeroRevealReady) onHeroRevealReady();
    }, 0.25);

    return tl;
  },
};
