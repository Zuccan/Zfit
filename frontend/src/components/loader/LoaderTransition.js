import gsap from 'gsap';

/**
 * LoaderTransition (V11)
 * Coordinates the fabric physics release and progressive hero reveal
 */
export const LoaderTransition = {
  /**
   * Fast Skip Transition (Keyboard Accessibility)
   */
  animateSkip({ onHeroRevealReady, onComplete }) {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    tl.to({}, { duration: 0.25 }, 0);
    tl.add(() => {
      if (onHeroRevealReady) onHeroRevealReady();
    }, 0.20);

    return tl;
  },
};
