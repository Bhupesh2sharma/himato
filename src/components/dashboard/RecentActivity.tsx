import { motion } from 'framer-motion';
import { Activity, UserPlus, FileText, DollarSign, Package, Clock } from 'lucide-react';

interface ActivityItem {
    id: string | number;
    type: 'booking' | 'client' | 'itinerary' | 'share' | 'payment';
    title: string;
    description: string;
    time: string;
}

const getIconConfig = (type: string) => {
    switch (type) {
        case 'booking': return { icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
        case 'payment': return { icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
        case 'client': return { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
        case 'itinerary': return { icon: Package, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' };
        default: return { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
    }
};

const formatTimeShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
};

interface RecentActivityProps {
    activities?: ActivityItem[];
}

export const RecentActivity = ({ activities = [] }: RecentActivityProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="glass-card rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-ai-accent/10 border border-ai-accent/20">
                        <Activity className="w-5 h-5 text-ai-accent" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                        <p className="text-sm text-ai-muted">Latest updates</p>
                    </div>
                </div>

                <button className="text-sm text-ai-accent hover:text-ai-accent/80 font-medium transition-colors">
                    View All
                </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {activities.map((activity, index) => {
                    const config = getIconConfig(activity.type);
                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 1.0 + index * 0.08 }}
                            className="flex items-start gap-4 group hover:bg-ai-card/30 p-3 -mx-3 rounded-xl transition-colors duration-300 cursor-pointer"
                        >
                            {/* Icon */}
                            <div className={`flex-shrink-0 p-2.5 rounded-xl border ${config.bg} group-hover:scale-110 transition-transform duration-300`}>
                                <config.icon className={`w-5 h-5 ${config.color}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium text-sm mb-0.5 group-hover:text-ai-accent transition-colors">
                                    {activity.title}
                                </h3>
                                <p className="text-ai-muted text-sm truncate">
                                    {activity.description}
                                </p>
                            </div>

                            {/* Time */}
                            <div className="flex-shrink-0 flex items-center gap-1 text-xs text-ai-muted">
                                <Clock className="w-3 h-3" />
                                {formatTimeShort(activity.time)}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Activity indicator */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-ai-muted">Live Activity Feed</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
