import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Users,
    Package,
    Sparkles,
    BarChart3,
    DollarSign
} from 'lucide-react';

interface QuickActionsProps {
    onAddBooking: () => void;
    onRecordPayment: () => void;
    onAddClient: () => void;
    onUpgrade: () => void;
    onViewSocial: () => void;
    isPro: boolean;
}

export const QuickActions = ({
    onAddBooking,
    onRecordPayment,
    onAddClient,
    onUpgrade,
    onViewSocial,
    isPro
}: QuickActionsProps) => {
    const actions = [
        {
            id: 1,
            title: 'New Itinerary',
            description: 'Create AI-powered trip',
            icon: Plus,
            color: 'from-blue-500 to-cyan-500',
            action: '/chat',
            onClick: null
        },
        {
            id: 2,
            title: 'Add Client',
            description: 'Register new client',
            icon: Users,
            color: 'from-purple-500 to-pink-500',
            action: '#',
            onClick: onAddClient
        },
        {
            id: 3,
            title: 'Add Booking',
            description: 'Record new inquiry',
            icon: Package,
            color: 'from-emerald-500 to-teal-500',
            action: '#',
            onClick: onAddBooking
        },
        {
            id: 4,
            title: 'Record Payment',
            description: 'Update ledger',
            icon: DollarSign,
            color: 'from-orange-500 to-amber-500',
            action: '#',
            onClick: onRecordPayment
        },
        {
            id: 5,
            title: 'AI Content',
            description: isPro ? 'View social history' : 'Upgrade to unlock',
            icon: Sparkles,
            color: 'from-indigo-500 to-blue-500',
            action: isPro ? '#' : '#',
            onClick: isPro ? onViewSocial : onUpgrade
        },
        {
            id: 6,
            title: 'View Analytics',
            description: 'Coming Soon',
            icon: BarChart3,
            color: 'from-rose-500 to-red-500',
            action: '#',
            onClick: () => alert('Advanced Analytics is coming soon!')
        }
    ];

    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card rounded-2xl p-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-ai-accent/10 border border-ai-accent/20">
                    <Sparkles className="w-5 h-5 text-ai-accent" />
                </div>
                <h2 className="text-xl font-bold text-ai-text">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {actions.map((action, index) => (
                    <motion.button
                        key={action.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative overflow-hidden bg-ai-card/50 hover:bg-ai-card/80 border border-black/10 hover:border-black/10 rounded-xl p-4 transition-all duration-300"
                    >
                        {/* Gradient background on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>

                            <h3 className="text-ai-text font-semibold text-sm mb-1 group-hover:text-ai-accent transition-colors">
                                {action.title}
                            </h3>
                            <p className="text-ai-muted text-xs">
                                {action.description}
                            </p>
                        </div>
                        <h3 className="text-white font-bold text-xs mb-1">{action.title}</h3>
                        <p className="text-ai-muted text-[10px] leading-tight">{action.description}</p>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};
