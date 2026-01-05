import { motion } from 'framer-motion';
import {
    Plus,
    Users,
    Share2,
    Package,
    Sparkles,
    BarChart3
} from 'lucide-react';

const quickActions = [
    {
        id: 1,
        title: 'New Itinerary',
        description: 'Create AI-powered trip',
        icon: Plus,
        color: 'from-blue-500 to-cyan-500',
        action: '/chat'
    },
    {
        id: 2,
        title: 'Add Client',
        description: 'Register new client',
        icon: Users,
        color: 'from-purple-500 to-pink-500',
        action: '#'
    },
    {
        id: 3,
        title: 'AI Content',
        description: 'Generate marketing',
        icon: Sparkles,
        color: 'from-emerald-500 to-teal-500',
        action: '#'
    },
    {
        id: 4,
        title: 'New Package',
        description: 'Create package',
        icon: Package,
        color: 'from-orange-500 to-amber-500',
        action: '#'
    },
    {
        id: 5,
        title: 'Share Link',
        description: 'Generate share link',
        icon: Share2,
        color: 'from-indigo-500 to-blue-500',
        action: '#'
    },
    {
        id: 6,
        title: 'View Analytics',
        description: 'Detailed insights',
        icon: BarChart3,
        color: 'from-rose-500 to-red-500',
        action: '#'
    }
];

export const QuickActions = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card rounded-2xl p-6 mb-8"
        >
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-ai-accent/10 border border-ai-accent/20">
                    <Sparkles className="w-5 h-5 text-ai-accent" />
                </div>
                <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickActions.map((action, index) => (
                    <motion.button
                        key={action.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative overflow-hidden bg-ai-card/50 hover:bg-ai-card/80 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300"
                    >
                        {/* Gradient background on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>

                            <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-ai-accent transition-colors">
                                {action.title}
                            </h3>
                            <p className="text-ai-muted text-xs">
                                {action.description}
                            </p>
                        </div>

                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};
