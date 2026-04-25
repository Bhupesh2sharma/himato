import { motion } from 'framer-motion';
import { MapPin, Star, Shield, ArrowRight, BadgeCheck, Phone } from 'lucide-react';

const AGENTS = [
    {
        id: 1,
        name: "Himalayan Trails Co.",
        tagline: "North Sikkim & High Altitude Expert",
        location: "MG Marg, Gangtok",
        rating: 4.9,
        reviews: 218,
        experience: 12,
        verified: true,
        specialties: ["Adventure", "North Sikkim", "Permits"],
        description: "Specialists in Gurudongmar, Lachen & Zero Point expeditions. We handle all restricted area permits and provide experienced mountain guides.",
        accentColor: "#2f4a3a",
        contact: "tel:+919800000001",
    },
    {
        id: 2,
        name: "Sikkim Sherpa Tours",
        tagline: "Offbeat Routes & Authentic Experiences",
        location: "Tadong, Gangtok",
        rating: 4.8,
        reviews: 143,
        experience: 9,
        verified: true,
        specialties: ["Offbeat", "Trekking", "Zuluk Loop"],
        description: "Born and raised in Sikkim, our local guides take you to places no app can find — hidden monasteries, village homestays, and secret viewpoints.",
        accentColor: "#5a7a2a",
        contact: "tel:+919800000002",
    },
    {
        id: 3,
        name: "Green Valley Travels",
        tagline: "Family Holidays & Honeymoon Packages",
        location: "Pelling, West Sikkim",
        rating: 4.7,
        reviews: 97,
        experience: 7,
        verified: true,
        specialties: ["Family", "Honeymoon", "Budget"],
        description: "Curated family-friendly itineraries covering Pelling, Ravangla & Darap with comfortable stays, child-safe routes and all-inclusive pricing.",
        accentColor: "#c9a961",
        contact: "tel:+919800000003",
    },
    {
        id: 4,
        name: "Summit Seekers India",
        tagline: "Workations & Long-Stay Specialists",
        location: "M.G. Road, Gangtok",
        rating: 4.6,
        reviews: 62,
        experience: 5,
        verified: false,
        specialties: ["Workation", "Long Stay", "Co-working"],
        description: "We set up digital nomads and remote workers with cosy stays, reliable internet spots and month-long curated experiences across Sikkim.",
        accentColor: "#b73f25",
        contact: "tel:+919800000004",
    },
];

const SPECIALTY_COLORS: Record<string, { bg: string; text: string }> = {
    "Adventure":   { bg: "rgba(47,74,58,0.1)",  text: "#2f4a3a" },
    "Offbeat":     { bg: "rgba(90,122,42,0.1)", text: "#5a7a2a" },
    "Trekking":    { bg: "rgba(47,74,58,0.1)",  text: "#2f4a3a" },
    "Family":      { bg: "rgba(201,169,97,0.15)", text: "#8a6e25" },
    "Honeymoon":   { bg: "rgba(183,63,37,0.1)", text: "#b73f25" },
    "Workation":   { bg: "rgba(107,114,128,0.1)", text: "#4b5563" },
    "Budget":      { bg: "rgba(201,169,97,0.15)", text: "#8a6e25" },
    "Long Stay":   { bg: "rgba(107,114,128,0.1)", text: "#4b5563" },
    "Co-working":  { bg: "rgba(107,114,128,0.1)", text: "#4b5563" },
    "North Sikkim":{ bg: "rgba(47,74,58,0.1)",  text: "#2f4a3a" },
    "Permits":     { bg: "rgba(183,63,37,0.1)", text: "#b73f25" },
    "Zuluk Loop":  { bg: "rgba(90,122,42,0.1)", text: "#5a7a2a" },
};

function AgentInitials({ name, color }: { name: string; color: string }) {
    const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('');
    return (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ background: color }}>
            {initials}
        </div>
    );
}

