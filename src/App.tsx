import { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { ItineraryResult } from './components/ItineraryResult';
import { ClientItineraryView } from './components/ClientItineraryView';
import { SikkimShowcase } from './components/SikkimShowcase';
import { BookingOptions } from './components/BookingOptions';
import { SplashScreen } from './components/SplashScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { generateItinerary } from './services/ai';
import { decodeItineraryFromUrl } from './utils/sharing';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'home' | 'results' | 'shared'>('home');
  const [isSearching, setIsSearching] = useState(false);
  const [itineraryData, setItineraryData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for shared itinerary in URL
    const sharedPlan = decodeItineraryFromUrl();
    if (sharedPlan) {
      setItineraryData(sharedPlan);
      setView('shared');
      // Don't show splash screen if loading a shared link for faster access
      setShowSplash(false);
    }
  }, []);

  const handleSearch = async (prompt: string, isBusiness: boolean) => {
    setIsSearching(true);
    setError('');
    try {
      const data = await generateItinerary(prompt, isBusiness);
      setItineraryData(data);
      setView('results');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate plan. Please check your API key or try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // If viewing a shared link, render the client view directly (bypassing the main app layout)
  if (view === 'shared' && itineraryData) {
    return <ClientItineraryView data={itineraryData} />;
  }

  return (
    <div className="min-h-screen bg-ai-dark text-white selection:bg-ai-accent/30">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {view === 'home' ? (
              <>
                <Hero onSearch={handleSearch} isSearching={isSearching} error={error} />
                <SikkimShowcase />
              </>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-screen py-6 sm:py-12"
              >
                <div className="container mx-auto px-4 sm:px-6">
                  <button
                    onClick={() => setView('home')}
                    className="mb-6 sm:mb-8 text-ai-muted hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    ← Back to Search
                  </button>
                  {error && (
                    <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                      {error}
                    </div>
                  )}
                  <ItineraryResult data={itineraryData} />
                  {itineraryData && <BookingOptions />}
                  <div className="mt-12 sm:mt-20">
                    <SikkimShowcase />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
