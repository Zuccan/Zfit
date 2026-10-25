import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedMascot from './AnimatedMascot';
import { EXPRESSIONS, MASCOTS } from './expressions';

export default function CharacterStudio({ isOpen, onClose }) {
  const [selectedCharacter, setSelectedCharacter] = useState('yellow');
  const [currentExpression, setCurrentExpression] = useState('happy');
  const [blush, setBlush] = useState(0.2);
  const [isTalking, setIsTalking] = useState(false);
  const [copied, setCopied] = useState(false);

  const mascotRef = useRef(null);

  const mascotInfo = MASCOTS[selectedCharacter] || MASCOTS.yellow;

  const handleExpressionSelect = (exprKey) => {
    setCurrentExpression(exprKey);
    const exprData = EXPRESSIONS[exprKey];
    if (exprData && exprData.blush !== undefined) {
      setBlush(exprData.blush);
    }
  };

  const handleSpeakToggle = () => {
    if (isTalking) {
      setIsTalking(false);
      mascotRef.current?.stopSpeaking();
    } else {
      setIsTalking(true);
      mascotRef.current?.speak(5);
      setTimeout(() => setIsTalking(false), 5000);
    }
  };

  const usageCode = `import { AnimatedMascot } from './components/characterSystem';

function MyComponent() {
  const mascotRef = useRef();

  return (
    <div>
      <AnimatedMascot
        ref={mascotRef}
        character="${selectedCharacter}"
        expression="${currentExpression}"
        blushIntensity={${blush.toFixed(2)}}
        isTalking={${isTalking}}
        interactive={true}
        className="w-64 h-64"
      />

      {/* Programmatic triggers: */}
      <button onClick={() => mascotRef.current.speak(3)}>Talk</button>
      <button onClick={() => mascotRef.current.wave()}>Wave</button>
      <button onClick={() => mascotRef.current.setExpression('surprised')}>Surprise</button>
    </div>
  );
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(usageCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
          >
            {/* Left Column: Interactive 3D Mascot Stage */}
            <div className="w-full md:w-7/12 bg-gradient-to-b from-neutral-50 via-neutral-100/60 to-neutral-200/50 p-6 flex flex-col justify-between relative min-h-[380px] sm:min-h-[460px]">
              {/* Header Badges */}
              <div className="w-full flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-neutral-200/80 shadow-xs text-neutral-800">
                    {mascotInfo.name} • {mascotInfo.role}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-lime-100 text-lime-800 border border-lime-300">
                    {EXPRESSIONS[currentExpression]?.name || currentExpression}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">
                  Interactive Gaze • Click to Squish
                </span>
              </div>

              {/* 3D Mascot Stage */}
              <div className="w-full h-full absolute inset-0 flex items-center justify-center pt-6">
                <AnimatedMascot
                  ref={mascotRef}
                  character={selectedCharacter}
                  expression={currentExpression}
                  blushIntensity={blush}
                  isTalking={isTalking}
                  interactive={true}
                  autoAnimate={true}
                  className="w-full h-full max-w-[380px] max-h-[380px]"
                />
              </div>

              {/* Action Trigger Floating Pills */}
              <div className="z-10 w-full flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={handleSpeakToggle}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                    isTalking ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200'
                  }`}
                >
                  <span>🗣️ {isTalking ? 'Speaking...' : 'Speak & Lip-Sync'}</span>
                </button>

                <button
                  onClick={() => mascotRef.current?.wink('right')}
                  className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  😉 Wink
                </button>

                <button
                  onClick={() => mascotRef.current?.blink()}
                  className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  👁️ Blink
                </button>

                <button
                  onClick={() => mascotRef.current?.wave()}
                  className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  👋 Wave
                </button>

                <button
                  onClick={() => mascotRef.current?.squish(0.78)}
                  className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  💥 Squish
                </button>
              </div>
            </div>

            {/* Right Column: Expression Controls & Integration Code */}
            <div className="w-full md:w-5/12 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto bg-white">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 font-heading">
                      Mascot Rig & Expression System
                    </h3>
                    <p className="text-xs text-neutral-500">Lip-sync, blushing, gaze, and rigged expressions</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                {/* 1. Character Selector */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-neutral-700 block mb-1.5">Select Character:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Object.keys(MASCOTS).map((key) => {
                      const m = MASCOTS[key];
                      const isSelected = selectedCharacter === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedCharacter(key);
                            handleExpressionSelect(m.defaultExpression);
                          }}
                          className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                              : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                          }`}
                        >
                          {m.name.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Named Expression Selector */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                    Named Expressions (Emotion State):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(EXPRESSIONS).map((exprKey) => {
                      const isSelected = currentExpression === exprKey;
                      return (
                        <button
                          key={exprKey}
                          onClick={() => handleExpressionSelect(exprKey)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                              : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200'
                          }`}
                        >
                          {exprKey}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Blush Intensity Slider (Independent Cheek System) */}
                <div className="mb-4 p-3 rounded-2xl bg-pink-50/60 border border-pink-100">
                  <div className="flex items-center justify-between text-xs font-bold text-pink-900 mb-1">
                    <span>Smooth Blush Fade:</span>
                    <span>{Math.round(blush * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={blush}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setBlush(val);
                      mascotRef.current?.setBlush(val);
                    }}
                    className="w-full h-1.5 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                  <span className="text-[10px] text-pink-700 block mt-1">
                    Controls independent cheek overlay meshes smoothly in real time
                  </span>
                </div>

                {/* 4. Production Code Snippet */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-neutral-700">Production Usage:</span>
                    <button
                      onClick={handleCopy}
                      className="text-xs font-semibold text-neutral-600 hover:text-black transition-colors cursor-pointer"
                    >
                      {copied ? '✓ Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <pre className="bg-neutral-950 text-neutral-200 p-3 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-neutral-800">
                    <code>{usageCode}</code>
                  </pre>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full bg-[#0a0a0a] text-white py-2.5 rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm mt-3 cursor-pointer"
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
