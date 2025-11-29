import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, MapPin, Check } from 'lucide-react';

const SUGGESTIONS = [
    "Adventure in Yumthang", "Spiritual Tour in Gangtok", "Silk Route Roadtrip",
    "Trekking in Goecha La", "North Sikkim Explorer", "Pelling Skywalk Visit",
    "Gurudongmar Lake Trip", "Ravangla Buddha Park", "Zuluk Zig Zag Road",
    "Lachung Valley Stay", "Rumtek Monastery Tour", "Namchi Char Dham",
    "Tsomgo Lake Yak Ride", "Village Tourism in Darap", "Rhododendron Trek",
    "Kanchenjunga Sunrise", "River Rafting Teesta", "Organic Farm Stay"
];

interface HeroProps {
    onSearch: (prompt: string, isBusiness: boolean) => void;
    isSearching: boolean;
}

export const Hero = ({ onSearch, isSearching }: HeroProps) => {
    const [prompt, setPrompt] = useState('');
    const [isBusiness, setIsBusiness] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        setSuggestions([...SUGGESTIONS].sort(() => 0.5 - Math.random()).slice(0, 3));
    }, []);

    const handleSearch = () => {
        if (prompt.trim()) {
            onSearch(prompt, isBusiness);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
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
                        <span>AI-POWERED SIKKIM EXPLORER</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-ai-text to-ai-muted">
                        Experience Sikkim <br />
                        <span className="text-ai-accent text-glow">Like Never Before</span>
                    </h1>

                    <p className="text-ai-muted text-lg mb-12 max-w-2xl mx-auto">
                        Let our AI craft your perfect itinerary. From the monasteries of Pelling to the frozen lakes of Gurudongmar.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="relative max-w-2xl mx-auto"
                >
                    <div className="glass p-2 rounded-2xl flex items-center gap-2 focus-within:border-ai-accent/50 transition-colors mb-6">
                        <MapPin className="w-6 h-6 text-ai-muted ml-3" />
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Describe your dream trip (e.g., '7 days hiking in North Sikkim with monastery visits')..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-ai-muted p-2"
                            disabled={isSearching}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="p-3 bg-ai-accent/10 hover:bg-ai-accent/20 text-ai-accent rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isSearching ? <div className="w-5 h-5 border-2 border-ai-accent border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Business Toggle and Suggestions - Single Line Layout */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
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

                        <div className="hidden md:block w-px h-6 bg-white/10" />

                        <div className="flex flex-wrap md:flex-nowrap justify-center gap-3">
                            {suggestions.map((tag, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPrompt(tag)}
                                    className="px-4 py-1.5 rounded-full glass glass-hover text-xs text-ai-muted hover:text-white cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