export const BookingOptions = () => {
    return (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-16 mt-8 border-t border-black/8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                <div>
                    <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-ai-muted mb-2">Verified Partners</p>
                    <h2 className="text-3xl sm:text-4xl text-ai-text leading-tight" style={{ fontWeight: 600 }}>
                        Trusted Travel<br />
                        <em className="not-italic" style={{ color: '#2f4a3a' }}>Agents in Sikkim</em>
                    </h2>
                    <p className="text-sm text-ai-muted mt-3 max-w-sm leading-relaxed">
                        Your AI itinerary, brought to life by local experts who know every trail, permit office and hidden teahouse.
                    </p>
                </div>

                <motion.a
                    href="mailto:list@himato.in"
                    whileHover={{ y: -2 }}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-black/15 text-sm font-semibold text-ai-muted hover:border-ai-accent hover:text-ai-accent transition-all"
                >
                    <span className="text-lg leading-none">+</span>
                    List Your Agency
                </motion.a>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {AGENTS.map((agent, i) => (
                    <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="group bg-white rounded-2xl border border-black/8 p-6 hover:shadow-md hover:border-black/15 transition-all duration-300 flex flex-col gap-4"
                    >
                        {/* Top row */}
                        <div className="flex items-start gap-4">
                            <AgentInitials name={agent.name} color={agent.accentColor} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-bold text-ai-text leading-snug">{agent.name}</h3>
                                    {agent.verified && (
                                        <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: '#2f4a3a' }} />
                                    )}
                                </div>
                                <p className="text-xs text-ai-muted mt-0.5">{agent.tagline}</p>

                                <div className="flex items-center gap-3 mt-2">
                                    {/* Rating */}
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 fill-[#c9a961] text-[#c9a961]" />
                                        <span className="text-xs font-bold text-ai-text">{agent.rating}</span>
                                        <span className="text-xs text-ai-muted">({agent.reviews})</span>
                                    </div>
                                    <span className="text-black/15 text-xs">|</span>
                                    {/* Location */}
                                    <div className="flex items-center gap-1 text-ai-muted">
                                        <MapPin className="w-3 h-3" />
                                        <span className="text-xs truncate">{agent.location}</span>
                                    </div>
                                    <span className="text-black/15 text-xs">|</span>
                                    {/* Experience */}
                                    <span className="text-xs text-ai-muted">{agent.experience}y exp.</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-ai-muted leading-relaxed">{agent.description}</p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1.5">
                            {agent.specialties.map(tag => {
                                const style = SPECIALTY_COLORS[tag] ?? { bg: 'rgba(0,0,0,0.06)', text: '#6b7280' };
                                return (
                                    <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full"
                                        style={{ background: style.bg, color: style.text }}>
                                        {tag}
                                    </span>
                                );
                            })}
                        </div>

                        {/* Footer actions */}
                        <div className="flex items-center gap-2 pt-1 border-t border-black/6 mt-auto">
                            <a href={agent.contact}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 text-xs font-semibold text-ai-muted hover:border-ai-accent hover:text-ai-accent transition-all bg-white">
                                <Phone className="w-3.5 h-3.5" />
                                Call
                            </a>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 group-hover:-translate-y-px"
                                style={{ background: agent.accentColor }}>
                                Get a Free Quote
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom CTA Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 rounded-2xl overflow-hidden relative flex flex-col sm:flex-row items-center justify-between gap-6 p-8"
                style={{ background: '#2f4a3a' }}
            >
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(201,169,97,0.2) 0%, transparent 60%)' }} />
                <div className="relative z-10 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                        <Shield className="w-4 h-4 text-[#c9a961]" />
                        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c9a961]">For Travel Businesses</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                        Are you a Sikkim travel agent?
                    </h3>
                    <p className="text-white/60 text-sm mt-1">Get discovered by travellers with a ready-made AI itinerary.</p>
                </div>
                <a href="mailto:list@himato.in"
                    className="relative z-10 shrink-0 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
                    style={{ background: '#f6f1e7', color: '#0e1116', boxShadow: '0 8px 24px -4px rgba(0,0,0,0.35)' }}>
                    Apply to be Listed →
                </a>
            </motion.div>
        </section>
    );
};
