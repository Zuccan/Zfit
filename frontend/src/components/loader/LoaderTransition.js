import gsap from 'gsap';

/**
 * LoaderTransition (V7)
 * Orchestrates the coordinated 7-phase website-opening animation sequence:
 * - Phase A: Deliberate pull crosses activation threshold
 * - Phase B: Tag accelerates downward through the bottom of the viewport
 * - Phase C: Entire header panel physically DETACHES and FALLS OUT of the viewport as a solid panel
 * - Phase D: Full-screen warm ivory & white cover curtain descends across the viewport
 * - Phase E: Hero becomes ready and visible behind the descending cover
 * - Phase F: Cover wipes away downward revealing the ZFITs homepage hero
 * - Phase G: Clean teardown of loader resources and temporary listeners
 */
export const LoaderTransition = {
  /**
   * Smooth entrance drop of the tag on initial mount
   */
  animateEntry(targetGroup, { onComplete } = {}) {
    if (!targetGroup) return gsap.timeline();

    const tl = gsap.timeline({ onComplete });
    targetGroup.position.y = 0.55;
    targetGroup.scale.set(0.97, 0.97, 0.97);

    tl.to(targetGroup.position, {
      y: 0,
      duration: 1.0,
      ease: 'power2.out',
    }, 0);

    tl.to(targetGroup.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.9,
      ease: 'power2.out',
    }, 0.1);

    return tl;
  },

  /**
   * Signature Coordinated Opening Sequence
   */
  orchestrateOpeningSequence({
    masterGroup,
    headerEl,
    coverEl,
    loaderOverlayEl,
    footerEl,
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

    // PHASE B: Tag accelerates downward completely past the bottom of viewport
    if (masterGroup) {
      tl.to(masterGroup.position, {
        y: -3.8,
        z: 1.6,
        duration: 0.82,
        ease: 'power2.in',
      }, 0);

      tl.to(masterGroup.scale, {
        x: 1.15,
        y: 1.15,
        z: 1.15,
        duration: 0.82,
        ease: 'power2.in',
      }, 0);
    }

    // PHASE C: The entire header panel physically DETACHES and FALLS OUT of the viewport as a SOLID PANEL
    if (headerEl) {
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
      const fullFallDistance = viewportHeight + 200;

      tl.to(headerEl, {
        y: fullFallDistance,
        rotation: (Math.random() - 0.5) * 3, // Subtle natural physical tilt as it falls
        duration: 0.82,
        ease: 'power2.in',
        // Opacity is preserved: it falls as a SOLID panel without premature fading!
      }, 0);
    }

    // Footer indicator slides away
    if (footerEl) {
      tl.to(footerEl, {
        y: 120,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.in',
      }, 0);
    }

    // PHASE D: Full-screen warm ivory & white cover curtain descends across the viewport
    if (coverEl) {
      tl.fromTo(coverEl, {
        y: '-100%',
      }, {
        y: '0%',
        duration: 0.72,
        ease: 'power3.inOut',
      }, 0.12);

      // PHASE E: When cover fully blankets screen, make homepage hero active & hide 3D canvas
      tl.add(() => {
        if (onHeroRevealReady) onHeroRevealReady();
        if (loaderOverlayEl) {
          loaderOverlayEl.style.opacity = '0';
          loaderOverlayEl.style.pointerEvents = 'none';
        }
      }, 0.82);

      // PHASE F: Cover curtain wipes away downward, revealing the homepage hero
      tl.to(coverEl, {
        y: '100%',
        duration: 0.68,
        ease: 'power3.inOut',
      }, 0.86);
    } else {
      tl.add(() => {
        if (onHeroRevealReady) onHeroRevealReady();
      }, 0.45);
    }

    // PHASE G: Final cleanup and callback execution
    tl.add(() => {
      if (onComplete) onComplete();
    }, 1.55);

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

    // Rapid ivory cover descend
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

    // Rapid cover exit
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
