import React from 'react';
import { motion } from 'framer-motion';

export default function CenterHeroContent({ isCanvasMode = true }) {
  if (isCanvasMode) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-center select-none pointer-events-auto">
        {/* Overline */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-[1.15cqi] font-semibold tracking-[0.22em] text-[#8c8f94] uppercase mb-[0.8cqi] whitespace-nowrap"
        >
          YOUR AI OUTFIT COMPANION
        </motion.span>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="font-extrabold text-[4.3cqi] tracking-[-0.035em] leading-[1.03] whitespace-nowrap"
        >
          <span className="block text-[#0a0a0a]">More Outfits.</span>
          <span className="block text-[#4b5563] mt-[0.2cqi]">Same Wardrobe.</span>
        </motion.h1>

        {/* 3-Line Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="mt-[1.1cqi] text-[#5e6166] font-normal text-[1.4cqi] leading-[1.5] max-w-[34cqi] mx-auto"
        >
          <span className="block whitespace-nowrap">Upload your clothes, get AI-powered outfit combinations,</span>
          <span className="block whitespace-nowrap">and discover new ways to express your style</span>
          <span className="block whitespace-nowrap">without buying more.</span>
        </motion.p>

        {/* Action Buttons: Get Started → & See how it works */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="mt-[1.6cqi] flex items-center justify-center gap-[1.8cqi]"
        >
          {/* Get Started Button */}
          <motion.a
            href="#get-started"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="group relative inline-flex items-center gap-[0.7cqi] bg-[#0c0c0d] hover:bg-black text-white px-[2.2cqi] py-[0.85cqi] rounded-[0.6cqi] text-[1.35cqi] font-semibold tracking-tight shadow-[0_4px_14px_-2px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_20px_-2px_rgba(0,0,0,0.35)] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Get Started</span>
            <svg 
              className="w-[1.2cqi] h-[1.2cqi] transition-transform duration-200 group-hover:translate-x-0.5" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M3 8H13M13 8L8.8 4M13 8L8.8 12" 
                stroke="currentColor" 
                strokeWidth="1.8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </motion.a>

          {/* See how it works Underlined Link */}
          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-[1.35cqi] font-semibold text-[#111111] hover:text-black underline underline-offset-4 decoration-neutral-400 hover:decoration-black transition-colors px-[0.4cqi] py-[0.4cqi] flex items-center cursor-pointer whitespace-nowrap"
          >
            See how it works
          </motion.a>
        </motion.div>
      </div>
    );
  }

  // Mobile / fallback mode
  return (
    <div className="w-full flex flex-col items-center justify-center text-center select-none px-4 py-6">
      {/* Overline */}
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-[11px] font-semibold tracking-[0.22em] text-[#8c8f94] uppercase mb-2.5"
      >
        YOUR AI OUTFIT COMPANION
      </motion.span>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08 }}
        className="font-extrabold text-[2.5rem] tracking-[-0.035em] leading-[1.05]"
      >
        <span className="block text-[#0a0a0a]">More Outfits.</span>
        <span className="block text-[#4b5563] mt-1">Same Wardrobe.</span>
      </motion.h1>

      {/* 3-Line Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16 }}
        className="mt-3.5 text-[#5e6166] font-normal text-sm leading-relaxed max-w-sm mx-auto"
      >
        <span>Upload your clothes, get AI-powered outfit combinations, and discover new ways to express your style without buying more.</span>
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.24 }}
        className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs"
      >
        <a
          href="#get-started"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0c0c0d] hover:bg-black text-white px-7 py-3 rounded-lg text-sm font-semibold tracking-tight shadow-md transition-all active:scale-95"
        >
          <span>Get Started</span>
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M13 8L8.8 4M13 8L8.8 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        <a
          href="#how-it-works"
          className="text-sm font-semibold text-[#111111] hover:text-black underline underline-offset-4 decoration-neutral-400 py-2"
        >
          See how it works
        </a>
      </motion.div>
    </div>
  );
}
