
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCheck } from 'lucide-react';
import { LocalInsights } from '../components/LocalInsights';
import { useAuth } from '../contexts/AuthContext';
import { HiddenGemsLeadMagnet } from '../components/HiddenGemsLeadMagnet';
import { decodeItineraryFromUrl } from '../utils/sharing';
import { ClientItineraryView } from '../components/ClientItineraryView';
import { PrayerFlags, Ridgeline } from '../components/decor/HimalayanDecor';
import { SampleTripCard } from '../components/landing/SampleTripCard';
import { AgentOsSection } from '../components/landing/AgentOsSection';
import { optimizedSrc } from '../data/optimizedImages';


const STEPS = [
    { title: 'Say what you want', body: 'How many days, who is coming, roughly when. One line is enough.' },
    { title: 'Get a day-by-day plan', body: 'Stops with times, where you sleep each night, drive times, and the permits you need.' },
    { title: 'Make it yours', body: 'Ask for changes in plain words, share a link with your group, or download the PDF.' },
];

// The request shown above the sample itinerary card.
const SAMPLE_PROMPT = '4 days in North Sikkim with my parents in April, nothing too strenuous';

function HowItWorks() {
    return (
        <section className="relative overflow-hidden pt-36 pb-40 md:pt-40 md:pb-48">
            {/* Kanchenjunga from Singhik (Mangan), on the way to the example trip */}
            <div className="absolute inset-0 z-0" aria-hidden="true">
                <img
                    src={optimizedSrc('/singhik-viewpoint-mangan-sikkim-1-attr-hero.jpeg')}
                    loading="lazy"
                    decoding="async"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-[60%_30%]"
                />
                {/* Dark on the text side, opening up towards the peaks */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, #0e1116 0%, rgba(14,17,22,0.88) 34%, rgba(14,17,22,0.35) 62%, rgba(14,17,22,0.15) 100%)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #0e1116 0%, rgba(14,17,22,0.2) 20%, rgba(14,17,22,0) 45%, rgba(14,17,22,0.35) 100%)' }} />
                {/* Phones stack text over the snowy middle of the photo — darken it a little more */}
                <div className="absolute inset-0 lg:hidden bg-[rgba(14,17,22,0.45)]" />
            </div>
            <PrayerFlags className="absolute top-0 inset-x-0 w-full h-28 md:h-36 z-10 opacity-80" />
            <Ridgeline className="absolute bottom-0 inset-x-0 w-full h-16 md:h-24 z-10" />

            <div className="relative z-20 container mx-auto px-4 max-w-6xl grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
                {/* Copy + steps */}
                <div>
                    <h2 className="text-3xl md:text-[2.75rem] font-bold text-white leading-[1.1] mb-4">
                        Type one sentence.<br />Get the whole trip.
                    </h2>
                    <p className="text-white/55 leading-relaxed mb-10 max-w-md">
                        No forms to fill in. Write the trip the way you would text a friend, and Himato works out the rest.
                    </p>

                    <ol className="space-y-6">
                        {STEPS.map((s, i) => (
                            <li key={s.title} className="flex gap-4">
                                <span className="shrink-0 w-7 h-7 rounded-full bg-white/10 text-white text-sm font-semibold flex items-center justify-center">{i + 1}</span>
                                <div>
                                    <h3 className="font-semibold text-white">{s.title}</h3>
                                    <p className="text-white/55 text-[15px] leading-relaxed mt-0.5">{s.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Live-looking example: the request, then the plan it produces */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3 min-w-0"
                >
                    {/* The traveller's request, as a sent chat message */}
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                        style={{ transformOrigin: 'bottom right' }}
                        className="relative ml-auto mr-2 max-w-md rounded-2xl rounded-br-[4px] bg-ai-accent text-white px-4 pt-2.5 pb-2 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]"
                    >
                        <p className="leading-relaxed">{SAMPLE_PROMPT}</p>
                        <p className="flex items-center justify-end gap-1 mt-0.5 text-[11px] text-white/60">
                            09:41
                            <CheckCheck className="w-3.5 h-3.5 text-[#9fd3ff]" aria-label="Read" />
                        </p>
                        {/* Bubble tail */}
                        <svg className="absolute -right-2 bottom-0 w-3 h-3 text-ai-accent" viewBox="0 0 12 12" aria-hidden="true">
                            <path d="M0 0 C0 6 4 10 12 12 L0 12 Z" fill="currentColor" />
                        </svg>
                    </motion.div>

                    <SampleTripCard />
                </motion.div>
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
                    A complete, permit-aware itinerary in 60 seconds. Free.
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
                        src={optimizedSrc('/1.png')}
                        alt="Sikkim Landscape"
                        fetchPriority="high"
                        decoding="async"
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
                            AI-built itineraries with permits, hidden valleys, and the spots blogs miss. Free.
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
                            <span className="text-white font-semibold" >Free</span>
                            <span className="text-white/25">•</span>
                            <span>Permits info included</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            <HowItWorks />
            <AgentOsSection />

            <div id="insights">
                <LocalInsights />
            </div>

            <ClosingCTA />

            {/* Floating lead-magnet pill (cold-traffic email capture) */}
            <HiddenGemsLeadMagnet />
        </div>
    );
}
