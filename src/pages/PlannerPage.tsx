import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ItineraryResult } from '../components/ItineraryResult';
import { ClientItineraryView } from '../components/ClientItineraryView';

import { BookingOptions } from '../components/BookingOptions';
import { SplashScreen } from '../components/SplashScreen';
import { SikkimSherpa } from '../components/SikkimSherpa';
import { motion, AnimatePresence } from 'framer-motion';
import { generateItinerary } from '../services/ai';
import { decodeItineraryFromUrl } from '../utils/sharing';
import { apiClient } from '../services/api';

export function PlannerPage() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const [showSplash, setShowSplash] = useState(true);
    const [view, setView] = useState<'home' | 'results' | 'shared'>('home');
    const [isSearching, setIsSearching] = useState(false);
    const [itineraryData, setItineraryData] = useState(null);
    const [itineraryId, setItineraryId] = useState<string | null>(null);
    const [error, setError] = useState('');

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

    const handleSearch = async (prompt: string, isBusiness: boolean, businessName?: string) => {
        setIsSearching(true);
        setError('');
        setItineraryId(null); // Reset ID for new itineraries
        try {
            const data = await generateItinerary(prompt, isBusiness, businessName);
            setItineraryData(data);
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
                                        }}
                                        className="mb-6 sm:mb-8 text-ai-muted hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base"
                                    >
                                        ← Back to Search
                                    </button>
                                    {error && (
                                        <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                                            {error}
                                        </div>
                                    )}
                                    <ItineraryResult data={itineraryData} itineraryId={itineraryId} />
                                    {itineraryData && <BookingOptions />}
                                    <div className="mt-12 sm:mt-20">
                                        {/* <SikkimShowcase /> */}
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
