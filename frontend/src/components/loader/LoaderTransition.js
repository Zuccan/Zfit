import gsap from 'gsap';

/**
 * LoaderTransition (V8)
 * Coordinates the website-opening sequence when the physical assembly
 * (Header -> Rope -> Tag) falls out of the viewport under true gravity.
 */
export const LoaderTransition = {
  /**
   * Orchestrates the clean homepage hero reveal upon assembly exit
   */
  orchestrateAssemblyExit({
    coverEl,
    loaderOverlayEl,
    onHeroRevealReady,
    onComplete,
  }) {
    const isReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReducedMotion) {
      if (onHeroRevealReady) onHeroRevealReady();
      if (loaderOverlayEl) {
        loaderOverlayEl.style.opacity = '0';
        loaderOverlayEl.style.pointerEvents = 'none';
      }
      if (onComplete) onComplete();
      return gsap.timeline();
    }

    const tl = gsap.timeline();

    // 1. Warm ivory satin cover curtain sweeps down as the physical assembly exits
    if (coverEl) {
      tl.fromTo(coverEl, {
        y: '-100%',
      }, {
        y: '0%',
        duration: 0.55,
        ease: 'power3.inOut',
      }, 0);

      // 2. When screen is blanketed by the ivory cover, prime homepage & hide 3D canvas
      tl.add(() => {
        if (onHeroRevealReady) onHeroRevealReady();
        if (loaderOverlayEl) {
          loaderOverlayEl.style.opacity = '0';
          loaderOverlayEl.style.pointerEvents = 'none';
        }
      }, 0.52);

      // 3. Cover sweeps downward off the screen, unveiling the dark luxury homepage hero
      tl.to(coverEl, {
        y: '100%',
        duration: 0.65,
        ease: 'power3.inOut',
      }, 0.56);
    } else {
      tl.add(() => {
        if (onHeroRevealReady) onHeroRevealReady();
        if (loaderOverlayEl) {
          loaderOverlayEl.style.opacity = '0';
          loaderOverlayEl.style.pointerEvents = 'none';
        }
      }, 0.2);
    }

    // 4. Final teardown
    tl.add(() => {
      if (onComplete) onComplete();
    }, 1.25);

    return tl;
  },

  /**
   * Fast Skip Transition (Keyboard Accessibility)
   */
  animateSkip({
    coverEl,
    loaderOverlayEl,
    onHeroRevealReady,
    onComplete,
  }) {
    const isReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReducedMotion || !coverEl) {
      if (onHeroRevealReady) onHeroRevealReady();
      if (loaderOverlayEl) {
        loaderOverlayEl.style.opacity = '0';
        loaderOverlayEl.style.pointerEvents = 'none';
      }
      if (onComplete) onComplete();
      return;
    }

    const tl = gsap.timeline();

    tl.fromTo(coverEl, {
      y: '-100%',
    }, {
      y: '0%',
      duration: 0.32,
      ease: 'power2.inOut',
    }, 0);

    tl.add(() => {
      if (onHeroRevealReady) onHeroRevealReady();
      if (loaderOverlayEl) {
        loaderOverlayEl.style.opacity = '0';
        loaderOverlayEl.style.pointerEvents = 'none';
      }
    }, 0.32);

    tl.to(coverEl, {
      y: '100%',
      duration: 0.32,
      ease: 'power2.inOut',
    }, 0.35);

    tl.add(() => {
      if (onComplete) onComplete();
    }, 0.70);
  },
};
