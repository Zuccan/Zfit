import gsap from 'gsap';

/**
 * LoaderTransition (V13)
 * Full-Screen Slide-Down Transition:
 * FRAME 01: Loader panel covers 100% of the viewport (#F8F7F4 studio background + 3D tag).
 * FRAME 02: Deliberate downward tag pull triggers panel to slide vertically downward (translateY 0% -> 100%),
 *           progressively revealing the luxury homepage hero behind it.
 * FRAME 03: Loader completely exits below viewport, unmounts, and normal scrolling is restored.
 */
export const LoaderTransition = {
  /**
   * Signature Slide-Down Transition
   * @param {Object} options
   * @param {HTMLElement} options.panelEl - The full-screen loader container element
   * @param {Function} options.onHeroRevealReady - Called at ~35% descent to trigger staggered hero entrance
   * @param {Function} options.onComplete - Called when panel has completely exited the viewport
   */
  orchestrateSlideDown({ panelEl, onHeroRevealReady, onComplete }) {
    if (!panelEl) {
      if (onHeroRevealReady) onHeroRevealReady();
      if (onComplete) onComplete();
      return gsap.timeline();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    // Ensure initial transform state
    gsap.set(panelEl, {
      yPercent: 0,
      pointerEvents: 'none',
      force3D: true,
    });

    // Smooth, weighted physical slide-down motion in direct sync with the tag snap
    tl.to(panelEl, {
      yPercent: 100,
      duration: 1.15,
      ease: 'power3.inOut',
    }, 0);

    // Progressive hero reveal: trigger entrance animation as the hero begins unveiling
    tl.add(() => {
      if (onHeroRevealReady) onHeroRevealReady();
    }, 0.32);

    return tl;
  },

  /**
   * Fast Accessibility Skip (Keyboard Escape)
   */
  animateSkip({ panelEl, onHeroRevealReady, onComplete }) {
    if (!panelEl) {
      if (onHeroRevealReady) onHeroRevealReady();
      if (onComplete) onComplete();
      return gsap.timeline();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    gsap.set(panelEl, { pointerEvents: 'none', force3D: true });

    tl.to(panelEl, {
      yPercent: 100,
      duration: 0.45,
      ease: 'power3.in',
    }, 0);

    tl.add(() => {
      if (onHeroRevealReady) onHeroRevealReady();
    }, 0.15);

    return tl;
  },
};
