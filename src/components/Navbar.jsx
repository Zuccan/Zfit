import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/Logo.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full px-4 sm:px-10 lg:px-16 pt-3 sm:pt-8 z-40 relative">
      <div className="flex items-center justify-between">
        {/* Brand Logo with Official Logo Icon & Brandmark */}
        <a 
          href="#" 
          className="flex items-center gap-2.5 sm:gap-3 select-none hover:opacity-90 transition-opacity"
        >
          <img 
            src={logoImg} 
            alt="ZFIT Official Brand Logo" 
            className="hidden md:block h-8 sm:h-9 md:h-10 w-auto object-contain" 
          />
          <span className="font-black text-2xl sm:text-[26px] tracking-tight text-[#0a0a0a] font-heading">
            ZFIT<span className="text-[#aff03b] hidden md:inline font-900">.</span>
          </span>
        </a>

        {/* Desktop Navigation Links & Action - 100% UNTOUCHED */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          <a
            href="#how-it-works"
            className="text-[15px] font-medium text-[#2d2d2d] hover:text-[#0a0a0a] transition-colors"
          >
            How it works
          </a>
          <a
            href="#about"
            className="text-[15px] font-medium text-[#2d2d2d] hover:text-[#0a0a0a] transition-colors"
          >
            About
          </a>

          {/* Desktop "Get Started" Pill Button */}
          <a
            href="#get-started"
            className="group bg-[#0a0a0a] text-white px-6 py-2.5 rounded-full text-[15px] font-medium flex items-center gap-2 hover:bg-[#1f1f1f] transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <span>Get Started</span>
            <svg 
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M3 8H13M13 8L9 4M13 8L9 12" 
                stroke="currentColor" 
                strokeWidth="1.8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </a>
        </nav>

        {/* Mobile Exact Angled Badge Navigation (< md) */}
        <div className="md:hidden flex items-center">
          <div className="relative inline-flex items-center">
            {/* 1px Border Outline via background container */}
            <div 
              className="bg-[#1a1a1a] p-[1.2px]"
              style={{
                clipPath: 'polygon(15px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)'
              }}
            >
              <div 
                className="flex items-center bg-white pr-12 pl-6 py-2"
                style={{
                  clipPath: 'polygon(14.5px 0%, 100% 0%, calc(100% - 13.5px) 100%, 0% 100%)'
                }}
              >
                <div className="flex items-center gap-3 text-[11px] xs:text-[12px] font-semibold text-[#1a1a1a] tracking-tight">
                  <a href="#how-it-works" className="hover:text-black transition-colors whitespace-nowrap">
                    How it works
                  </a>
                  <span className="text-neutral-300 font-light">|</span>
                  <a href="#about" className="hover:text-black transition-colors whitespace-nowrap">
                    About
                  </a>
                </div>
              </div>
            </div>

            {/* Attached black angled arrow button */}
            <a
              href="#get-started"
              className="absolute right-0 top-0 bottom-0 w-11 bg-[#0a0a0a] hover:bg-black text-white flex items-center justify-center transition-transform active:scale-95"
              style={{
                clipPath: 'polygon(13px 0%, calc(100% - 5px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 5px) 100%, 0% 100%)'
              }}
              aria-label="Get Started"
            >
              <svg 
                className="w-4 h-4 text-white ml-1.5" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M3 8H13M13 8L8.8 4M13 8L8.8 12" 
                  stroke="currentColor" 
                  strokeWidth="1.6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
