import { motion } from 'framer-motion';
import { MapPin, TrendingUp } from 'lucide-react';

interface Destination {
    id: number;
    name: string;
    bookings: number;
    growth: string;
    color: string;
}

const destinations: Destination[] = [
    { id: 1, name: 'Gangtok', bookings: 45, growth: '+15%', color: 'from-blue-500 to-cyan-500' },
    { id: 2, name: 'Pelling', bookings: 32, growth: '+22%', color: 'from-purple-500 to-pink-500' },
    { id: 3, name: 'Lachung', bookings: 28, growth: '+8%', color: 'from-emerald-500 to-teal-500' },
    { id: 4, name: 'Yuksom', bookings: 21, growth: '+12%', color: 'from-orange-500 to-amber-500' },
    { id: 5, name: 'Ravangla', bookings: 18, growth: '+18%', color: 'from-indigo-500 to-blue-500' },
];

export const PopularDestinations = () => {
    const maxBookings = Math.max(...destinations.map(d => d.bookings));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="glass-card rounded-2xl p-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-ai-accent/10 border border-ai-accent/20">
                    <MapPin className="w-5 h-5 text-ai-accent" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Top Destinations</h2>
                    <p className="text-sm text-ai-muted">Most booked locations</p>
                </div>
            </div>

            <div className="space-y-4">
                {destinations.map((destination, index) => {
                    const widthPercent = (destination.bookings / maxBookings) * 100;

                    return (
                        <motion.div
                            key={destination.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                            className="group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${destination.color}`}></div>
                                    <span className="text-white font-medium text-sm">{destination.name}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {destination.growth}
                                    </span>
                                    <span className="text-white font-semibold text-sm">{destination.bookings}</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${widthPercent}%` }}
                                    transition={{ duration: 1, delay: 0.9 + index * 0.1, ease: 'easeOut' }}
                                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${destination.color} rounded-full group-hover:shadow-lg group-hover:shadow-ai-accent/20 transition-shadow`}
                                >
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* View all link */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
                className="w-full mt-6 py-2 text-sm text-ai-accent hover:text-ai-accent/80 font-medium transition-colors"
            >
                View All Destinations →
            </motion.button>
        </motion.div>
    );
};
