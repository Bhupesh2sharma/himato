import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ItineraryResult } from '../components/ItineraryResult';
import { ClientItineraryView } from '../components/ClientItineraryView';
import { track } from '../utils/analytics';

import { BookingOptions } from '../components/BookingOptions';
import { SplashScreen } from '../components/SplashScreen';
import { AILoadingState } from '../components/AILoadingState';
import { SikkimSherpa } from '../components/SikkimSherpa';
import { motion, AnimatePresence } from 'framer-motion';
import { generateItinerary } from '../services/ai';
import { decodeItineraryFromUrl } from '../utils/sharing';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from '../components/AuthModal';

type SearchRequest = { prompt: string };

export function PlannerPage() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const [showSplash, setShowSplash] = useState(() => {
        const seen = localStorage.getItem('himato_splash_seen');
        if (seen) return false;
        localStorage.setItem('himato_splash_seen', '1');
        return true;
      });    const [view, setView] = useState<'home' | 'results' | 'shared'>('home');
    const [isSearching, setIsSearching] = useState(false);
    const [itineraryData, setItineraryData] = useState(null);
    const [itineraryId, setItineraryId] = useState<string | null>(null);
    const [error, setError] = useState('');
    // Search the user tried to run while logged out — replayed after login
    const [pendingSearch, setPendingSearch] = useState<SearchRequest | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        // Check for shared itinerary in URL relative to planner
        const sharedPlan = decodeItineraryFromUrl();
        if (sharedPlan) {
            setItineraryData(sharedPlan);
            setView('shared');
            setShowSplash(false);
            return;
        }

        // Check if URL has itinerary ID (from history page or direct link)
        if (id) {
            loadSavedItinerary(id);
        }
    }, [id]);

    const loadSavedItinerary = async (id: string) => {
        setIsSearching(true);
        setError('');
        try {
            const response = await apiClient.getItineraryById(id);
            if (response.status === 'success') {
                setItineraryData(response.data.itinerary.itineraryData);
                setItineraryId(response.data.itinerary._id);
                setView('results');
                setShowSplash(false);
            }
        } catch (error: any) {
            console.error('Failed to load itinerary:', error);
            setError(error.message || 'Failed to load itinerary. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleBackClick = () => {
        navigate('/');
        setView('home');
    };

    const requireLoginFor = (request: SearchRequest) => {
        setPendingSearch(request);
        setShowAuthModal(true);
    };

    const handleSearch = async (prompt: string) => {
        if (!isAuthenticated) {
            requireLoginFor({ prompt });
            return;
        }
        setIsSearching(true);
        setError('');
        setItineraryId(null);
        try {
            const { itinerary, id } = await generateItinerary(prompt);
            setItineraryData(itinerary);
            setItineraryId(id || null);
            setView('results');
            track('itinerary_generated', {
                prompt_length: prompt.length,
              });
        } catch (err: any) {
            console.error(err);
            // Session expired / invalid token — log out and ask to sign in again
            if (err?.status === 401) {
                await logout();
                requireLoginFor({ prompt });
                return;
            }
            setError(err.message || 'Failed to generate plan. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    // Once the user signs in from the popup, run the search they asked for
    useEffect(() => {
        if (isAuthenticated && pendingSearch) {
            const { prompt } = pendingSearch;
            setPendingSearch(null);
            setShowAuthModal(false);
            handleSearch(prompt);
        }
    }, [isAuthenticated, pendingSearch]);

    // If viewing a shared link, render the client view directly (bypassing the main app layout)
    if (view === 'shared' && itineraryData) {
        return <ClientItineraryView data={itineraryData} />;
    }

    return (
        <main className="min-h-screen bg-ai-dark text-ai-text selection:bg-ai-accent/30" role="main">
            <AnimatePresence mode="wait">
                {showSplash ? (
                    <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
                ) : (
                    <>
                        {isSearching && <AILoadingState />}
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
                                </>
                            ) : (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="min-h-screen pt-24 pb-6 sm:pt-28 sm:pb-12"
                                >
                                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                                        <button
                                            onClick={handleBackClick}
                                            className="mb-6 sm:mb-8 text-ai-muted hover:text-ai-text transition-colors flex items-center gap-2.5 text-sm group"
                                        >
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-black/10 bg-white group-hover:border-ai-accent group-hover:bg-ai-accent/5 transition-all">
                                                <span className="group-hover:-translate-x-0.5 transition-transform text-sm leading-none">←</span>
                                            </span>
                                            Back to Search
                                        </button>
                                        {error && (
                                            <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-600">
                                                {error}
                                            </div>
                                        )}
                                        <ItineraryResult data={itineraryData} itineraryId={itineraryId} onItineraryChange={setItineraryData} />
                                        {itineraryData && <BookingOptions data={itineraryData} />}

                                        <div className="mt-12 sm:mt-20">
                                            {/* <SikkimShowcase /> */}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <SikkimSherpa />

            <AuthModal
                isOpen={showAuthModal}
                message="Sign in to generate your Sikkim itinerary"
                onClose={() => {
                    setShowAuthModal(false);
                    setPendingSearch(null);
                }}
                onSuccess={() => setShowAuthModal(false)}
            />
        </main>
    );
}
