import React, { useState } from 'react';
import { Home } from './pages/Home';
import { ZfitsLoader } from './components/loader/ZfitsLoader';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="zfits-root">
      {isLoading && (
        <ZfitsLoader onComplete={() => setIsLoading(false)} />
      )}
      <Home />
    </div>
  );
}

export default App;
