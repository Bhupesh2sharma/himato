import { motion } from 'framer-motion';
import {
    MapPin,
    MessageCircle,
    Calendar,
    Wallet,
    CheckCircle2,
    Sparkles,
    Share2,
    Quote,
    ShieldCheck,
    ArrowRight,
    Sun,
    Backpack,
    Moon,
    Mountain,
} from 'lucide-react';
import { heroImageForItinerary } from '../utils/locationImages';
import { ClientProposalActions } from './ClientProposalActions';

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
    overnightStay?: string;
    altitude?: string;
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
            includes?: string; // free-text "what's included"
        };
        notes?: string;
        clientName?: string;
        tripSummary?: string;
        bestTime?: string;
        permits?: string[];
        packingList?: string[];
    } | null;
    // When present (a persistent slug-based share), enables the client
    // Accept / Request-changes actions that notify the agent.
    slug?: string;
}

const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '47, 74, 58';
};

/**
 * Client-facing shared itinerary — an editorial, single-scroll "travel
 * proposal" on Himato's light parchment palette. The agent's chosen brand
 * colour is threaded through as the accent.
 */
export const ClientItineraryView = ({ data, slug }: ClientItineraryViewProps) => {
    if (!data) return null;

    const hasAgentBranding = Boolean(data.businessName || data.agentName);
    const accentColor = data.brandColor || '#2f4a3a';
    const rgbAccent = hexToRgb(accentColor);
    const heroImage = data.customHeroImage || heroImageForItinerary(data);
    const agencyLabel = data.businessName || data.agentName || 'Itinerary';

    const includesList: string[] = (data.pricing?.includes ?? '')
        .split(/[,\|\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);

    const hasPricing = Boolean(data.pricing?.total || data.pricing?.perGuest || includesList.length);

    const openWhatsApp = (message: string) => {
        if (!data.contactNumber) return;
        window.open(`https://wa.me/${data.contactNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleConfirmTrip = () =>
        openWhatsApp(
            `Hi ${data.agentName || 'there'}, I'd like to confirm the ${data.days.length}-day Sikkim itinerary you sent me${data.businessName ? ` from ${data.businessName}` : ''}. When can we proceed?`,
        );

    return (
        <div className="relative min-h-screen bg-ai-dark text-ai-text font-sans">
            {/* Background — topographic contour map tinted with the agent's brand colour.
                topo.svg is used as a CSS mask so the lines take the accent colour. */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundColor: accentColor,
                    opacity: 0.07,
                    maskImage: 'url(/topo.svg)',
                    WebkitMaskImage: 'url(/topo.svg)',
                    maskSize: 'cover',
                    WebkitMaskSize: 'cover',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                }}
            />

            {/* ── Header ── */}
            <header className="sticky top-0 z-30 bg-ai-dark/85 backdrop-blur border-b border-black/8">
                <div className="max-w-3xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                        {hasAgentBranding ? (
                            <>
                                <AgencyAvatar
                                    accentColor={accentColor}
                                    logo={data.brandLogo}
                                    businessName={data.businessName}
                                    agentName={data.agentName}
                                    size={30}
                                />
                                <span className="font-bold text-sm text-ai-text truncate">{agencyLabel}</span>
                            </>
                        ) : (
                            <span className="font-bold text-sm text-ai-muted">Itinerary</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href="https://himato.in/chat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/10 hover:border-ai-accent/40 transition-colors text-[11px] font-medium text-ai-muted"
                            title="Plan your own Sikkim trip"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-ai-accent animate-pulse" />
                            Plan yours free at <span className="text-ai-text font-bold">himato.in</span>
                        </a>
                        <button
                            onClick={() =>
                                navigator.share?.({
                                    title: data.businessName ? `${data.businessName} — Sikkim Itinerary` : 'My Sikkim Itinerary',
                                    url: window.location.href,
                                })
                            }
                            className="w-9 h-9 rounded-full bg-white border border-black/10 hover:border-ai-accent/40 flex items-center justify-center transition-colors"
                            aria-label="Share itinerary"
                        >
                            <Share2 className="w-4 h-4 text-ai-text" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 pb-40">
                {/* ── Hero ── */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-6"
                >
                    <div className="relative rounded-[1.75rem] overflow-hidden aspect-[4/3] sm:aspect-[16/9] flex items-end shadow-[0_24px_60px_-24px_rgba(14,17,22,0.4)]">
                        <img
                            src={heroImage}
                            alt="Sikkim"
                            loading="eager"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.4) 50%, rgba(5,5,5,0.05) 100%)' }} />
                        <div className="absolute inset-0 mix-blend-soft-light opacity-40 pointer-events-none" style={{ background: `radial-gradient(circle at 82% 4%, ${accentColor}, transparent 66%)` }} />
                        <div className="relative z-10 w-full p-6 sm:p-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 mb-4">
                                <Sparkles className="w-3 h-3 text-white" />
                                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white">Your Itinerary</span>
                            </div>
                            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white leading-[1.05] mb-3">
                                {data.days.length}-Day Sikkim Journey
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-white/85">
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{data.days.length} days</span>
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />Sikkim, India</span>
                                {data.pricing?.total && <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4" />{data.pricing.total}</span>}
                                {data.businessName && <span className="flex items-center gap-1.5">· by {data.businessName}</span>}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ── Trip summary ── */}
                {data.tripSummary && (
                    <p className="mt-6 text-base sm:text-lg text-ai-text/80 leading-relaxed font-serif italic">
                        {data.tripSummary}
                    </p>
                )}

                {/* ── Welcome note ── */}
                {data.welcomeNote && (
                    <section className="mt-8">
                        <div className="relative bg-ai-card rounded-3xl p-6 sm:p-8 border border-black/8 overflow-hidden">
                            <Quote className="absolute -top-2 -right-2 w-28 h-28 opacity-[0.05]" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <AgencyAvatar accentColor={accentColor} logo={data.brandLogo} businessName={data.businessName} agentName={data.agentName} size={40} />
                                    <div>
                                        <p className="text-[10px] text-ai-muted uppercase tracking-widest font-bold">Message from</p>
                                        <p className="text-ai-text font-semibold">{data.agentName || data.businessName || 'Your Travel Expert'}</p>
                                    </div>
                                </div>
                                <p className="font-serif text-xl sm:text-2xl italic text-ai-text/80 leading-relaxed">“{data.welcomeNote}”</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Pricing & inclusions ── */}
                {hasPricing && (
                    <section className="mt-6">
                        <div className="bg-ai-card rounded-3xl p-6 sm:p-8 border border-black/8">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `rgba(${rgbAccent}, 0.12)`, color: accentColor }}>
                                    <Wallet className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-ai-muted">Pricing &amp; Inclusions</p>
                            </div>
                            {(data.pricing?.total || data.pricing?.perGuest) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                    {data.pricing?.total && (
                                        <div className="rounded-2xl p-5 bg-ai-dark border border-black/8">
                                            <p className="text-[10px] tracking-wider uppercase text-ai-muted mb-1">Total</p>
                                            <p className="text-2xl font-bold text-ai-text">{data.pricing.total}</p>
                                        </div>
                                    )}
                                    {data.pricing?.perGuest && (
                                        <div className="rounded-2xl p-5 bg-ai-dark border border-black/8">
                                            <p className="text-[10px] tracking-wider uppercase text-ai-muted mb-1">Per guest</p>
                                            <p className="text-2xl font-bold text-ai-text">{data.pricing.perGuest}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {includesList.length > 0 && (
                                <>
                                    <p className="text-[10px] tracking-wider uppercase text-ai-muted mb-2">Includes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {includesList.map((item) => (
                                            <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                                                style={{ background: `rgba(${rgbAccent}, 0.08)`, borderColor: `rgba(${rgbAccent}, 0.28)`, color: accentColor }}>
                                                <CheckCircle2 className="w-3 h-3" />
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                )}

                {/* ── Trip essentials: best time, permits, packing ── */}
                {(data.bestTime || (data.permits && data.permits.length > 0) || (data.packingList && data.packingList.length > 0)) && (
                    <section className="mt-8 space-y-4">
                        {data.bestTime && (
                            <div className="bg-ai-card rounded-2xl border border-black/8 p-5 flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-none" style={{ background: `rgba(${rgbAccent},0.12)`, color: accentColor }}>
                                    <Sun className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-ai-muted mb-0.5">Best time to visit</p>
                                    <p className="text-sm text-ai-text leading-relaxed">{data.bestTime}</p>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {data.permits && data.permits.length > 0 && (
                                <div className="bg-ai-card rounded-2xl border p-5" style={{ borderColor: `rgba(${rgbAccent},0.3)` }}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShieldCheck className="w-4 h-4" style={{ color: accentColor }} />
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-ai-muted">Permits you'll need</p>
                                    </div>
                                    <ul className="space-y-2">
                                        {data.permits.map((p, i) => (
                                            <li key={i} className="text-sm text-ai-text leading-snug flex gap-2">
                                                <span style={{ color: accentColor }}>•</span>{p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {data.packingList && data.packingList.length > 0 && (
                                <div className="bg-ai-card rounded-2xl border border-black/8 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Backpack className="w-4 h-4" style={{ color: accentColor }} />
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-ai-muted">What to pack</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.packingList.map((item, i) => (
                                            <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full bg-ai-dark border border-black/8 text-ai-text">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── Day-by-day (stacked) ── */}
                <section className="mt-12 space-y-12">
                    {data.days.map((day) => (
                        <motion.div
                            key={day.day}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Day header */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="font-serif text-4xl sm:text-5xl font-bold text-ai-text leading-none">Day {day.day}</span>
                                <span className="flex-1 h-px" style={{ background: `rgba(${rgbAccent}, 0.25)` }} />
                            </div>
                            {day.title && <h2 className="text-lg text-ai-muted -mt-3 mb-3">{day.title}</h2>}

                            {/* Day meta: overnight stay + altitude */}
                            {(day.overnightStay || day.altitude) && (
                                <div className="flex flex-wrap items-center gap-2 mb-6">
                                    {day.overnightStay && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-ai-card border border-black/8 text-ai-muted">
                                            <Moon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                                            Overnight in {day.overnightStay}
                                        </span>
                                    )}
                                    {day.altitude && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-300/60 text-amber-800">
                                            <Mountain className="w-3.5 h-3.5" />
                                            {day.altitude}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="relative border-l-2 ml-2 sm:ml-3 space-y-4 py-1" style={{ borderColor: `rgba(${rgbAccent}, 0.2)` }}>
                                {day.activities.map((activity, i) => (
                                    <div key={i} className="relative pl-6 sm:pl-8">
                                        <div className="absolute -left-[7px] top-5 w-3 h-3 rounded-full border-2 border-ai-dark" style={{ backgroundColor: accentColor }} />
                                        <div className="bg-ai-card border border-black/8 rounded-2xl p-5 hover:shadow-[0_12px_30px_-16px_rgba(14,17,22,0.35)] transition-shadow">
                                            <div className="flex items-start justify-between gap-3 mb-1.5">
                                                <h3 className="font-bold text-base sm:text-lg text-ai-text leading-snug flex-1">{activity.title}</h3>
                                                <span className="flex-none text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full"
                                                    style={{ background: `rgba(${rgbAccent}, 0.1)`, color: accentColor, border: `1px solid rgba(${rgbAccent}, 0.28)` }}>
                                                    {activity.time}
                                                </span>
                                            </div>
                                            <p className="text-ai-muted text-sm leading-relaxed mb-3">{activity.description}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-ai-muted font-medium">
                                                <MapPin className="w-3 h-3" />
                                                {activity.location}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </section>

                {/* ── Notes / terms ── */}
                {data.notes && (
                    <section className="mt-12">
                        <div className="bg-ai-card rounded-3xl p-6 sm:p-8 border border-black/8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ai-dark border border-black/8 mb-5">
                                <ShieldCheck className="w-3 h-3 text-ai-muted" />
                                <span className="text-[11px] font-bold tracking-wider uppercase text-ai-muted">Important Information</span>
                            </div>
                            <h2 className="font-serif text-2xl font-bold text-ai-text mb-4">Terms &amp; Notes</h2>
                            <p className="whitespace-pre-line text-ai-muted leading-loose text-sm">{data.notes}</p>
                        </div>
                    </section>
                )}

                {/* ── Proposal actions (Accept / Request changes) ── */}
                {slug && (
                    <ClientProposalActions
                        slug={slug}
                        dayCount={data.days.length}
                        accentColor={accentColor}
                        agencyName={data.businessName || data.agentName}
                        defaultClientName={data.clientName}
                    />
                )}

                {/* ── Footer ── */}
                <footer className="mt-16 pt-8 border-t border-black/8 text-center">
                    <p className="text-xs text-ai-muted">
                        Crafted with <a href="https://himato.in" target="_blank" rel="noopener noreferrer" className="font-bold text-ai-accent hover:underline">Himato</a>
                        {data.businessName ? ` · ${data.businessName}` : ''}
                    </p>
                </footer>
            </main>

            {/* ── Sticky Confirm CTA (WhatsApp) ── */}
            {data.contactNumber && (
                <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
                    <button
                        onClick={handleConfirmTrip}
                        className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-white shadow-2xl transition-transform hover:scale-[1.03] active:scale-[0.99]"
                        style={{ background: accentColor, boxShadow: `0 18px 40px -10px rgba(${rgbAccent}, 0.5)` }}
                    >
                        <MessageCircle className="w-4 h-4" />
                        Confirm this trip on WhatsApp
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

/**
 * Renders either the agency logo (if uploaded) or a coloured letter tile.
 */
function AgencyAvatar({ logo, accentColor, businessName, agentName, size }: {
    logo?: string;
    accentColor: string;
    businessName?: string;
    agentName?: string;
    size: number;
}) {
    const initial = (agentName?.[0] || businessName?.[0] || 'A').toUpperCase();
    if (logo) {
        return (
            <img src={logo} alt={businessName || 'Agency logo'} className="rounded-lg object-contain bg-white p-0.5 border border-black/8" style={{ width: size, height: size }} />
        );
    }
    return (
        <div className="rounded-lg flex items-center justify-center font-bold text-white shadow-sm flex-none"
            style={{ width: size, height: size, background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, fontSize: size * 0.42 }}>
            {initial}
        </div>
    );
}
