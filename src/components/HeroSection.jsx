import React, { useEffect } from 'react';
import Navbar from './Navbar';
import CenterHeroContent from './CenterHeroContent';

export default function HeroSection() {
  useEffect(() => {
    // Reset scroll position and clear hash anchor scrolling
    window.scrollTo(0, 0);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  return (
    <section className="relative w-full min-h-screen md:h-screen md:max-h-screen bg-[#fefefe] md:overflow-hidden select-none">
      {/* ========================================================
          DESKTOP CANVAS VIEW (md and up: 768px+)
          Matches the reference 16:9 3D artwork 10000000000000000%
          with container queries for pixel-perfect scaling
          ======================================================== */}
      <div className="hidden md:flex w-full h-full items-center justify-center bg-[#fefefe]">
        <div className="hero-canvas-container relative w-full max-w-[1536px] max-h-full aspect-[16/9] select-none mx-auto">
          {/* 16:9 Clean 3D Scene Artwork with Cat, Dog, Blobs & Realistic Ground Shadows */}
          <img
            src="/hero-scene-clean-2x.png"
            alt="Zfits 3D Character Scene"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            draggable="false"
          />

          {/* Desktop Navbar placed exactly in the top navbar band */}
          <div className="absolute top-0 left-0 right-0 z-30 pt-[3%] px-[8.7%]">
            <Navbar isCanvasMode={true} />
          </div>

          {/* Center Content placed exactly in the safe center gap between mascots */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[29%] z-20 w-[41%] flex flex-col items-center justify-center text-center">
            <CenterHeroContent isCanvasMode={true} />
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE VIEW (below md: < 768px)
          Vertically stacked, fully readable, touch-friendly layout
          ======================================================== */}
      <div className="flex md:hidden flex-col min-h-screen justify-between bg-[#fefefe] px-4 py-4">
        {/* Mobile Navbar */}
        <Navbar isCanvasMode={false} />

        {/* Mobile Center Hero Content */}
        <div className="my-auto py-6">
          <CenterHeroContent isCanvasMode={false} />
        </div>

        {/* Mobile Mascot Artwork Framing at the bottom */}
        <div className="w-full flex items-center justify-center pb-4 pointer-events-none">
          <img
            src="/hero-scene-clean.png"
            alt="Zfits Mascots"
            className="w-full max-w-sm h-auto object-contain rounded-xl"
            draggable="false"
          />
        </div>
      </div>
    </section>
  );
}
