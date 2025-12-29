import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, MapPin, Check, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ItineraryHistoryPreview } from './ItineraryHistoryPreview';

const SUGGESTIONS = [
    "Gangtok Nightlife", "Pelling Skywalk", "Lachung Valley", "Lachen Monastery",
    "Yumthang Valley of Flowers", "Gurudongmar Lake", "Nathula Pass Adventure",
    "Tsomgo Lake Yak Ride", "Zuluk Silk Route", "Ravangla Buddha Park",
    "Namchi Char Dham", "Yuksom Trekking Base", "Geyzing Local Culture",
    "Aritar Lake Boating", "Rinchenpong Village", "Mangan North Sikkim",
    "Chungthang Confluence", "Thangu Valley Stay", "Chopta Valley Trek",
    "Mt. Katao Snow Point", "Kala Patthar Snow", "Zero Point Yumesamdong",
    "Baba Mandir Visit", "Rumtek Monastery", "Enchey Monastery",
    "Tashiding Monastery", "Pemayangtse Monastery", "Khecheopalri Wish Lake",
    "Kanchenjunga Falls", "Singshore Bridge Walk", "Temi Tea Garden",
    "Samdruptse Hill", "Maenam Wildlife Trek", "Barsey Rhododendron Trek",
    "Seven Sisters Waterfalls", "Banjhakri Falls", "Tashi View Point"
];

interface HeroProps {
    onSearch: (prompt: string, isBusiness: boolean, businessName?: string) => void;
    isSearching: boolean;
    error?: string;
}

export const Hero = ({ onSearch, isSearching, error }: HeroProps) => {
    const { user } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [isBusiness, setIsBusiness] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isSearching) {
            setLocalIsSubmitting(false);
        }
    }, [isSearching]);

    useEffect(() => {
        setSuggestions([...SUGGESTIONS].sort(() => 0.5 - Math.random()).slice(0, 3));
    }, []);

    const handleSearch = () => {
        if (prompt.trim() && !localIsSubmitting && !isSearching) {
            setLocalIsSubmitting(true);
            // If user is a business user, use their businessName, otherwise use undefined
            const businessName = (isBusiness && user?.business && user?.businessName) ? user.businessName : undefined;
            onSearch(prompt, isBusiness, businessName);
        }
    };

    return (
        <header className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16" role="banner">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-secondary/20 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ai-accent/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-4xl px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass text-ai-accent text-sm font-mono">
                        <Sparkles className="w-4 h-4" />
                        <span>AI-POWERED SIKKIM TOURISM PLANNER</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        <span className="text-white">AI-Powered</span> <br />
                        <span className="text-ai-accent text-glow">Travel Planner</span>
                    </h1>

                    <p className="text-ai-muted text-sm mb-12 max-w-2xl mx-auto">
                        Plan your Sikkim tourism trip with our free AI travel planner. Get custom Sikkim tourism itineraries for Gangtok, North Sikkim, Pelling, and 30+ Sikkim tourism destinations. Perfect for solo travelers, families, and travel agents planning Sikkim tourism packages.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="relative max-w-2xl mx-auto"
                >
                    <div className={`glass p-2 rounded-2xl flex items-center gap-2 transition-all duration-300 mb-6 ${error ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'focus-within:border-ai-accent/50'}`}>
                        <MapPin className={`w-6 h-6 ml-3 ${error ? 'text-amber-400' : 'text-ai-muted'}`} />
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Plan your Sikkim tourism trip (e.g., '7 days Sikkim tourism package in North Sikkim with monastery visits')..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-ai-muted p-2"
                            disabled={isSearching || localIsSubmitting}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching || localIsSubmitting}
                            className={`p-3 rounded-xl transition-colors disabled:opacity-50 ${error ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400' : 'bg-ai-accent/10 hover:bg-ai-accent/20 text-ai-accent'}`}
                        >
                            {isSearching ? <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${error ? 'border-amber-400' : 'border-ai-accent'}`} /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 text-left"
                        >
                            <div className="inline-flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm backdrop-blur-sm">
                                <div className="p-1 bg-amber-500/20 rounded-full mt-0.5">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                </div>
                                <p>{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Business Toggle and Suggestions */}
                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group whitespace-nowrap">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isBusiness ? 'bg-ai-accent border-ai-accent' : 'border-ai-muted group-hover:border-ai-accent'}`}>
                                    {isBusiness && <Check className="w-3 h-3 text-ai-dark" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isBusiness}
                                    onChange={(e) => setIsBusiness(e.target.checked)}
                                    className="hidden"
                                />
                                <span className={`text-sm ${isBusiness ? 'text-ai-accent' : 'text-ai-muted group-hover:text-white'} transition-colors`}>
                                    I am a Travel Agent / Business
                                </span>
                            </label>
                        </div>

                        <motion.div
                            layout
                            className={`relative w-full flex flex-wrap justify-center gap-3 ${isExpanded ? 'max-h-60 overflow-y-auto p-8 glass rounded-2xl scrollbar-thin scrollbar-thumb-ai-accent/20 scrollbar-track-transparent' : ''}`}
                        >
                            {isExpanded && (
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-ai-muted hover:text-white transition-colors"
                                    title="Collapse"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                            )}

                            {(isExpanded ? SUGGESTIONS : suggestions).map((tag, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPrompt(tag)}
                                    className="px-4 py-1.5 rounded-full glass glass-hover text-xs text-ai-muted hover:text-white cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
                                >
                                    {tag}
                                </button>
                            ))}

                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="px-4 py-1.5 rounded-full bg-ai-accent/10 border border-ai-accent/20 text-xs text-ai-accent hover:bg-ai-accent/20 cursor-pointer transition-all hover:scale-105 whitespace-nowrap font-medium"
                            >
                                {isExpanded ? "Show Less" : "+30 Locations"}
                            </button>
                        </motion.div>
                    </div>
                    
                    {/* Itinerary History Preview */}
                    <ItineraryHistoryPreview />
                </motion.div>
            </div>
        </header>
    );
};
