import React from 'react';
import { motion } from 'framer-motion';

export default function CenterHeroContent() {
  return (
    <div className="flex flex-col items-center justify-center text-center select-none z-20 max-w-2xl mx-auto px-4 py-1">

     

      
      

      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="font-black text-[2.75rem] xs:text-[3.25rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] xl:text-[6.25rem] tracking-[-0.04em] leading-[0.98] text-[#0a0a0a]"
      >
        <span className="block">Closet full.</span>
        <span className="block mt-0.5 sm:mt-1.5">
          Outfit <span className="text-[#aff03b]">zero.</span>
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-2.5 sm:mt-4 text-neutral-600 font-medium text-[13px] xs:text-sm sm:text-base md:text-[17px] leading-snug sm:leading-relaxed max-w-lg mx-auto"
      >
        <span className="block sm:inline">Get outfit ideas for your mood,</span>{' '}
        <span className="block sm:inline">occasion and style.</span>
        <br className="hidden sm:inline" />{' '}
        <span className="block sm:inline mt-0.5 sm:mt-0">Less overthinking. More fits.</span>
      </motion.p>

      {/* Main CTA Button: Mobile Slanted Parallelogram vs Desktop Pill */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 sm:mt-7"
      >
        {/* Mobile Exact Slanted Parallelogram Button (< sm) */}
        <motion.a
          href="#find-my-fit"
          whileTap={{ scale: 0.96 }}
          className="sm:hidden relative inline-flex items-center justify-center gap-3 bg-[#0a0a0a] text-white px-9 py-3 text-base font-bold tracking-tight shadow-lg active:bg-black cursor-pointer"
          style={{
            clipPath: 'polygon(24px 0%, 100% 0%, calc(100% - 24px) 100%, 0% 100%)'
          }}
        >
          <span className="ml-2 font-semibold">Find My Fit</span>
          <svg 
            className="w-5 h-5 text-white" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M3.5 10H16.5M16.5 10L11.5 5M16.5 10L11.5 15" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </motion.a>

        {/* Desktop Untouched Rounded Pill Button (sm+) */}
        <motion.a
          href="#find-my-fit"
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="hidden sm:inline-flex group relative items-center gap-3 bg-[#0a0a0a] text-white px-8 sm:px-9 py-3.5 sm:py-4 rounded-full text-base sm:text-[17px] font-semibold tracking-tight shadow-[0_14px_30px_-6px_rgba(0,0,0,0.35)] hover:shadow-[0_20px_35px_-5px_rgba(0,0,0,0.45)] transition-all cursor-pointer"
        >
          <span>Find My Fit</span>
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
      </motion.div>
    </div>
  );
}
