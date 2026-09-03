import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Minus, User, Briefcase, MapPin, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ItineraryHistoryPreview } from './ItineraryHistoryPreview';
import { getSeasonalPicks, ALL_PLACE_NAMES, PLACE_CATEGORIES } from '../data/seasonalPlaces';

const PLACEHOLDERS = [
    "Where do the clouds touch the earth in Sikkim?",
    "7 days. North Sikkim. Just mountains and me.",
    "Find me a monastery lost in the morning mist…",
    "I want to wake up above the clouds in Pelling.",
    "Plan a family trip — kids, grandparents, no stress.",
    "Take me somewhere that doesn't have WiFi.",
    "Solo trek through Zuluk before the monsoon hits.",
    "Help me find butter tea and a sunrise view.",
    "Show me Sikkim the way locals see it.",
    "Honeymoon in the Himalayas — surprise me.",
];

// Quick-intent starters that live inside the prompt box — one tap seeds the
// box with a natural-language opener the user can finish in their own words.
const INTENTS = [
    { label: 'Solo',      seed: 'Solo trip through Sikkim — ' },
    { label: 'Family',    seed: 'Family trip to Sikkim with kids and elders — ' },
    { label: 'Adventure', seed: 'Adventure trek across Sikkim — ' },
    { label: 'Honeymoon', seed: 'Honeymoon in the Sikkim Himalayas — ' },
];

// How many seasonal chips show in the collapsed "Popular right now" row.
const VISIBLE_PICKS = 6;

interface HeroProps {
    onSearch: (prompt: string, isBusiness: boolean, businessName?: string) => void;
    isSearching: boolean;
    error?: string;
}

