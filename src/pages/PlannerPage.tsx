import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ItineraryResult } from '../components/ItineraryResult';
import { ClientItineraryView } from '../components/ClientItineraryView';

import { BookingOptions } from '../components/BookingOptions';
import { SplashScreen } from '../components/SplashScreen';
import { AILoadingState } from '../components/AILoadingState';
import { SikkimSherpa } from '../components/SikkimSherpa';
import { motion, AnimatePresence } from 'framer-motion';
import { generateItinerary } from '../services/ai';
import { decodeItineraryFromUrl } from '../utils/sharing';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, AlertTriangle, Sparkles } from 'lucide-react';

export function PlannerPage() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [showSplash, setShowSplash] = useState(true);
    const [view, setView] = useState<'home' | 'results' | 'shared'>('home');
    const [isSearching, setIsSearching] = useState(false);
    const [itineraryData, setItineraryData] = useState(null);
    const [itineraryId, setItineraryId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [showExitConfirm, setShowExitConfirm] = useState(false);

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

        // Add beforeunload listener to prevent accidental data loss for guests
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (view === 'results' && !isAuthenticated) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [id, view, isAuthenticated]);

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
        if (view === 'results' && !isAuthenticated) {
            setShowExitConfirm(true);
        } else {
            navigate('/');
            setView('home');
        }
    };

    const handleSearch = async (prompt: string, isBusiness: boolean, businessName?: string) => {
        setIsSearching(true);
        setError('');
        setItineraryId(null);
        try {
            // generateItinerary now returns { itinerary, id }
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
                                    <div className="container mx-auto px-4 sm:px-6">
                                        <button
                                            onClick={handleBackClick}
                                            className="mb-6 sm:mb-8 text-ai-muted hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base group"
                                        >
                                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Search
                                        </button>
                                        {error && (
                                            <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                                                {error}
                                            </div>
                                        )}
                                        <ItineraryResult data={itineraryData} itineraryId={itineraryId} />
                                        {itineraryData && <BookingOptions />}

                                        {/* Login Reminder at the end for guests */}
                                        {view === 'results' && !isAuthenticated && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-ai-secondary/20 to-ai-accent/5 border border-ai-accent/20 text-center relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                                    <Sparkles className="w-32 h-32 text-ai-accent" />
                                                </div>
                                                <div className="relative z-10 max-w-2xl mx-auto">
                                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                                        Don't Lose Your Adventure! 🏔️
                                                    </h3>
                                                    <p className="text-ai-muted mb-8 text-sm sm:text-base">
                                                        You're viewing a guest itinerary. Significant changes or local saves require an account.
                                                        Join our community to save this plan forever and access exclusive Himalayan guides.
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                        <button
                                                            onClick={() => navigate('/login')}
                                                            className="px-8 py-3 bg-ai-accent hover:bg-ai-secondary text-white rounded-full font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                                                        >
                                                            <LogIn className="w-4 h-4" />
                                                            Log In to Save
                                                        </button>
                                                        <button
                                                            onClick={() => navigate('/register')}
                                                            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-full font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                            Create Free Account
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
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

            {/* Exit Confirmation Modal */}
            <AnimatePresence>
                {showExitConfirm && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowExitConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-ai-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl"
                        >
                            <div className="flex items-center gap-4 text-amber-500 mb-6 font-bold">
                                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <span>Unsaved Changes</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                                Wait, don't leave yet!
                            </h3>
                            <p className="text-ai-muted mb-8 text-sm sm:text-base">
                                You are not logged in. If you go back now, your generated itinerary will be **permanently lost**.
                                Would you like to log in first?
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 bg-ai-accent hover:bg-ai-secondary text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    Log In & Save Itinerary
                                </button>
                                <button
                                    onClick={() => {
                                        setShowExitConfirm(false);
                                        navigate('/');
                                        setView('home');
                                    }}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl font-medium transition-all"
                                >
                                    I'm okay with losing it
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
