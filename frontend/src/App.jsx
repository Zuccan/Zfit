import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { ZfitsLoader } from './components/loader/ZfitsLoader';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isHeroRevealed, setIsHeroRevealed] = useState(false);

  // Synchronize loading class on html and body to strictly prevent browser scrollbars
  useEffect(() => {
    if (isLoading) {
      document.documentElement.classList.add('zfits-loading');
      document.body.classList.add('zfits-loading');
    } else {
      document.documentElement.classList.remove('zfits-loading');
      document.body.classList.remove('zfits-loading');
    }
    return () => {
      document.documentElement.classList.remove('zfits-loading');
      document.body.classList.remove('zfits-loading');
    };
  }, [isLoading]);

  return (
    <div className={`zfits-root ${isLoading ? 'is-loading' : ''}`}>
      {isLoading && (
        <ZfitsLoader
          onHeroRevealReady={() => setIsHeroRevealed(true)}
          onComplete={() => setIsLoading(false)}
        />
      )}
      <div className={`home-behind-shutter ${isLoading ? 'locked-viewport' : ''}`}>
        <Home
          isRevealed={isHeroRevealed}
          onReplayLoader={() => {
            setIsLoading(true);
            setIsHeroRevealed(false);
          }}
        />
      </div>
    </div>
  );
}

export default App;
