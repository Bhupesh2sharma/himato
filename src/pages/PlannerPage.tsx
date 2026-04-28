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
import { decodeItineraryFromUrl, encodeItineraryToUrl } from '../utils/sharing';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link as LinkIcon, Mail, Check } from 'lucide-react';
import { EmailItineraryCapture } from '../components/EmailItineraryCapture';

export function PlannerPage() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [showSplash, setShowSplash] = useState(() => {
        const seen = localStorage.getItem('himato_splash_seen');
        if (seen) return false;
        localStorage.setItem('himato_splash_seen', '1');
        return true;
      });    const [view, setView] = useState<'home' | 'results' | 'shared'>('home');
    const [isSearching, setIsSearching] = useState(false);
    const [itineraryData, setItineraryData] = useState(null);
    const [routeData, setRouteData] = useState<{ days: Array<any> } | null>(null);
    const [itineraryId, setItineraryId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [modalShareCopied, setModalShareCopied] = useState(false);

    const copyShareLinkFromModal = async () => {
        if (!itineraryData) return;
        try {
            const url = encodeItineraryToUrl(itineraryData);
            await navigator.clipboard.writeText(url);
            track('share_link_copied', {
                itinerary_id: itineraryId ?? 'guest',
                location: 'exit_modal',
            });
            setModalShareCopied(true);
            setTimeout(() => setModalShareCopied(false), 2500);
        } catch (err) {
            console.error('Failed to copy share link:', err);
        }
    };

    const scrollToEmailCapture = () => {
        setShowExitConfirm(false);
        // Defer to next paint so the modal can dismiss before we scroll
        requestAnimationFrame(() => {
            document
                .getElementById('email-capture')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    };

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
                setRouteData(response.data.itinerary.routeData || { days: [] });
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
            // generateItinerary now returns { itinerary, routeData, id }
            const { itinerary, routeData: route, id } = await generateItinerary(prompt, isBusiness, businessName);
            setItineraryData(itinerary);
            setRouteData(route);
            setItineraryId(id || null);
            setView('results');
            track('itinerary_generated', {
                is_business: isBusiness,
                prompt_length: prompt.length,
              });
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
                                    <div className="container mx-auto px-4 sm:px-6">
                                        <button
                                            onClick={handleBackClick}
                                            className="mb-6 sm:mb-8 text-ai-muted hover:text-ai-text transition-colors flex items-center gap-2.5 text-sm sm:text-base group"
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
                                        <ItineraryResult data={itineraryData} routeData={routeData} itineraryId={itineraryId} />
                                        {itineraryData && <BookingOptions />}

                                        {/* Email-PDF capture for guests (replaces the old login wall) */}
                                        {view === 'results' && !isAuthenticated && itineraryData && (
                                            <EmailItineraryCapture itineraryData={itineraryData} />
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
                            className="relative w-full max-w-md bg-ai-card border border-black/10 rounded-3xl p-6 sm:p-8 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 text-ai-accent mb-5 font-semibold text-sm tracking-wide uppercase">
                                <div className="p-2.5 rounded-xl bg-ai-accent/10 border border-ai-accent/20">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span>Before you go</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-ai-text mb-3">
                                Don't lose this itinerary
                            </h3>
                            <p className="text-ai-muted mb-7 text-sm sm:text-base">
                                Take it with you — copy a share link, or get a printable PDF in your inbox. Both work without an account.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={copyShareLinkFromModal}
                                    className="w-full py-3.5 bg-ai-accent hover:bg-ai-secondary text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    {modalShareCopied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Link copied to clipboard
                                        </>
                                    ) : (
                                        <>
                                            <LinkIcon className="w-4 h-4" />
                                            Copy share link
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={scrollToEmailCapture}
                                    className="w-full py-3.5 bg-black/5 hover:bg-black/10 border border-black/10 text-ai-text rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    Email me the PDF
                                </button>
                                <button
                                    onClick={() => {
                                        setShowExitConfirm(false);
                                        navigate('/');
                                        setView('home');
                                    }}
                                    className="w-full py-3 text-ai-muted hover:text-ai-text rounded-2xl text-sm font-medium transition-all"
                                >
                                    Leave anyway
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
