import { motion } from 'framer-motion';
import { Clock, MapPin, Globe, Phone, Mail } from 'lucide-react';

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
        pricing?: {
            total: string;
            perGuest?: string;
        };
        notes?: string;
    } | null;
}

export const ClientItineraryView = ({ data }: ClientItineraryViewProps) => {
    if (!data) return null;

    return (
        <div className="w-full min-h-screen bg-ai-dark text-white selection:bg-ai-accent/30">
            {/* Header Section */}
            <div className="relative py-16 px-6 sm:px-12 overflow-hidden border-b border-white/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-ai-accent/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    {data.businessName && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 inline-block"
                        >
                            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-ai-accent font-bold tracking-wide uppercase text-sm backdrop-blur-sm">
                                {data.businessName}
                            </span>
                        </motion.div>
                    )}
                    <h1 className="text-4xl sm:text-6xl font-bold mb-4 tracking-tight">
                        Your <span className="text-ai-accent">Sikkim</span> Itinerary
                    </h1>
                    <p className="text-ai-muted text-lg sm:text-xl max-w-2xl mx-auto">
                        A personalized journey curated exclusively for you.
                    </p>

                    {/* Pricing Card */}
                    {data.pricing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-12 max-w-2xl mx-auto glass p-6 rounded-2xl border border-ai-accent/20"
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
                                <div className="text-center">
                                    <p className="text-ai-muted text-sm uppercase tracking-wider mb-1">Total Package Price</p>
                                    <p className="text-3xl sm:text-4xl font-bold text-white">{data.pricing.total}</p>
                                </div>
                                {data.pricing.perGuest && (
                                    <div className="text-center sm:border-l border-white/10 sm:pl-16">
                                        <p className="text-ai-muted text-sm uppercase tracking-wider mb-1">Price Per Guest</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-ai-accent">{data.pricing.perGuest}</p>
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
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-ai-secondary border-4 border-ai-dark" />

                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                <span className="text-ai-accent">Day {day.day}:</span> {day.title}
                            </h2>
                        </div>

                        <div className="grid gap-6">
                            {day.activities.map((activity, i) => (
                                <div key={i} className="glass p-6 rounded-2xl hover:bg-ai-card/60 transition-colors border border-white/5 hover:border-ai-accent/20">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                                        <h3 className="text-xl font-bold text-white">{activity.title}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-ai-muted">
                                            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                                <Clock className="w-4 h-4 text-ai-accent" /> {activity.time}
                                            </span>
                                            <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                                <MapPin className="w-4 h-4 text-ai-accent" /> {activity.location}
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
                            <span className="w-1 h-6 bg-ai-accent rounded-full"></span>
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
                </div>
            </div>
        </div>
    );
};
