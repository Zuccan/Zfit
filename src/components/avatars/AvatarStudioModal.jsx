import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YellowAvatar from './YellowAvatar';
import BlueAvatar from './BlueAvatar';
import GreenAvatar from './GreenAvatar';
import PinkAvatar from './PinkAvatar';

const AVATARS = [
  { id: 'yellow', name: 'Yellow Blob', tag: 'Stylist & Outfit Host', component: YellowAvatar, color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'blue', name: 'Blue Blob', tag: 'Curious Peeker', component: BlueAvatar, color: 'bg-sky-100 text-sky-900 border-sky-300' },
  { id: 'green', name: 'Green Blob', tag: 'Trend Reviewer', component: GreenAvatar, color: 'bg-lime-100 text-lime-900 border-lime-300' },
  { id: 'pink', name: 'Pink Blob', tag: 'Hype Fan', component: PinkAvatar, color: 'bg-pink-100 text-pink-900 border-pink-300' },
];

export default function AvatarStudioModal({ isOpen, onClose }) {
  const [selectedAvatarId, setSelectedAvatarId] = useState('yellow');
  const [copied, setCopied] = useState(false);

  const activeAvatar = AVATARS.find((a) => a.id === selectedAvatarId) || AVATARS[0];
  const ActiveComponent = activeAvatar.component;

  const componentCode = `import { ${activeAvatar.name.replace(' ', '')} } from './components/avatars';

// Render anywhere in your React app:
<${activeAvatar.name.replace(' ', '')} 
  className="w-64 h-64" 
  interactive={true} 
  autoAnimate={true} 
/>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(componentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl border border-neutral-200/80 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Left Column: 3D Canvas Showcase */}
            <div className="w-full md:w-3/5 bg-gradient-to-b from-neutral-50 to-neutral-100 p-6 flex flex-col items-center justify-between relative min-h-[380px] sm:min-h-[440px]">
              {/* Badge */}
              <div className="w-full flex items-center justify-between z-10">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${activeAvatar.color}`}>
                  {activeAvatar.tag}
                </span>
                <span className="text-xs text-neutral-400 font-medium">Click to squish • Move to rotate</span>
              </div>

              {/* Live 3D Avatar Render */}
              <div className="w-full h-full absolute inset-0 flex items-center justify-center pt-8">
                <ActiveComponent className="w-full h-full max-w-[340px] max-h-[340px]" interactive={true} autoAnimate={true} />
              </div>

              {/* Bottom Instructions */}
              <div className="z-10 w-full text-center">
                <p className="text-xs text-neutral-500 font-medium bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full inline-block shadow-sm">
                  Powered by Three.js WebGL • 60 FPS Physical Clay Shader
                </p>
              </div>
            </div>

            {/* Right Column: Controls, Selector & Code Snippet */}
            <div className="w-full md:w-2/5 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 font-heading">3D Avatar Studio</h3>
                    <p className="text-xs text-neutral-500">Pick an individual avatar to use anywhere</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                {/* Avatar Selectors */}
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {AVATARS.map((avatar) => {
                    const isSelected = avatar.id === selectedAvatarId;
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-md scale-[1.02]'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                        }`}
                      >
                        <div className="text-sm font-bold">{avatar.name}</div>
                        <div className={`text-[11px] truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {avatar.tag}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Import & Usage Code Box */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-neutral-700">React Component Usage:</span>
                    <button
                      onClick={handleCopy}
                      className="text-xs font-medium text-neutral-600 hover:text-black flex items-center gap-1 transition-colors"
                    >
                      {copied ? '✓ Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <pre className="bg-neutral-900 text-neutral-100 p-3.5 rounded-xl text-[12px] font-mono overflow-x-auto leading-relaxed border border-neutral-800">
                    <code>{componentCode}</code>
                  </pre>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full bg-[#0a0a0a] text-white py-3 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-md mt-4"
              >
                Close Studio
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
