import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import BlobAvatarsScene from './avatars/BlobAvatarsScene';
import AvatarStudioModal from './avatars/AvatarStudioModal';

export default function HeroVisual() {
  const containerRef = useRef(null);
  const [viewMode, setViewMode] = useState('art'); // 'art' or 'threejs'
  const [studioOpen, setStudioOpen] = useState(false);

  // Smooth mouse tilt physics for interactive 3D feel
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);

  const handleMouseMove = (e) => {
    if (!containerRef.current || viewMode === 'threejs') return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D Mode & Studio Action Pills */}
      <div className="mb-3 z-30 flex items-center gap-2 select-none">
        <div className="bg-neutral-100/90 backdrop-blur-md p-1 rounded-full flex items-center border border-neutral-200/80 shadow-xs">
          <button
            onClick={() => setViewMode('art')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'art'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Original Look
          </button>
          <button
            onClick={() => setViewMode('threejs')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'threejs'
                ? 'bg-[#0a0a0a] text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Live Three.js 3D</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* 3D Avatar Studio Modal Trigger */}
        <button
          onClick={() => setStudioOpen(true)}
          className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/80 px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <span>🧸 3D Avatar Studio</span>
        </button>
      </div>

      {/* Main Visual Display Area */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[360px] xs:max-w-[420px] sm:max-w-[540px] md:max-w-[620px] lg:max-w-[720px] xl:max-w-[820px] flex items-center justify-center select-none perspective-[1200px]"
      >
        {viewMode === 'art' ? (
          /* High-Fidelity 1:1 Reference Art Scene with Mouse Tilt & Levitation */
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            className="w-full relative flex items-center justify-center"
          >
            <motion.div
              animate={{
                y: [-6, 6, -6],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-full relative flex flex-col items-center justify-center"
            >
              <img
                src="/hero-character.png"
                alt="ZFIT 3D Outfit Curation Characters and Mobile Experience"
                className="w-full h-auto object-contain max-h-[460px] xs:max-h-[500px] sm:max-h-[580px] lg:max-h-[64vh] xl:max-h-[70vh] pointer-events-none drop-shadow-[0_24px_40px_rgba(0,0,0,0.05)]"
                loading="eager"
                draggable="false"
              />

              {/* Soft Ground Contact Shadow */}
              <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 w-[72%] h-5 sm:h-7 bg-black/[0.06] blur-xl rounded-full pointer-events-none" />
            </motion.div>
          </motion.div>
        ) : (
          /* Live Interactive Three.js WebGL 3D Scene */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-[460px] sm:h-[540px] lg:h-[620px] relative flex items-center justify-center rounded-3xl bg-neutral-50/50 border border-neutral-100 shadow-inner"
          >
            <BlobAvatarsScene className="w-full h-full" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-neutral-400 font-medium bg-white/80 px-3 py-1 rounded-full border border-neutral-200/60 shadow-xs pointer-events-none">
              Interactive Three.js Scene • Hover to tilt camera
            </div>
          </motion.div>
        )}
      </div>

      {/* 3D Avatar Studio Modal */}
      <AvatarStudioModal isOpen={studioOpen} onClose={() => setStudioOpen(false)} />
    </div>
  );
}
