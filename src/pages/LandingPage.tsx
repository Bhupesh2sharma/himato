
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, PenLine, Wand2, Compass, ShieldCheck, Gem, Leaf,
    Briefcase, Gift, MessageCircle,
} from 'lucide-react';
import { LocalInsights } from '../components/LocalInsights';
import { useAuth } from '../contexts/AuthContext';
import { HiddenGemsLeadMagnet } from '../components/HiddenGemsLeadMagnet';
import { decodeItineraryFromUrl } from '../utils/sharing';
import { ClientItineraryView } from '../components/ClientItineraryView';
import { getSeasonalPicks } from '../data/seasonalPlaces';

const GOLD = '#c9a961';

const STEPS = [
    { icon: PenLine, title: 'Describe your trip', body: 'Tell Himato your vibe in one sentence — days, pace, and who’s coming along.' },
    { icon: Wand2, title: 'AI builds your plan', body: 'Get a day-by-day itinerary with permits, routes, and hidden valleys — in seconds.' },
    { icon: Compass, title: 'Go explore', body: 'Tweak it, share it, or grab a PDF. No signup needed to start.' },
];

// Hero cell of the bento — grounded in a real Sikkim photo.
const FEATURE_HERO = {
    icon: Leaf,
    image: '/yumgthang.jpeg',
    title: 'Season-smart planning',
    body: "Himato only suggests places worth visiting when you're actually going — rhododendrons in spring, clear peaks in autumn, and the passes that shut in deep winter.",
};

const FEATURES = [
    { icon: ShieldCheck, title: 'Permits sorted', body: 'Restricted-area permits flagged and explained for North Sikkim and the passes.' },
    { icon: Gem, title: 'Hidden valleys', body: 'The monasteries, lakes, and villages the travel blogs always miss.' },
    { icon: Briefcase, title: 'Travel-agent mode', body: 'Agents build branded, client-ready itineraries in a fraction of the time.' },
    { icon: MessageCircle, title: 'AI guide, always on', body: 'Answers questions and refines your plan as you chat.' },
    { icon: Gift, title: 'Free, no signup', body: 'Full itineraries instantly. Sign up only to save them.' },
];

