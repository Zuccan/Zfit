import gsap from 'gsap';

/**
 * LoaderTransition
 * Coordinates cinematic GSAP entrance and hero reveal transitions for the 3D tag loader.
 * Separated cleanly from inner physics to prevent competing transforms.
 */
export const LoaderTransition = {
  /**
   * Animates the tag dropping down smoothly into view from slightly above on first mount.
   */
  animateEntry(targetGroup, { onComplete } = {}) {
    if (!targetGroup) return gsap.timeline();

    const tl = gsap.timeline({
      onComplete,
    });

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
        y: -1.4,
        z: 2.2,
        duration: 0.7,
        ease: 'power3.in',
      }, 0);

      tl.to(targetGroup.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 0.7,
        ease: 'power3.in',
      }, 0);
    }

    if (overlayEl) {
      tl.to(overlayEl, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.6,
        ease: 'power2.inOut',
      }, 0.12);
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
      duration: 0.35,
      ease: 'power2.out',
      onComplete,
    });
  },
};
