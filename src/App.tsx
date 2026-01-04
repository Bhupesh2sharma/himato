import { Routes, Route, useLocation } from 'react-router-dom';
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





function App() {
  const location = useLocation();
  const isSharedView = location.pathname === '/' && location.search.includes('itinerary');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isTermsPage = location.pathname === '/terms';

  return (
    <>
      <SEO />
      <NavigationHeader />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<PlannerPage />} />
        <Route path="/itinerary/:id" element={<PlannerPage />} />
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
