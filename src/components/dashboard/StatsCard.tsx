import { motion } from 'framer-motion';
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';


interface StatsCardProps {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: LucideIcon;
    delay?: number;
}

export const StatsCard = ({ title, value, change, trend, icon: Icon, delay = 0 }: StatsCardProps) => {
    const isPositive = trend === 'up';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="glass-card rounded-2xl p-6 group hover:shadow-xl hover:shadow-ai-accent/5 transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-ai-accent/10 border border-ai-accent/20 group-hover:bg-ai-accent/20 transition-colors">
                    <Icon className="w-6 h-6 text-ai-accent" />
                </div>

                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${isPositive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                    ) : (
                        <ArrowDownRight className="w-4 h-4" />
                    )}
                    {change}
                </div>
            </div>

            <div>
                <p className="text-ai-muted text-sm mb-1">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>

            {/* Animated gradient border on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-ai-accent/0 via-ai-accent/10 to-ai-accent/0 blur-xl"></div>
            </div>
        </motion.div>
    );
};
