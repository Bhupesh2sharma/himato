import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, MessageCircle, Star, Quote, ShieldCheck, Calendar, Wallet, Navigation as NavigationIcon, Info, ChevronRight, Share2 } from 'lucide-react';
import { useState } from 'react';

// --- Types ---
interface Activity {
    time: string;
    title: string;
    description: string;
    location: string;
}

interface DayPlan {
    day: number;
    title: string;
    activities: Activity[];
}

interface ClientItineraryViewProps {
    data: {
        days: DayPlan[];
        businessName?: string;
        agentName?: string;
        contactNumber?: string;
        brandColor?: string;
        welcomeNote?: string;
        pricing?: {
            total: string;
            perGuest?: string;
        };
        notes?: string;
    } | null;
}

// --- Icons ---
const TabIcon = ({ type, color }: { type: string, color: string }) => {
    switch (type) {
        case 'overview': return <Star className="w-5 h-5" style={{ color }} />;
        case 'day': return <Calendar className="w-5 h-5" style={{ color }} />;
        case 'notes': return <Info className="w-5 h-5" style={{ color }} />;
        default: return <Star className="w-5 h-5" style={{ color }} />;
    }
};

export const ClientItineraryView = ({ data }: ClientItineraryViewProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | number | 'notes'>('overview');

    if (!data) return null;

    const hasAgentBranding = data.businessName || data.agentName;
    const accentColor = data.brandColor || '#22C55E';

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '34, 197, 94';
    };
    const rgbAccent = hexToRgb(accentColor);

    // --- Sub-Views ---

    const OverviewView = () => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6 pb-32"
        >
            {/* Hero Card */}
            <div className="relative rounded-[2rem] overflow-hidden bg-[#111] border border-white/10 aspect-[4/3] sm:aspect-[21/9] flex items-end p-6 sm:p-10 group">
                <div
                    className="absolute inset-0 opacity-20 transition-opacity duration-1000 group-hover:opacity-30"
                    style={{ background: `radial-gradient(circle at top right, ${accentColor}, transparent 70%)` }}
                />

                <div className="relative z-10 w-full">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4">
                        <span className="text-xs font-bold tracking-wider uppercase text-white">Your Itinerary</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 leading-tight">
                        Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Sikkim</span>
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {data.days.length} Days</span>
                        {data.pricing?.total && (
                            <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4" /> {data.pricing.total}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Welcome Note */}
            {data.welcomeNote && (
                <div className="bg-[#161616] rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Quote className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black" style={{ backgroundColor: accentColor }}>
                                {hasAgentBranding ? (data.agentName?.[0] || data.businessName?.[0] || 'A') : 'H'}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Message from</p>
                                <p className="text-white font-medium">{data.agentName || "Your Travel Expert"}</p>
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-serif italic text-gray-300 leading-relaxed">
                            "{data.welcomeNote}"
                        </p>
                    </div>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setActiveTab(1)} className="bg-[#111] p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <NavigationIcon className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Start Journey</p>
                    <p className="text-white font-bold text-lg">Day 1 Plan</p>
                </div>
                <div onClick={() => data.contactNumber && window.open(`https://wa.me/${data.contactNumber}`, '_blank')} className="bg-[#111] p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Have Questions?</p>
                    <p className="text-white font-bold text-lg">Contact Agent</p>
                </div>
            </div>

            {/* Himato Badge */}
            <div className="flex justify-center pt-8 opacity-40 hover:opacity-100 transition-opacity">
                <a href="https://himato.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span className="text-[10px] font-medium tracking-widest uppercase text-gray-500 hover:text-gray-300">Powered by Himato</span>
                </a>
            </div>
        </motion.div>
    );

    const DayView = ({ dayNum }: { dayNum: number }) => {
        const day = data.days.find(d => d.day === dayNum);
        if (!day) return null;

        return (
            <motion.div
                key={dayNum}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-6 pb-32"
            >
                {/* Day Header */}
                <div className="flex items-end justify-between px-2">
                    <div>
                        <span className="text-5xl font-bold text-white block -ml-1" style={{ textShadow: `0 0 30px rgba(${rgbAccent}, 0.3)` }}>
                            Day {day.day}
                        </span>
                        <h2 className="text-xl text-gray-400 mt-2 max-w-md leading-snug">{day.title}</h2>
                    </div>
                    {/* Navigation Arrows */}
                    <div className="flex gap-2">
                        <button
                            disabled={dayNum === 1}
                            onClick={() => setActiveTab(dayNum - 1)}
                            className="w-10 h-10 rounded-full bg-white/5 disabled:opacity-30 hover:bg-white/10 flex items-center justify-center border border-white/10"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <button
                            disabled={dayNum === data.days.length}
                            onClick={() => setActiveTab(dayNum + 1)}
                            className="w-10 h-10 rounded-full bg-white/5 disabled:opacity-30 hover:bg-white/10 flex items-center justify-center border border-white/10"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative border-l border-white/10 ml-3 md:ml-6 space-y-8 py-4">
                    {day.activities.map((activity, i) => (
                        <div key={i} className="relative pl-8 md:pl-12 group">
                            {/* Dot */}
                            <div
                                className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full border border-[#050505] transition-all duration-300 group-hover:scale-150"
                                style={{ backgroundColor: i === 0 ? accentColor : '#333' }}
                            />

                            {/* Card */}
                            <div className="bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-2xl p-5 hover:translate-x-2 transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                    <h3 className="font-bold text-lg text-white">{activity.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded" style={{ '--accent': accentColor } as any}>
                                            {activity.time}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-4">{activity.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <MapPin className="w-3 h-3" /> {activity.location}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    };

    const NotesView = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pb-32"
        >
            <div className="bg-[#111] rounded-3xl p-8 border border-white/5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                    <ShieldCheck className="w-3 h-3 text-gray-300" />
                    <span className="text-xs font-bold tracking-wider uppercase text-gray-300">Important Information</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-8">Terms & Notes</h2>
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="whitespace-pre-line text-gray-400 leading-loose">
                        {data.notes || "No additional notes provided for this itinerary."}
                    </p>
                </div>

                {hasAgentBranding && (
                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-sm mb-4">Have specific requirements?</p>
                        {data.contactNumber && (
                            <button
                                onClick={() => window.open(`https://wa.me/${data.contactNumber}`, '_blank')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Chat with {data.agentName?.split(' ')[0] || "Agent"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );

    // --- Main Layout ---

    return (
        <div className="w-full h-screen bg-[#050505] text-white selection:bg-white/20 font-sans overflow-hidden flex flex-col relative">

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 right-0 h-[50vh] opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${accentColor}, transparent 70%)` }} />

            {/* Header */}
            <header className="flex-none h-20 px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    {hasAgentBranding && (
                        <>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-lg" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}>
                                {data.businessName?.[0] || 'A'}
                            </div>
                            <span className="font-bold text-sm tracking-wide">{data.businessName || "Itinerary"}</span>
                        </>
                    )}
                </div>
                {/* Share Button (Mock) */}
                <button
                    onClick={() => navigator.share?.({ title: 'My Itinerary', url: window.location.href })}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                    <Share2 className="w-4 h-4 text-white" />
                </button>
            </header>

            {/* Main Content (Scrollable) */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 z-10 scrollbar-hide">
                <div className="max-w-3xl mx-auto pt-4">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && <OverviewView key="overview" />}
                        {typeof activeTab === 'number' && <DayView key="day" dayNum={activeTab} />}
                        {activeTab === 'notes' && <NotesView key="notes" />}
                    </AnimatePresence>
                </div>
            </main>

            {/* Floating Dock Navigation */}
            <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 sm:gap-2 pointer-events-auto max-w-full overflow-x-auto no-scrollbar">

                    {/* Overview Tab */}
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`p-3 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${activeTab === 'overview' ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                    >
                        <TabIcon type="overview" color={activeTab === 'overview' ? accentColor : 'currentColor'} />
                        <span className={`text-sm font-bold whitespace-nowrap ${activeTab === 'overview' ? 'block' : 'hidden sm:block'}`}>Overview</span>
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    {/* Days Tabs (Scrollable if many) */}
                    <div className="flex gap-1 overflow-x-auto max-w-[50vw] sm:max-w-none no-scrollbar">
                        {data.days.map((day) => (
                            <button
                                key={day.day}
                                onClick={() => setActiveTab(day.day)}
                                className={`w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === day.day ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                            >
                                <span className="text-xs sm:text-sm font-bold">D{day.day}</span>
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    {/* Notes Tab */}
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`p-3 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${activeTab === 'notes' ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                    >
                        <TabIcon type="notes" color={activeTab === 'notes' ? accentColor : 'currentColor'} />
                        <span className={`text-sm font-bold whitespace-nowrap ${activeTab === 'notes' ? 'block' : 'hidden sm:block'}`}>Info</span>
                    </button>

                </div>
            </div>

        </div>
    );
};