function HowItWorks() {
    return (
        <section className="relative py-28 border-t border-white/5">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Editorial, left-aligned intro */}
                <div className="max-w-2xl mb-16">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: GOLD }}>How it works</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white leading-[1.1]">
                        From one sentence to a<br className="hidden md:block" /> full-blown itinerary.
                    </h2>
                </div>

                {/* Connected step flow */}
                <div className="relative grid md:grid-cols-3 gap-12 md:gap-8">
                    <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    {STEPS.map((s, i) => (
                        <motion.div
                            key={s.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12 }}
                            className="relative"
                        >
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-2xl border border-white/15 flex items-center justify-center relative z-10" style={{ background: '#0e1116' }}>
                                    <s.icon className="w-6 h-6 text-ai-accent" />
                                </div>
                                <span className="text-sm font-semibold tracking-[0.25em]" style={{ color: GOLD }}>0{i + 1}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                            <p className="text-white/55 leading-relaxed max-w-xs">{s.body}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Features() {
    const navigate = useNavigate();
    const HeroIcon = FEATURE_HERO.icon;
    return (
        <section className="relative py-28 bg-white/[0.02] border-t border-white/5">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Left-aligned editorial header */}
                <div className="max-w-2xl mb-12">
                    <p className="text-sm font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: GOLD }}>Why Himato</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
                        Built for real Sikkim trips
                    </h2>
                    <p className="text-white/55 leading-relaxed max-w-lg">
                        Not a generic trip generator — Himato knows Sikkim's permits, its seasons,
                        and the mountain roads that actually close.
                    </p>
                </div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:auto-rows-[196px]">
                    {/* Photo hero cell (2×2) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        onClick={() => navigate('/chat')}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 cursor-pointer sm:col-span-2 lg:row-span-2 min-h-[320px] lg:min-h-0"
                    >
                        <img
                            src={FEATURE_HERO.image}
                            alt={FEATURE_HERO.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,17,22,0.94) 0%, rgba(14,17,22,0.45) 55%, rgba(14,17,22,0.15) 100%)' }} />
                        <div className="relative h-full flex flex-col justify-end p-7 md:p-8">
                            <div className="w-12 h-12 rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4">
                                <HeroIcon className="w-6 h-6" style={{ color: GOLD }} />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2.5">{FEATURE_HERO.title}</h3>
                            <p className="text-white/70 max-w-md leading-relaxed mb-4">{FEATURE_HERO.body}</p>
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" style={{ color: GOLD }}>
                                Plan by season <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </motion.div>

                    {/* Small feature cells */}
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (i % 3) * 0.06 }}
                            className="rounded-2xl p-6 bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-colors flex flex-col justify-center"
                        >
                            <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <f.icon className="w-5 h-5" style={{ color: GOLD }} />
                            </div>
                            <h3 className="font-bold text-white mb-1">{f.title}</h3>
                            <p className="text-sm text-white/50 leading-relaxed">{f.body}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SeasonTeaser() {
    const navigate = useNavigate();
    const { season, picks } = getSeasonalPicks();
    const top = picks.slice(0, 5);
    const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

    return (
        <section className="relative py-28 border-t border-white/5">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
                    {/* Left: the season pitch */}
                    <div className="lg:sticky lg:top-28">
                        <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: GOLD }}>
                            <span className="text-base">{season.emoji}</span> In season · {monthName}
                        </p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
                            Great to visit<br />right now
                        </h2>
                        <p className="text-white/55 leading-relaxed mb-8 max-w-sm">
                            Himato reads the calendar so you don't have to — {season.tagline}. These
                            are the spots that pay off this month, with the risky and snowed-in ones held back.
                        </p>
                        <button
                            onClick={() => navigate('/chat')}
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-ai-accent hover:bg-ai-secondary text-white font-semibold transition-colors"
                        >
                            Plan a {monthName} trip <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right: ranked in-season list with the reason for each */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/10 overflow-hidden">
                        {top.map((p, i) => (
                            <motion.button
                                key={p.name}
                                initial={{ opacity: 0, x: 12 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06 }}
                                onClick={() => navigate('/chat')}
                                className="group w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.04] transition-colors"
                            >
                                <span className="shrink-0 w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-sm font-semibold" style={{ color: GOLD }}>
                                    0{i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white">{p.name}</h3>
                                    <p className="text-sm text-white/45 truncate">{p.note}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ClosingCTA() {
    const navigate = useNavigate();
    return (
        <section className="relative py-28 overflow-hidden border-t border-white/5">
            <div className="absolute inset-0 bg-cover bg-center opacity-[0.06]" style={{ backgroundImage: 'url(/topo.svg)' }} />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full bg-ai-accent/10 blur-[150px]" />
            <div className="container mx-auto px-4 relative text-center max-w-3xl">
                <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-5 tracking-tight">
                    Ready to plan your <span className="text-shimmer">Sikkim</span> trip?
                </h2>
                <p className="text-lg text-white/60 mb-10">
                    A complete, permit-aware itinerary in 60 seconds. Free, and no signup to start.
                </p>
                <button
                    onClick={() => navigate('/chat')}
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:scale-105"
                    style={{ background: '#f6f1e7', color: '#0e1116', boxShadow: '0 12px 30px -8px rgba(0,0,0,0.5)' }}
                >
                    Start planning free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </section>
    );
}

export function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Backwards-compat: legacy share URLs land at /?plan=... — render the
    // dedicated client view instead of the marketing hero so the experience
    // is identical to the new slug-based shares.
    const sharedPlan = decodeItineraryFromUrl();
    if (sharedPlan) {
        return <ClientItineraryView data={sharedPlan} />;
    }

    return (
        <div className="min-h-screen text-white selection:bg-ai-accent/30 overflow-x-hidden" style={{ background: '#0e1116' }}>
            {/* Marketing Hero */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/1.png"
                        alt="Sikkim Landscape"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(14,17,22,0.6) 0%, rgba(14,17,22,0.3) 40%, rgba(14,17,22,0.75) 100%)' }} />
                </div>

                <div className="container mx-auto px-4 z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-[0.95] mb-6">
                            PLAN <span className="text-shimmer">SIKKIM</span><br />
                            IN 60 SECONDS
                        </h1>

                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                            AI-built itineraries with permits, hidden valleys, and the spots blogs miss. Free, no signup.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/chat')}
                                className="group relative px-8 py-4 font-bold rounded-xl transition-all hover:scale-105 w-full sm:w-auto overflow-hidden"
                                style={{ background: '#f6f1e7', color: '#0e1116', boxShadow: '0 12px 30px -8px rgba(0,0,0,0.5)' }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {isAuthenticated ? 'Start Planning' : 'Start Planning Free'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>

                            <button
                                onClick={() => navigate('/hidden-gems')}
                                className="px-8 py-4 text-white font-bold rounded-xl transition-all w-full sm:w-auto"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)' }}
                            >
                                Explore Hidden Gems
                            </button>
                        </div>

                        {/* Credibility strip */}
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/55">
                            <span><strong className="text-white font-semibold">37</strong> destinations</span>
                            <span className="text-white/25">•</span>
                            <span><strong className="text-white font-semibold">60-second</strong> plans</span>
                            <span className="text-white/25">•</span>
                            <span>Free, no signup</span>
                            <span className="text-white/25">•</span>
                            <span>Permits included</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            <HowItWorks />
            <Features />
            <SeasonTeaser />

            <div id="insights">
                <LocalInsights />
            </div>

            <ClosingCTA />

            {/* Floating lead-magnet pill (cold-traffic email capture) */}
            <HiddenGemsLeadMagnet />
        </div>
    );
}
