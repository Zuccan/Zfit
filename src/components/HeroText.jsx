import React from 'react';
import { motion } from 'framer-motion';

export default function HeroText() {
  return (
    <div className="flex flex-col items-start justify-center select-none z-10 w-full max-w-2xl py-1">
      {/* Main Headline */}
      <motion.h1 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="font-black text-[3.25rem] xs:text-[3.75rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] xl:text-[6.25rem] tracking-[-0.04em] leading-[0.96] text-[#0a0a0a]"
      >
        <span className="block">Wear more.</span>
        <span className="block mt-1 sm:mt-1.5">
          Wonder{' '}
          <span className="relative inline-block">
            <span>less.</span>
            {/* Hand-drawn Lime Accent Underline */}
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
              className="absolute -bottom-1 sm:-bottom-2.5 left-0 w-[104%] h-3 sm:h-4 text-[#aff03b] overflow-visible pointer-events-none"
              viewBox="0 0 160 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M 4 8 C 42 5.5, 112 5, 156 8"
                stroke="currentColor"
                strokeWidth="7.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </span>
        </span>
      </motion.h1>

      {/* Action CTA Container with Hand-Drawn Accent Marks */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 sm:mt-10 lg:mt-12 flex items-center"
      >
        {/* Wrapper to bind speed marks precisely to the button */}
        <div className="relative inline-flex items-center">
          {/* Hand-drawn action speed marks to the left of the button */}
          <div className="hidden sm:flex absolute -left-7 lg:-left-8 top-1/2 -translate-y-1/2 flex-col gap-1.5 select-none pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="-rotate-12">
              <line x1="4" y1="5" x2="16" y2="11" stroke="#0a0a0a" strokeWidth="3.2" strokeLinecap="round" />
              <line x1="2" y1="13" x2="14" y2="19" stroke="#0a0a0a" strokeWidth="3.2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Hero CTA Button */}
          <motion.a
            href="#get-started"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="group relative inline-flex items-center gap-3 bg-[#0a0a0a] text-white px-8 sm:px-9 py-3.5 sm:py-4 rounded-full text-base sm:text-[18px] font-semibold tracking-tight shadow-[0_14px_28px_-6px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.45)] transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <svg 
              className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1.5" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M4.16666 10H15.8333M15.8333 10L10.8333 5M15.8333 10L10.8333 15" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
