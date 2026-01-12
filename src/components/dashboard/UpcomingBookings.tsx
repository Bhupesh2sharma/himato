import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

interface Booking {
    id: string;
    clientName: string;
    destination: string;
    date: string;
    guests: number;
    status: 'confirmed' | 'pending' | 'processing';
}

interface UpcomingBookingsProps {
    data?: Booking[];
}

const formatDateReadable = (dateStr: string) => {
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
};

export const UpcomingBookings = ({ data = [] }: UpcomingBookingsProps) => {
    const displayBookings = data.length > 0 ? data.slice(0, 4) : [];

    if (data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="glass-card rounded-2xl p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 rounded-lg bg-ai-accent/10 border border-ai-accent/20">
                        <Calendar className="w-5 h-5 text-ai-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Upcoming Bookings</h2>
                </div>
                <p className="text-ai-muted text-center py-8">No upcoming bookings. Add one using the button above!</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="glass-card rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-ai-accent/10 border border-ai-accent/20">
                        <Calendar className="w-5 h-5 text-ai-accent" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Upcoming Bookings</h2>
                        <p className="text-sm text-ai-muted">Next 7 days</p>
                    </div>
                </div>

                <button className="text-sm text-ai-accent hover:text-ai-accent/80 font-medium transition-colors">
                    View All
                </button>
            </div>

            <div className="space-y-3">
                {displayBookings.map((booking, index) => (
                    <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                        className="group p-4 bg-ai-card/30 hover:bg-ai-card/50 border border-white/5 hover:border-white/10 rounded-xl transition-all duration-300 cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-white font-semibold mb-1 group-hover:text-ai-accent transition-colors">
                                    {booking.clientName}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-ai-muted">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{booking.destination}</span>
                                </div>
                            </div>

                            <div className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${booking.status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : booking.status === 'pending'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}>
                                {booking.status}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-ai-muted">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatDateReadable(booking.date)}</span>
                            </div>

                            <div className="flex items-center gap-1 text-ai-muted">
                                <Users className="w-3.5 h-3.5" />
                                <span>{booking.guests} guests</span>
                            </div>
                        </div>

                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-ai-accent/0 via-ai-accent/5 to-ai-accent/0"></div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-1">{data.length}</p>
                    <p className="text-xs text-ai-muted">Total Active</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-1">
                        {data.filter((b: Booking) => b.status === 'confirmed').length}
                    </p>
                    <p className="text-xs text-ai-muted">Confirmed</p>
                </div>
            </div>
        </motion.div>
    );
};
