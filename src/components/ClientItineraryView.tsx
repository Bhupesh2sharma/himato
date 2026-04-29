import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    MessageCircle,
    Quote,
    ShieldCheck,
    Calendar,
    Wallet,
    Navigation as NavigationIcon,
    Info,
    ChevronRight,
    Share2,
    Star,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { heroImageForItinerary } from '../utils/locationImages';

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
        brandLogo?: string; // base64 data URL, optional
        customHeroImage?: string; // base64 or URL — overrides auto-picked hero
        welcomeNote?: string;
        pricing?: {
            total?: string;
            perGuest?: string;
            includes?: string; // free-text "what's included" (e.g. "Hotels, cabs, permits")
        };
        notes?: string;
    } | null;
}

// --- Icons ---
const TabIcon = ({ type, color }: { type: string; color: string }) => {
    switch (type) {
        case 'overview':
            return <Star className="w-5 h-5" style={{ color }} />;
        case 'day':
            return <Calendar className="w-5 h-5" style={{ color }} />;
        case 'notes':
            return <Info className="w-5 h-5" style={{ color }} />;
        default:
            return <Star className="w-5 h-5" style={{ color }} />;
    }
};

const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '34, 197, 94';
};

export const ClientItineraryView = ({ data }: ClientItineraryViewProps) => {
    const [activeTab, setActiveTab] = useState<'overview' | number | 'notes'>('overview');

    if (!data) return null;

    const hasAgentBranding = Boolean(data.businessName || data.agentName);
    const accentColor = data.brandColor || '#22C55E';
    const rgbAccent = hexToRgb(accentColor);
    const heroImage = data.customHeroImage || heroImageForItinerary(data);

    // Build a clean list of "includes" chips out of pricing.includes (split by commas / pipes / newlines).
    const includesList: string[] = (data.pricing?.includes ?? '')
        .split(/[,\|\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);

    const hasPricing = Boolean(data.pricing?.total || data.pricing?.perGuest || includesList.length);

    const handleConfirmTrip = () => {
        if (!data.contactNumber) return;
        const tripLength = `${data.days.length}-Day Sikkim`;
        const message = `Hi ${data.agentName || 'there'}, I'd like to confirm the ${tripLength} itinerary you sent me${data.businessName ? ` from ${data.businessName}` : ''}. When can we proceed?`;
        const url = `https://wa.me/${data.contactNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleAskQuestion = () => {
        if (!data.contactNumber) return;
        const message = `Hi ${data.agentName || 'there'}, I have a question about the ${data.days.length}-day Sikkim itinerary you shared with me.`;
        const url = `https://wa.me/${data.contactNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // --- Sub-Views ---

    const OverviewView = () => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6 pb-32"
        >
            {/* Hero Card with real Sikkim photo */}
            <div className="relative rounded-[2rem] overflow-hidden bg-[#111] border border-white/10 aspect-[4/3] sm:aspect-[21/9] flex items-end p-6 sm:p-10 group">
                <img
                    src={heroImage}
                    alt="Sikkim"
                    loading="eager"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                />
                {/* Dark gradient for text legibility */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.55) 45%, rgba(5,5,5,0.15) 100%)',
                    }}
                />
                {/* Brand color tint */}
                <div
                    className="absolute inset-0 opacity-30 mix-blend-soft-light pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at 80% 0%, ${accentColor}, transparent 70%)`,
                    }}
                />

                <div className="relative z-10 w-full">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-4"
                        style={{ color: accentColor }}
                    >
                        <Sparkles className="w-3 h-3" />
                        <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white">
                            Your Itinerary
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-bold text-white mb-3 leading-[1.05]">
                        {data.days.length}-Day{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                            Sikkim Journey
                        </span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-white/80">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {data.days.length} days
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            Sikkim, India
                        </span>
                        {data.pricing?.total && (
                            <span className="flex items-center gap-1.5">
                                <Wallet className="w-4 h-4" />
                                {data.pricing.total}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Pricing & Inclusions Card — only if any pricing data exists */}
            {hasPricing && (
                <div className="bg-[#111] rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.06]">
                        <Wallet className="w-28 h-28" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-5">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: `rgba(${rgbAccent}, 0.15)`, color: accentColor }}
                            >
                                <Wallet className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
                                Pricing & Inclusions
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            {data.pricing?.total && (
                                <div className="rounded-2xl p-5 bg-black/30 border border-white/5">
                                    <p className="text-[10px] tracking-wider uppercase text-gray-500 mb-1">Total</p>
                                    <p className="text-2xl font-bold text-white">{data.pricing.total}</p>
                                </div>
                            )}
                            {data.pricing?.perGuest && (
                                <div className="rounded-2xl p-5 bg-black/30 border border-white/5">
                                    <p className="text-[10px] tracking-wider uppercase text-gray-500 mb-1">Per guest</p>
                                    <p className="text-2xl font-bold text-white">{data.pricing.perGuest}</p>
                                </div>
                            )}
                        </div>

                        {includesList.length > 0 && (
                            <>
                                <p className="text-[10px] tracking-wider uppercase text-gray-500 mb-2">Includes</p>
                                <div className="flex flex-wrap gap-2">
                                    {includesList.map((item) => (
                                        <span
                                            key={item}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                                            style={{
                                                background: `rgba(${rgbAccent}, 0.08)`,
                                                borderColor: `rgba(${rgbAccent}, 0.25)`,
                                                color: '#e5e7eb',
                                            }}
                                        >
                                            <CheckCircle2 className="w-3 h-3" style={{ color: accentColor }} />
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Welcome Note */}
            {data.welcomeNote && (
                <div className="bg-[#161616] rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Quote className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <AgencyAvatar
                                accentColor={accentColor}
                                logo={data.brandLogo}
                                businessName={data.businessName}
                                agentName={data.agentName}
                                size={40}
                            />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                                    Message from
                                </p>
                                <p className="text-white font-medium">
                                    {data.agentName || data.businessName || 'Your Travel Expert'}
                                </p>
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl font-serif italic text-gray-300 leading-relaxed">
                            "{data.welcomeNote}"
                        </p>
                    </div>
                </div>
            )}

            {/* Quick Stats Grid — Day 1 + Contact */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setActiveTab(1)}
                    className="text-left bg-[#111] p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <NavigationIcon className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Start journey</p>
                    <p className="text-white font-bold text-lg">Open Day 1 →</p>
                </button>
                <button
                    onClick={handleAskQuestion}
                    disabled={!data.contactNumber}
                    className="text-left bg-[#111] p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Have questions?</p>
                    <p className="text-white font-bold text-lg">Ask {data.agentName?.split(' ')[0] || 'Agent'}</p>
                </button>
            </div>

            {/* Himato CTA — converts the recipient client into a future Himato user */}
            <div className="flex justify-center pt-6">
                <a
                    href="https://himato.in/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-gray-400">
                        Want to plan your own trip?{' '}
                        <span className="text-white font-medium">Build one free at himato.in →</span>
                    </span>
                </a>
            </div>
        </motion.div>
    );

    const DayView = ({ dayNum }: { dayNum: number }) => {
        const day = data.days.find((d) => d.day === dayNum);
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
                        <span
                            className="text-5xl font-bold text-white block -ml-1"
                            style={{ textShadow: `0 0 30px rgba(${rgbAccent}, 0.3)` }}
                        >
                            Day {day.day}
                        </span>
                        <h2 className="text-xl text-gray-400 mt-2 max-w-md leading-snug">{day.title}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={dayNum === 1}
                            onClick={() => setActiveTab(dayNum - 1)}
                            className="w-10 h-10 rounded-full bg-white/5 disabled:opacity-30 hover:bg-white/10 flex items-center justify-center border border-white/10"
                            aria-label="Previous day"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <button
                            disabled={dayNum === data.days.length}
                            onClick={() => setActiveTab(dayNum + 1)}
                            className="w-10 h-10 rounded-full bg-white/5 disabled:opacity-30 hover:bg-white/10 flex items-center justify-center border border-white/10"
                            aria-label="Next day"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Timeline — text-only activity cards */}
                <div className="relative border-l border-white/10 ml-3 md:ml-6 space-y-5 py-4">
                    {day.activities.map((activity, i) => (
                        <div key={i} className="relative pl-8 md:pl-12 group">
                            {/* Dot */}
                            <div
                                className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full border border-[#050505] transition-all duration-300 group-hover:scale-150"
                                style={{ backgroundColor: i === 0 ? accentColor : '#333' }}
                            />

                            {/* Card — clean text design */}
                            <div className="bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-2xl p-5 hover:translate-x-1 transition-all duration-300">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-white leading-snug flex-1">
                                        {activity.title}
                                    </h3>
                                    <span
                                        className="flex-none text-[11px] font-mono font-medium px-2.5 py-1 rounded-full"
                                        style={{
                                            background: `rgba(${rgbAccent}, 0.14)`,
                                            color: accentColor,
                                            border: `1px solid rgba(${rgbAccent}, 0.35)`,
                                        }}
                                    >
                                        {activity.time}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                                    {activity.description}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                    <MapPin className="w-3 h-3" />
                                    {activity.location}
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
                    <span className="text-xs font-bold tracking-wider uppercase text-gray-300">
                        Important Information
                    </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-8">Terms & Notes</h2>
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="whitespace-pre-line text-gray-400 leading-loose">
                        {data.notes || 'No additional notes provided for this itinerary.'}
                    </p>
                </div>

                {hasAgentBranding && (
                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-sm mb-4">Have specific requirements?</p>
                        {data.contactNumber && (
                            <button
                                onClick={handleAskQuestion}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Chat with {data.agentName?.split(' ')[0] || 'Agent'}
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
            {/* Ambient background tint */}
            <div
                className="absolute top-0 left-0 right-0 h-[50vh] opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${accentColor}, transparent 70%)` }}
            />

            {/* Header */}
            <header className="flex-none h-20 px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-3 min-w-0">
                    {hasAgentBranding ? (
                        <>
                            <AgencyAvatar
                                accentColor={accentColor}
                                logo={data.brandLogo}
                                businessName={data.businessName}
                                agentName={data.agentName}
                                size={32}
                            />
                            <span className="font-bold text-sm tracking-wide truncate">
                                {data.businessName || 'Itinerary'}
                            </span>
                        </>
                    ) : (
                        <span className="font-bold text-sm tracking-wide text-gray-400">Itinerary</span>
                    )}
                </div>
                <button
                    onClick={() =>
                        navigator.share?.({
                            title: data.businessName ? `${data.businessName} — Sikkim Itinerary` : 'My Sikkim Itinerary',
                            url: window.location.href,
                        })
                    }
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="Share itinerary"
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

            {/* Sticky Confirm CTA — only when agent has a WhatsApp number */}
            {data.contactNumber && (
                <div className="fixed bottom-24 sm:bottom-28 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
                    <button
                        onClick={handleConfirmTrip}
                        className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.99]"
                        style={{
                            background: accentColor,
                            color: '#0e1116',
                            boxShadow: `0 18px 40px -10px rgba(${rgbAccent}, 0.55)`,
                        }}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm this trip on WhatsApp
                    </button>
                </div>
            )}

            {/* Floating Dock Navigation */}
            <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 sm:gap-2 pointer-events-auto max-w-full overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`p-3 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                            activeTab === 'overview'
                                ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/5'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                    >
                        <TabIcon type="overview" color={activeTab === 'overview' ? accentColor : 'currentColor'} />
                        <span
                            className={`text-sm font-bold whitespace-nowrap ${
                                activeTab === 'overview' ? 'block' : 'hidden sm:block'
                            }`}
                        >
                            Overview
                        </span>
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <div className="flex gap-1 overflow-x-auto max-w-[50vw] sm:max-w-none no-scrollbar">
                        {data.days.map((day) => (
                            <button
                                key={day.day}
                                onClick={() => setActiveTab(day.day)}
                                className={`w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                                    activeTab === day.day
                                        ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/5'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                            >
                                <span className="text-xs sm:text-sm font-bold">D{day.day}</span>
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`p-3 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                            activeTab === 'notes'
                                ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/5'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                    >
                        <TabIcon type="notes" color={activeTab === 'notes' ? accentColor : 'currentColor'} />
                        <span
                            className={`text-sm font-bold whitespace-nowrap ${
                                activeTab === 'notes' ? 'block' : 'hidden sm:block'
                            }`}
                        >
                            Info
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Renders either the agency logo (if uploaded) or a colored letter circle.
 * Used in both the header and the "Message from" block on the overview.
 */
function AgencyAvatar({
    logo,
    accentColor,
    businessName,
    agentName,
    size,
}: {
    logo?: string;
    accentColor: string;
    businessName?: string;
    agentName?: string;
    size: number;
}) {
    const initial = (agentName?.[0] || businessName?.[0] || 'A').toUpperCase();
    if (logo) {
        return (
            <img
                src={logo}
                alt={businessName || 'Agency logo'}
                className="rounded-lg object-cover bg-white"
                style={{ width: size, height: size }}
            />
        );
    }
    return (
        <div
            className="rounded-lg flex items-center justify-center font-bold text-black shadow-lg"
            style={{
                width: size,
                height: size,
                fontSize: Math.max(11, Math.floor(size * 0.4)),
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            }}
        >
            {initial}
        </div>
    );
}
