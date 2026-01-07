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
import { B2BDashboard } from './pages/B2BDashboard';
import { apiClient } from './services/api';


// Shared Itinerary View Component (for /share/:id and /:slug routes)
function SharedItineraryPage() {
  const { shareId, slug } = useParams<{ shareId?: string; slug?: string }>();
  const [itineraryData, setItineraryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shareId) {
      loadSharedItinerary(shareId, false);
    } else if (slug) {
      loadSharedItinerary(slug, true);
    }
  }, [shareId, slug]);

  const loadSharedItinerary = async (identifier: string, isSlug: boolean) => {
    setIsLoading(true);
    setError('');
    try {
      const response = isSlug
        ? await apiClient.getItineraryBySlug(identifier)
        : await apiClient.getItineraryById(identifier);

      if (response.status === 'success') {
        setItineraryData(response.data.itinerary.itineraryData);
      }
    } catch (error: any) {
      console.error('Failed to load shared itinerary:', error);
      if (error.status === 410) {
        setError('This shared link has already been used and is no longer available.');
      } else {
        setError(error.message || 'Failed to load itinerary.');
      }
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
          <p className="text-red-400 mb-4 font-medium">{error || 'Itinerary not found'}</p>
          <p className="text-gray-500 mb-6 text-sm">Shared links for guest users are one-time use only. Please login to create permanent shared links.</p>
          <a href="/" className="px-6 py-2 bg-ai-accent text-ai-dark font-bold rounded-lg hover:bg-ai-accent/90 transition-all">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return <ClientItineraryView data={itineraryData} />;
}

function App() {
  const location = useLocation();
  const knownPaths = ['/', '/chat', '/history', '/reach_us', '/login', '/register', '/dashboard', '/terms', '/guide'];
  const isKnownPath = knownPaths.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

  const isSharedView = location.pathname.startsWith('/share/') || (!isKnownPath && location.pathname !== '/');
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
        <Route path="/dashboard" element={<B2BDashboard />} />
        <Route path="/terms" element={<TermsAndConditions />} />

        <Route path="/guide/:slug" element={<GuidePage />} />

        {/* Custom Slug Route - Should be near the end to avoid clashing with static paths */}
        <Route path="/:slug" element={<SharedItineraryPage />} />
      </Routes>
      {!isSharedView && !isAuthPage && !isTermsPage && <Footer />}
    </>
  );
}

export default App;