export const Hero = ({ onSearch, isSearching, error }: HeroProps) => {
    const { user } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [isBusiness, setIsBusiness] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [placeholderVisible, setPlaceholderVisible] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Season-aware "Popular right now" picks, resolved once for today's date.
    // Deliberately static — the row never re-shuffles on its own, so a user
    // reading the chips is never surprised by them changing under them.
    const [{ season, picks }] = useState(() => getSeasonalPicks());

    const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isSearching) {
            setLocalIsSubmitting(false);
        }
    }, [isSearching]);


    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderVisible(false);
            setTimeout(() => {
                setPlaceholderIndex(i => (i + 1) % PLACEHOLDERS.length);
                setPlaceholderVisible(true);
            }, 350);
        }, 3200);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = () => {
        if (prompt.trim() && !localIsSubmitting && !isSearching) {
            setLocalIsSubmitting(true);
            // If user is a business user, use their businessName, otherwise use undefined
            const businessName = (isBusiness && user?.business && user?.businessName) ? user.businessName : undefined;
            onSearch(prompt, isBusiness, businessName);
        }
    };

    const applyIntent = (seed: string) => {
        setPrompt(seed);
        // Drop the caret at the end so the user keeps typing their own detail.
        requestAnimationFrame(() => {
            const el = textareaRef.current;
            if (el) {
                el.focus();
                el.setSelectionRange(seed.length, seed.length);
            }
        });
    };

    const disabled = isSearching || localIsSubmitting;

    // Fixed, non-shuffling set of season-appropriate places for the collapsed row.
    const visiblePicks = picks.slice(0, VISIBLE_PICKS);

    // Live search over the categorised full list for the "explore all" panel.
    const q = query.trim().toLowerCase();
    const filteredCategories = PLACE_CATEGORIES
        .map((cat) => ({ ...cat, matches: cat.places.filter((n) => n.toLowerCase().includes(q)) }))
        .filter((cat) => cat.matches.length > 0);
    const totalMatches = filteredCategories.reduce((n, c) => n + c.matches.length, 0);

    const selectPlace = (name: string) => {
        setPrompt(name);
        setIsExpanded(false);
        setQuery('');
    };

    const closeExplorer = () => {
        setIsExpanded(false);
        setQuery('');
    };

    return (
        <header className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16" role="banner">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-secondary/20 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ai-accent/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-2xl px-4 text-center">
                {/* Headline block — tight rhythm, clear hierarchy */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold leading-[1.02] mb-4">
                        <span className="text-ai-text">Plan your Sikkim trip</span>
                        <br />
                        <span className="text-ai-accent">in 60 seconds.</span>
                    </h1>

                    <p className="text-ai-muted text-base md:text-lg mb-8 max-w-xl mx-auto">
                        Describe your trip in a sentence. Get a day-by-day itinerary — permits,
                        hidden valleys, and the spots blogs miss.
                    </p>
                </motion.div>

                {/* Prompt box — the centerpiece */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="relative"
                >
                    {/* Audience segmented toggle — travel agents self-identify before typing */}
                    <div className="flex justify-center mb-4">
                        <div className="inline-flex items-center p-1 rounded-full glass border border-black/10 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setIsBusiness(false)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${!isBusiness ? 'bg-ai-accent text-white shadow' : 'text-ai-muted hover:text-ai-text'}`}
                            >
                                <User className="w-4 h-4" />
                                For myself
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsBusiness(true)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${isBusiness ? 'bg-ai-accent text-white shadow' : 'text-ai-accent/80 hover:text-ai-accent'}`}
                            >
                                <Briefcase className="w-4 h-4" />
                                I'm a travel agent
                            </button>
                        </div>
                    </div>

                    <div className={`glass rounded-2xl p-3 text-left transition-all duration-300 ${error ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'focus-within:border-ai-accent/50 focus-within:shadow-[0_10px_40px_-12px_rgba(47,74,58,0.35)]'}`}>
                        <textarea
                            ref={textareaRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSearch();
                                }
                            }}
                            rows={2}
                            placeholder={PLACEHOLDERS[placeholderIndex]}
                            className="w-full bg-transparent border-none outline-none resize-none text-ai-text placeholder:text-ai-muted p-2 text-base leading-relaxed transition-opacity duration-300 min-h-[3.5rem]"
                            style={{ opacity: placeholderVisible || prompt ? 1 : 0 }}
                            disabled={disabled}
                        />

                        {/* Box footer: intent chips + send */}
                        <div className="flex items-center justify-between gap-2 mt-1 pl-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {INTENTS.map((intent) => (
                                    <button
                                        key={intent.label}
                                        type="button"
                                        onClick={() => applyIntent(intent.seed)}
                                        disabled={disabled}
                                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-ai-muted hover:text-ai-accent hover:bg-ai-accent/10 transition-colors disabled:opacity-50"
                                    >
                                        {intent.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={disabled || !prompt.trim()}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ai-accent hover:bg-ai-secondary text-white text-sm font-semibold transition-colors disabled:opacity-40 shrink-0"
                            >
                                {isSearching ? (
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Plan trip
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 text-left"
                        >
                            <div className="inline-flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm backdrop-blur-sm">
                                <div className="p-1 bg-amber-500/20 rounded-full mt-0.5">
                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                </div>
                                <p>{error}</p>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait" initial={false}>
                        {isExpanded ? (
                            /* Searchable category explorer */
                            <motion.div
                                key="explorer"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2, ease: 'easeInOut' } }}
                                className="overflow-hidden"
                            >
                              <div className="mt-6 text-left glass rounded-2xl p-4 sm:p-5">
                                {/* Search bar + close */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl bg-white/70 border border-black/10 focus-within:border-ai-accent/50 transition-colors">
                                        <Search className="w-4 h-4 text-ai-muted shrink-0" />
                                        <input
                                            autoFocus
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder={`Search ${ALL_PLACE_NAMES.length} places…`}
                                            className="flex-1 bg-transparent outline-none text-sm text-ai-text placeholder:text-ai-muted min-w-0"
                                        />
                                        {query && (
                                            <button
                                                onClick={() => setQuery('')}
                                                className="p-0.5 rounded-full text-ai-muted hover:text-ai-text hover:bg-black/5 transition-colors"
                                                title="Clear"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={closeExplorer}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ai-accent/10 border border-ai-accent/20 text-xs font-medium text-ai-accent hover:bg-ai-accent/20 transition-colors shrink-0"
                                        title="Collapse"
                                    >
                                        <Minus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Close</span>
                                    </button>
                                </div>

                                {/* Grouped, filtered results */}
                                <div className="max-h-72 overflow-y-auto custom-scrollbar pr-1 space-y-4">
                                    {filteredCategories.map((cat) => (
                                        <div key={cat.key}>
                                            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-ai-text">
                                                <span className="text-sm leading-none">{cat.emoji}</span>
                                                {cat.label}
                                                <span className="text-ai-muted font-normal">({cat.matches.length})</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {cat.matches.map((name) => (
                                                    <button
                                                        key={name}
                                                        onClick={() => selectPlace(name)}
                                                        className="px-3.5 py-1.5 rounded-full glass glass-hover text-xs text-ai-muted hover:text-ai-text cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
                                                    >
                                                        {name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {totalMatches === 0 && (
                                        <p className="text-sm text-ai-muted text-center py-6">
                                            No places match “{query.trim()}”.
                                        </p>
                                    )}
                                </div>
                              </div>
                            </motion.div>
                        ) : (
                            /* Season-aware "Popular right now" row */
                            <motion.div
                                key="popular"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2, ease: 'easeInOut' } }}
                                className="overflow-hidden"
                            >
                              <div className="pb-1">
                                <div className="mt-6 mb-3 flex items-center justify-center gap-2 text-xs text-ai-muted">
                                    <span className="text-sm leading-none">{season.emoji}</span>
                                    <span>
                                        <span className="font-semibold text-ai-text">Popular right now</span>
                                        <span className="text-ai-muted"> · {season.tagline}</span>
                                    </span>
                                </div>

                                <div className="relative w-full flex flex-wrap justify-center gap-2">
                                    {visiblePicks.map((place) => (
                                        <button
                                            key={place.name}
                                            onClick={() => setPrompt(place.name)}
                                            title={place.note}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass glass-hover text-xs text-ai-muted hover:text-ai-text cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
                                        >
                                            <MapPin className="w-3 h-3 text-ai-accent shrink-0" />
                                            {place.name}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setIsExpanded(true)}
                                        className="px-3.5 py-1.5 rounded-full bg-ai-accent/10 border border-ai-accent/20 text-xs text-ai-accent hover:bg-ai-accent/20 cursor-pointer transition-all hover:scale-105 whitespace-nowrap font-medium"
                                    >
                                        +{ALL_PLACE_NAMES.length} locations
                                    </button>
                                </div>
                              </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Itinerary History Preview */}
                    <ItineraryHistoryPreview />
                </motion.div>
            </div>
        </header>
    );
};
