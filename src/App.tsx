import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import { ClientItineraryView } from './components/ClientItineraryView';
import { Footer } from './components/Footer';
import { ReachUs } from './components/ReachUs';
import { SEO } from './components/SEO';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { TermsAndConditions } from './pages/TermsAndConditions';
import { ItineraryHistory } from './pages/ItineraryHistory';
import { NavigationHeader } from './components/NavigationHeader';
import { GuidePage } from './pages/GuidePage';
import { LandingPage } from './pages/LandingPage';
import { PlannerPage } from './pages/PlannerPage';
import { apiClient } from './services/api';

// Shared Itinerary View Component (for /share/:id routes)
function SharedItineraryPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [itineraryData, setItineraryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shareId) {
      loadSharedItinerary(shareId);
    }
  }, [shareId]);

  const loadSharedItinerary = async (id: string) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.getItineraryById(id);
      if (response.status === 'success') {
        setItineraryData(response.data.itinerary.itineraryData);
      }
    } catch (error: any) {
      console.error('Failed to load shared itinerary:', error);
      setError(error.message || 'Failed to load itinerary.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itineraryData) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error || 'Itinerary not found'}</p>
          <a href="/" className="text-ai-accent hover:underline">← Back to Home</a>
        </div>
      </div>
    );
  }

  return <ClientItineraryView data={itineraryData} />;
}

function App() {
  const location = useLocation();
  const isSharedView = location.pathname.startsWith('/share/');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isTermsPage = location.pathname === '/terms';

  return (
    <>
      <SEO />
      {!isSharedView && <NavigationHeader />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<PlannerPage />} />
        <Route path="/itinerary/:id" element={<PlannerPage />} />
        <Route path="/share/:shareId" element={<SharedItineraryPage />} />
        <Route path="/history" element={<ItineraryHistory />} />
        <Route path="/reach_us" element={<ReachUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/guide/:slug" element={<GuidePage />} />
      </Routes>
      {!isSharedView && !isAuthPage && !isTermsPage && <Footer />}
    </>
  );
}

export default App;
