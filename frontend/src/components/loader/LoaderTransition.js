import gsap from 'gsap';

/**
 * LoaderTransition
 * Coordinates cinematic GSAP entrance and reveal transitions for the 3D tag loader.
 * Separated cleanly from the inner physics simulation to prevent competing transforms.
 */
export const LoaderTransition = {
  /**
   * Animates the tag dropping down smoothly into view from the ceiling.
   * @param {THREE.Group} targetGroup - The master entrance group in Three.js
   * @param {Object} options
   */
  animateEntry(targetGroup, { onComplete } = {}) {
    if (!targetGroup) return gsap.timeline();

    const tl = gsap.timeline({
      onComplete,
    });

    // Start slightly above viewport with subtle tilt
    targetGroup.position.y = 2.0;
    targetGroup.scale.set(0.92, 0.92, 0.92);

    tl.to(targetGroup.position, {
      y: 0,
      duration: 1.3,
      ease: 'power3.out',
    }, 0);

    tl.to(targetGroup.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.2,
      ease: 'power2.out',
    }, 0.1);

    return tl;
  },

  /**
   * Cinematic exit reveal into the ZFITs hero homepage.
   * Triggered ONLY when user deliberately pulls down past threshold and releases.
   */
  animateHeroReveal(targetGroup, overlayEl, { onComplete } = {}) {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    if (targetGroup) {
      tl.to(targetGroup.position, {
        y: 0.8,
        z: 3.2,
        duration: 0.85,
        ease: 'power3.in',
      }, 0);

      tl.to(targetGroup.scale, {
        x: 1.35,
        y: 1.35,
        z: 1.35,
        duration: 0.85,
        ease: 'power3.in',
      }, 0);
    }

    if (overlayEl) {
      tl.to(overlayEl, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.7,
        ease: 'power2.inOut',
      }, 0.15);
    }

    return tl;
  },

  /**
   * Fast skip transition for explicit user click on Skip button.
   */
  animateSkip(overlayEl, { onComplete } = {}) {
    if (!overlayEl) {
      if (onComplete) onComplete();
      return;
    }

    gsap.to(overlayEl, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
      onComplete,
    });
  },
};
