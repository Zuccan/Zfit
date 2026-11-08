import { useState } from 'react';
import { ZfitsLoader } from './components/loader/ZfitsLoader';
import { Home } from './pages/Home';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };

  const handleReplayLoader = () => {
    setIsLoading(true);
  };

  return (
    <div className="zfits-root">
      {isLoading && (
        <ZfitsLoader
          onComplete={handleLoaderComplete}
          isStandalone={true}
        />
      )}
      <Home onReplayLoader={handleReplayLoader} />
    </div>
  );
}

export default App;
