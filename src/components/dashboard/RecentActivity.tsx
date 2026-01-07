import { motion } from 'framer-motion';
import { Activity, UserPlus, FileText, Share2, DollarSign, Package, Clock } from 'lucide-react';

interface ActivityItem {
    id: number;
    type: 'booking' | 'client' | 'content' | 'share' | 'payment' | 'package';
    title: string;
    description: string;
    time: string;
    icon: any;
    iconColor: string;
    iconBg: string;
}

const activities: ActivityItem[] = [
    {
        id: 1,
        type: 'booking',
        title: 'New Booking Confirmed',
        description: 'Rajesh Kumar - Gangtok Package',
        time: '2 min ago',
        icon: FileText,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
        id: 2,
        type: 'payment',
        title: 'Payment Received',
        description: '₹45,000 from Priya Sharma',
        time: '15 min ago',
        icon: DollarSign,
        iconColor: 'text-green-400',
        iconBg: 'bg-green-500/10 border-green-500/20'
    },
    {
        id: 3,
        type: 'client',
        title: 'New Client Added',
        description: 'Amit Patel registered',
        time: '1 hour ago',
        icon: UserPlus,
        iconColor: 'text-blue-400',
        iconBg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
        id: 4,
        type: 'share',
        title: 'Itinerary Shared',
        description: 'North Sikkim Tour - 5 views',
        time: '2 hours ago',
        icon: Share2,
        iconColor: 'text-purple-400',
        iconBg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
        id: 5,
        type: 'content',
        title: 'Content Published',
        description: 'Blog: "Best of Gangtok"',
        time: '3 hours ago',
        icon: FileText,
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
        id: 6,
        type: 'package',
        title: 'Package Updated',
        description: 'Winter Special offers',
        time: '5 hours ago',
        icon: Package,
        iconColor: 'text-orange-400',
        iconBg: 'bg-orange-500/10 border-orange-500/20'
    },
];

export const RecentActivity = () => {
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
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.0 + index * 0.08 }}
                        className="flex items-start gap-4 group hover:bg-ai-card/30 p-3 -mx-3 rounded-xl transition-colors duration-300 cursor-pointer"
                    >
                        {/* Icon */}
                        <div className={`flex-shrink-0 p-2.5 rounded-xl border ${activity.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                            <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
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
                            {activity.time}
                        </div>
                    </motion.div>
                ))}
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
