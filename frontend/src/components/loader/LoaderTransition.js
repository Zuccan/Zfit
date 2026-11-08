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
    targetGroup.position.y = 3.5;
    targetGroup.scale.set(0.85, 0.85, 0.85);

    tl.to(targetGroup.position, {
      y: 0,
      duration: 1.6,
      ease: 'power3.out',
    }, 0);

    tl.to(targetGroup.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.4,
      ease: 'power2.out',
    }, 0.1);

    return tl;
  },

  /**
   * Cinematic exit reveal into the ZFITs hero homepage.
   * Triggered upon deliberate downward pull & release or manual trigger.
   * @param {THREE.Group} targetGroup - The master group
   * @param {HTMLElement} overlayEl - The DOM container element
   * @param {Object} options
   */
  animateHeroReveal(targetGroup, overlayEl, { onComplete } = {}) {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    // 1. Tag snaps slightly upward and glides seamlessly toward camera
    if (targetGroup) {
      tl.to(targetGroup.position, {
        y: 1.2,
        z: 3.5,
        duration: 0.9,
        ease: 'power3.in',
      }, 0);

      tl.to(targetGroup.scale, {
        x: 1.4,
        y: 1.4,
        z: 1.4,
        duration: 0.9,
        ease: 'power3.in',
      }, 0);

      tl.to(targetGroup.rotation, {
        x: '-=0.15',
        y: '+=0.25',
        duration: 0.9,
        ease: 'power2.in',
      }, 0);
    }

    // 2. DOM overlay smooth fade out into the luxury hero background
    if (overlayEl) {
      tl.to(overlayEl, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.75,
        ease: 'power2.inOut',
      }, 0.15);
    }

    return tl;
  },

  /**
   * Fast skip transition for accessibility or user bypass.
   * @param {HTMLElement} overlayEl
   * @param {Object} options
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
