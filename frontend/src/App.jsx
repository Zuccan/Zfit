import React, { useState } from 'react';
import { Home } from './pages/Home';
import { ZfitsLoader } from './components/loader/ZfitsLoader';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isHeroRevealed, setIsHeroRevealed] = useState(false);

  return (
    <div className="zfits-root">
      {isLoading && (
        <ZfitsLoader
          onHeroRevealReady={() => setIsHeroRevealed(true)}
          onComplete={() => setIsLoading(false)}
        />
      )}
      <Home
        isRevealed={isHeroRevealed}
        onReplayLoader={() => {
          setIsLoading(true);
          setIsHeroRevealed(false);
        }}
      />
    </div>
  );
}

export default App;
