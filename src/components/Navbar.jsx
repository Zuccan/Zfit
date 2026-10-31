import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/Logo.png';

export default function Navbar({ className = '', isCanvasMode = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isCanvasMode) {
    return (
      <header className={`w-full z-40 select-none ${className}`}>
        <div className="w-full flex items-center justify-between">
          {/* Brand Logo & Name */}
          <a 
            href="#" 
            className="flex items-center gap-[0.7cqi] hover:opacity-90 transition-opacity"
          >
            <img 
              src={logoImg} 
              alt="Zfits Logo" 
              className="h-[2.6cqi] w-auto object-contain" 
            />
            <span className="font-bold text-[2.05cqi] tracking-tight text-[#0a0a0a]">
              Zfits
            </span>
          </a>

          {/* Center Navigation Links */}
          <nav className="flex items-center gap-[2.5cqi]">
            {/* Active Home with dot indicator underneath */}
            <div className="flex flex-col items-center relative">
              <a
                href="#home"
                className="text-[1.38cqi] font-semibold text-[#0a0a0a]"
              >
                Home
              </a>
              <span className="w-[0.4cqi] h-[0.4cqi] bg-[#0a0a0a] rounded-full mt-[0.25cqi]" />
            </div>

            <a
              href="#features"
              className="text-[1.38cqi] font-medium text-[#5e6166] hover:text-[#0a0a0a] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-[1.38cqi] font-medium text-[#5e6166] hover:text-[#0a0a0a] transition-colors"
            >
              How it works
            </a>
            <a
              href="#community"
              className="text-[1.38cqi] font-medium text-[#5e6166] hover:text-[#0a0a0a] transition-colors"
            >
              Community
            </a>
          </nav>

          {/* Right Actions: Sign in & Get Started ↗ */}
          <div className="flex items-center gap-[1.8cqi]">
            <a
              href="#sign-in"
              className="text-[1.38cqi] font-medium text-[#0a0a0a] hover:opacity-80 transition-opacity"
            >
              Sign in
            </a>
            <a
              href="#get-started"
              className="group bg-[#0c0c0d] hover:bg-black text-white px-[1.6cqi] py-[0.75cqi] rounded-[0.6cqi] text-[1.35cqi] font-semibold tracking-tight shadow-sm transition-all active:scale-95 flex items-center gap-[0.5cqi]"
            >
              <span>Get Started</span>
              <svg 
                className="w-[1.1cqi] h-[1.1cqi] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
                viewBox="0 0 16 16" 
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4.5 11.5L11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5" 
                  stroke="currentColor" 
                  strokeWidth="1.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>
    );
  }

  // Mobile / Fallback Navbar
  return (
    <header className={`w-full z-40 select-none ${className}`}>
      <div className="w-full flex items-center justify-between">
        {/* Brand Logo & Name */}
        <a 
          href="#" 
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <img 
            src={logoImg} 
            alt="Zfits Logo" 
            className="h-6 sm:h-7 md:h-7.5 w-auto object-contain" 
          />
          <span className="font-bold text-[19px] sm:text-[21px] md:text-[22px] tracking-tight text-[#0a0a0a]">
            Zfits
          </span>
        </a>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8 xl:gap-9">
          <div className="flex flex-col items-center relative py-0.5">
            <a href="#home" className="text-[13.5px] lg:text-[14.5px] font-semibold text-[#0a0a0a]">
              Home
            </a>
            <span className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full mt-0.5" />
          </div>
          <a href="#features" className="text-[13.5px] lg:text-[14.5px] font-medium text-[#5e6166] hover:text-[#0a0a0a] transition-colors py-0.5">
            Features
          </a>
          <a href="#how-it-works" className="text-[13.5px] lg:text-[14.5px] font-medium text-[#5e6166] hover:text-[#0a0a0a] transition-colors py-0.5">
            How it works
          </a>
          <a href="#community" className="text-[13.5px] lg:text-[14.5px] font-medium text-[#5e6166] hover:text-[#0a0a0a] transition-colors py-0.5">
            Community
          </a>
        </nav>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 lg:gap-5">
          <a href="#sign-in" className="text-[13.5px] lg:text-[14.5px] font-medium text-[#0a0a0a] hover:opacity-80 transition-opacity">
            Sign in
          </a>
          <a href="#get-started" className="group bg-[#0c0c0d] hover:bg-black text-white px-4.5 lg:px-5 py-2 lg:py-2.5 rounded-lg text-[13px] lg:text-[14px] font-semibold tracking-tight shadow-sm transition-all active:scale-95 flex items-center gap-2">
            <span>Get Started</span>
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 16 16" fill="none">
              <path d="M4.5 11.5L11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-2.5">
          <a href="#get-started" className="bg-[#0c0c0d] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <span>Get Started</span>
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
              <path d="M4.5 11.5L11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-neutral-800 hover:text-black rounded-lg focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-current transform transition-transform duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`h-0.5 w-full bg-current transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-full bg-current transform transition-transform duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden mt-3 bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-100 shadow-xl p-5"
          >
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-[#0a0a0a]">
                  Home
                </a>
                <span className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full" />
              </div>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#5e6166] hover:text-black">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#5e6166] hover:text-black">
                How it works
              </a>
              <a href="#community" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-[#5e6166] hover:text-black">
                Community
              </a>
              <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2.5">
                <a href="#sign-in" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-neutral-800">
                  Sign in
                </a>
                <a href="#get-started" onClick={() => setMobileMenuOpen(false)} className="w-full text-center bg-[#0c0c0d] text-white py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                  <span>Get Started</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                    <path d="M4.5 11.5L11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
