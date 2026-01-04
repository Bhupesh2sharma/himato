import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Hero } from './components/Hero';
import { ItineraryResult } from './components/ItineraryResult';
import { ClientItineraryView } from './components/ClientItineraryView';
import { SikkimShowcase } from './components/SikkimShowcase';
import { BookingOptions } from './components/BookingOptions';
import { SplashScreen } from './components/SplashScreen';
import { SikkimSherpa } from './components/SikkimSherpa';
import { Footer } from './components/Footer';
import { ReachUs } from './components/ReachUs';
import { SEO } from './components/SEO';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { TermsAndConditions } from './pages/TermsAndConditions';
import { ItineraryHistory } from './pages/ItineraryHistory';
import { NavigationHeader } from './components/NavigationHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { generateItinerary } from './services/ai';
import { decodeItineraryFromUrl } from './utils/sharing';
import { apiClient } from './services/api';

function HomePage() {
  const { id, shareId } = useParams<{ id?: string, shareId?: string }>();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'home' | 'results' | 'shared'>('home');
  const [isSearching, setIsSearching] = useState(false);
  const [itineraryData, setItineraryData] = useState(null);
  const [itineraryId, setItineraryId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for shared itinerary in URL (Legacy ?plan=...)
    const sharedPlan = decodeItineraryFromUrl();
    if (sharedPlan) {
      setItineraryData(sharedPlan);
      setView('shared');
      setShowSplash(false);
      return;
    }

    // Check for specific shared ID (Short URL /share/:id)
    if (shareId) {
      loadSavedItinerary(shareId, true);
      return;
    }

    // Check if URL has itinerary ID (from history page or direct link /itinerary/:id)
    if (id) {
      loadSavedItinerary(id, false);
    }
  }, [id, shareId]);

  const loadSavedItinerary = async (loadId: string, isSharedView: boolean) => {
    setIsSearching(true);
    setError('');
    try {
      const response = await apiClient.getItineraryById(loadId);
      if (response.status === 'success') {
        setItineraryData(response.data.itinerary.itineraryData);
        setItineraryId(response.data.itinerary._id);
        setView(isSharedView ? 'shared' : 'results'); // KEY CHANGE: 'shared' for shareId
        setShowSplash(false);
      }
    } catch (error: any) {
      console.error('Failed to load itinerary:', error);
      setError(error.message || 'Failed to load itinerary. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (prompt: string, isBusiness: boolean, businessName?: string) => {
    setIsSearching(true);
    setError('');
    setItineraryId(null);
    try {
      // Expecting { itinerary, id } now
      const { itinerary, id } = await generateItinerary(prompt, isBusiness, businessName);
      setItineraryData(itinerary);
      setItineraryId(id || null);
      setView('results');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate plan. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // If viewing a shared link, render the client view directly (bypassing the main app layout)
  if (view === 'shared' && itineraryData) {
    return <ClientItineraryView data={itineraryData} />;
  }

  return (
    <main className="min-h-screen bg-ai-dark text-white selection:bg-ai-accent/30" role="main">
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
                className="min-h-screen pt-24 pb-6 sm:pt-28 sm:pb-12"
              >
                <div className="container mx-auto px-4 sm:px-6">
                  <button
                    onClick={() => {
                      navigate('/');
                      setView('home');
                    }}
                    className="mb-6 sm:mb-8 text-ai-muted hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    ← Back to Home
                  </button>
                  {error && (
                    <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                      {error}
                    </div>
                  )}
                  <ItineraryResult data={itineraryData} itineraryId={itineraryId} />
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
      <SikkimSherpa />
    </main>
  );
}

function App() {
  const location = useLocation();
  const isSharedView = location.pathname === '/' && (location.search.includes('itinerary') || location.search.includes('plan')) || location.pathname.startsWith('/share/');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isTermsPage = location.pathname === '/terms';

  return (
    <>
      <SEO />
      {!isSharedView && !location.pathname.startsWith('/share/') && <NavigationHeader />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/itinerary/:id" element={<HomePage />} />
        <Route path="/share/:shareId" element={<HomePage />} />
        <Route path="/history" element={<ItineraryHistory />} />
        <Route path="/reach_us" element={<ReachUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<TermsAndConditions />} />
      </Routes>
      {!isSharedView && !isAuthPage && !isTermsPage && <Footer />}
    </>
  );
}

export default App;
