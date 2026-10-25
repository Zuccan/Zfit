import React from 'react';
import Navbar from './Navbar';
import CenterHeroContent from './CenterHeroContent';
import SurroundingCharacters from './SurroundingCharacters';

export default function HeroSection() {
  return (
    <section className="h-[100dvh] lg:min-h-screen lg:h-auto w-full bg-white flex flex-col justify-between overflow-hidden relative">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Full-Bleed Hero Canvas (No max-width, no side padding) */}
      <main className="w-full flex-1 flex flex-col items-center justify-center relative my-auto py-1 sm:py-4 px-2 sm:px-4">
        {/* Center Content: Headline, Subtitle, CTA */}
        <CenterHeroContent />

        {/* 4 Corner Characters Fixed at Screen Edges (No Motion) */}
        <SurroundingCharacters />
      </main>

      {/* Bottom spacer */}
      <div className="h-1 sm:h-6 lg:h-8 w-full" />
    </section>
  );
}
