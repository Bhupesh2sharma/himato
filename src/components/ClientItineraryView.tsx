import { motion } from 'framer-motion';
import { Clock, MapPin, Globe, Phone, Mail, MessageCircle, User } from 'lucide-react';

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

export const ClientItineraryView = ({ data }: ClientItineraryViewProps) => {
    if (!data) return null;

    const hasAgentBranding = data.businessName || data.agentName;
    const accentColor = data.brandColor || '#22C55E'; // Default Green (matches tailwind config)

    return (
        <div className="w-full min-h-screen bg-ai-dark text-white selection:bg-ai-accent/30 relative">

            {/* AGENT BRANDING HEADER - Floating/Sticky */}
            {hasAgentBranding && (
                <div className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-md">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Simple Avatar/Logo Placeholder */}
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${accentColor}, #000)` }}
                            >
                                {data.businessName ? data.businessName[0] : (data.agentName ? data.agentName[0] : 'A')}
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white">
                                {data.businessName || data.agentName}
                            </span>
                        </div>
                        {data.contactNumber && (
                            <a
                                href={`https://wa.me/${data.contactNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors"
                                style={{ color: accentColor }}
                            >
                                <Phone className="w-4 h-4" />
                                <span className="hidden sm:inline">Call Me</span>
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Main Hero Header */}
            <div className={`relative py-16 px-6 sm:px-12 overflow-hidden border-b border-white/10 ${hasAgentBranding ? 'pt-8' : ''}`}>
                <div
                    className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none transition-colors duration-500"
                    style={{ backgroundColor: accentColor, opacity: 0.15 }}
                />
                <div className="relative z-10 max-w-5xl mx-auto text-center">

                    {/* Agent Introduction Badge */}
                    {hasAgentBranding && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                        >
                            {data.agentName && <User className="w-4 h-4" style={{ color: accentColor }} />}
                            <span className="text-ai-muted text-sm">
                                Curated by <span className="text-white font-semibold">{data.agentName || "Your Travel Expert"}</span>
                            </span>
                        </motion.div>
                    )}

                    {!hasAgentBranding && data.businessName && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 inline-block"
                        >
                            <span
                                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 font-bold tracking-wide uppercase text-sm backdrop-blur-sm"
                                style={{ color: accentColor }}
                            >
                                {data.businessName}
                            </span>
                        </motion.div>
                    )}

                    {/* PERSONAL WELCOME NOTE */}
                    {data.welcomeNote && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-10 max-w-2xl mx-auto relative group"
                        >
                            <div className="absolute inset-0 bg-white/5 rounded-2xl -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
                            <div className="relative bg-ai-card border border-white/10 p-6 rounded-2xl text-left flex gap-4 shadow-xl">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5" style={{ color: accentColor }} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Note from Agent</p>
                                    <p className="text-white italic leading-relaxed">"{data.welcomeNote}"</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <h1 className="text-4xl sm:text-6xl font-bold mb-4 tracking-tight">
                        Your <span style={{ color: accentColor }}>Sikkim</span> Itinerary
                    </h1>
                    <p className="text-ai-muted text-lg sm:text-xl max-w-2xl mx-auto">
                        A personalized journey designed just for you.
                    </p>

                    {/* Pricing Card */}
                    {data.pricing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-12 max-w-2xl mx-auto glass p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
                            style={{ borderColor: `${accentColor}33` }}
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
                                <div className="text-center">
                                    <p className="text-ai-muted text-sm uppercase tracking-wider mb-1">Total Package Price</p>
                                    <p className="text-3xl sm:text-4xl font-bold text-white">{data.pricing.total}</p>
                                </div>
                                {data.pricing.perGuest && (
                                    <div className="text-center sm:border-l border-white/10 sm:pl-16">
                                        <p className="text-ai-muted text-sm uppercase tracking-wider mb-1">Price Per Guest</p>
                                        <p
                                            className="text-2xl sm:text-3xl font-bold"
                                            style={{ color: accentColor }}
                                        >
                                            {data.pricing.perGuest}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Itinerary Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
                {data.days.map((day, index) => (
                    <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-4 sm:pl-8 border-l-2 border-ai-muted/20"
                    >
                        {/* Timeline Dot */}
                        <div
                            className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-ai-dark"
                            style={{ backgroundColor: accentColor }}
                        />

                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                <span style={{ color: accentColor }}>Day {day.day}:</span> {day.title}
                            </h2>
                        </div>

                        <div className="grid gap-6">
                            {day.activities.map((activity, i) => (
                                <div key={i} className="glass p-6 rounded-2xl hover:bg-ai-card/60 transition-colors border border-white/5 hover:border-white/20">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                                        <h3 className="text-xl font-bold text-white">{activity.title}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-ai-muted">
                                            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                                <Clock className="w-4 h-4" style={{ color: accentColor }} /> {activity.time}
                                            </span>
                                            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                                <MapPin className="w-4 h-4" style={{ color: accentColor }} /> {activity.location}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 leading-relaxed">{activity.description}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {/* Notes Section */}
                {data.notes && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="glass p-8 rounded-2xl border border-white/10 mt-12"
                    >
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 rounded-full" style={{ backgroundColor: accentColor }}></span>
                            Important Notes & Terms
                        </h3>
                        <p className="text-gray-400 whitespace-pre-line leading-relaxed">
                            {data.notes}
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Himato Branding / Footer */}
            <div className="border-t border-white/10 bg-ai-card/30 py-16 px-6 sm:px-12 text-center mt-12">
                <div className="max-w-2xl mx-auto">
                    {hasAgentBranding ? (
                        <>
                            <h3 className="text-2xl font-bold text-white mb-4">Ready to start this journey?</h3>
                            <p className="text-ai-muted mb-8">Contact dedicated travel expert below to finalize your booking.</p>

                            {data.contactNumber && (
                                <a
                                    href={`https://wa.me/${data.contactNumber}`}
                                    className="inline-flex items-center gap-2 text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-lg mb-12"
                                    style={{ backgroundColor: '#25D366', boxShadow: '0 0 20px rgba(37, 211, 102, 0.3)' }}
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Chat on WhatsApp
                                </a>
                            )}

                            <div className="text-ai-muted text-sm space-y-2 border-t border-white/5 pt-8">
                                <p>Powered by <span className="font-semibold" style={{ color: accentColor }}>Himato</span></p>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-2xl font-bold text-white mb-4">Planned with <span className="text-ai-accent">Himato</span></h3>
                            <p className="text-ai-muted mb-8">
                                Experience seamless travel planning with Himato. We turn your dream destinations into perfectly organized journeys.
                            </p>

                            <div className="flex flex-wrap justify-center gap-6 text-gray-400 mb-8">
                                <div className="flex items-center gap-2 hover:text-ai-accent transition-colors cursor-pointer">
                                    <Globe className="w-5 h-5" />
                                    <span>www.himato.in</span>
                                </div>
                                <div className="flex items-center gap-2 hover:text-ai-accent transition-colors cursor-pointer">
                                    <Phone className="w-5 h-5" />
                                    <span>+91 9733814168</span>
                                </div>
                                <div className="flex items-center gap-2 hover:text-ai-accent transition-colors cursor-pointer">
                                    <Mail className="w-5 h-5" />
                                    <span>hello@himato.in</span>
                                </div>
                            </div>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-ai-accent hover:bg-ai-secondary text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-ai-accent/20 mb-12"
                            >
                                Plan Your Next Trip
                            </button>
                            <div className="text-ai-muted text-sm space-y-2 border-t border-white/5 pt-8">
                                <p>© {new Date().getFullYear()} Waglogy. All rights reserved.</p>
                                <p className="opacity-75">Himato by Waglogy</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* FLOATING CTA for Agent */}
            {hasAgentBranding && data.contactNumber && (
                <motion.a
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    href={`https://wa.me/${data.contactNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl shadow-[#25D366]/30 flex items-center gap-0 overflow-hidden group hover:px-6 transition-all duration-300"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="w-0 overflow-hidden group-hover:w-auto group-hover:ml-2 whitespace-nowrap transition-all duration-300 font-bold">
                        Chat with {data.agentName ? data.agentName.split(' ')[0] : 'Agent'}
                    </span>
                </motion.a>
            )}

        </div>
    );
};
