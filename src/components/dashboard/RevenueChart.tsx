import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';



interface DataPoint {
    month: string;
    value: number;
}

const mockData: DataPoint[] = [
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 52000 },
    { month: 'Mar', value: 48000 },
    { month: 'Apr', value: 61000 },
    { month: 'May', value: 72000 },
    { month: 'Jun', value: 85000 },
    { month: 'Jul', value: 95000 },
];

export const RevenueChart = () => {
    const [animatedData, setAnimatedData] = useState<DataPoint[]>(
        mockData.map(d => ({ ...d, value: 0 }))
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedData(mockData);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const maxValue = Math.max(...mockData.map(d => d.value));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-card rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Revenue Overview</h2>
                        <p className="text-sm text-ai-muted">Last 7 months performance</p>
                    </div>
                </div>

                <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <span className="text-emerald-400 text-sm font-medium">+23.5%</span>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between gap-2">
                    {animatedData.map((data, index) => {
                        const heightPercent = (data.value / maxValue) * 100;

                        return (
                            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                                {/* Bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPercent}%` }}
                                    transition={{ duration: 1, delay: 0.7 + index * 0.1, ease: 'easeOut' }}
                                    className="w-full relative group cursor-pointer"
                                >
                                    {/* Gradient bar */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-ai-accent/80 to-ai-accent/40 rounded-t-lg group-hover:from-ai-accent group-hover:to-ai-accent/60 transition-all duration-300">
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-ai-accent/0 to-ai-accent/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                                    </div>

                                    {/* Value tooltip on hover */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-ai-dark/90 border border-ai-accent/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        <span className="text-white text-xs font-semibold">₹{(data.value / 1000).toFixed(0)}K</span>
                                    </div>
                                </motion.div>

                                {/* Month label */}
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                                    className="text-ai-muted text-xs font-medium"
                                >
                                    {data.month}
                                </motion.span>
                            </div>
                        );
                    })}
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-px bg-white/5"></div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                <div>
                    <p className="text-ai-muted text-xs mb-1">Avg. Monthly</p>
                    <p className="text-white font-semibold">₹65.4K</p>
                </div>
                <div>
                    <p className="text-ai-muted text-xs mb-1">Peak Month</p>
                    <p className="text-white font-semibold">Jul (₹95K)</p>
                </div>
                <div>
                    <p className="text-ai-muted text-xs mb-1">Growth Rate</p>
                    <p className="text-emerald-400 font-semibold">+23.5%</p>
                </div>
            </div>
        </motion.div>
    );
};
