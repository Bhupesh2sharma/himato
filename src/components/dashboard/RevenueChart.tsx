import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';



interface DataPoint {
    month: string;
    value: number;
}

interface RevenueChartProps {
    data?: DataPoint[];
}

export const RevenueChart = ({ data = [] }: RevenueChartProps) => {
    const [animatedData, setAnimatedData] = useState<DataPoint[]>([]);

    useEffect(() => {
        if (data && data.length > 0) {
            // Initially set to 0 for animation transition if needed, 
            // but for simplicity setting directly now
            setAnimatedData(data);
        }
    }, [data]);

    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
    const avgMonthly = data.length > 0 ? data.reduce((sum, d) => sum + d.value, 0) / data.length : 0;
    const peakMonth = data.length > 0 ? [...data].sort((a, b) => b.value - a.value)[0] : null;

    // Growth rate between first and last month shown
    const growthRate = (data.length > 1 && data[0].value > 0)
        ? ((data[data.length - 1].value - data[0].value) / data[0].value) * 100
        : 0;

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

                {growthRate !== 0 && (
                    <div className={`px-3 py-1.5 rounded-lg ${growthRate >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <span className={`${growthRate >= 0 ? 'text-emerald-400' : 'text-red-400'} text-sm font-medium`}>
                            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="relative h-64">
                {animatedData.length > 0 ? (
                    <div className="absolute inset-0 flex items-end justify-between gap-2">
                        {animatedData.map((dataPoint, index) => {
                            const heightPercent = maxValue > 0 ? (dataPoint.value / maxValue) * 100 : 0;

                            return (
                                <div key={dataPoint.month} className="flex-1 flex flex-col items-center gap-2">
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
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-ai-dark/90 border border-ai-accent/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            <span className="text-white text-xs font-semibold">₹{(dataPoint.value / 1000).toFixed(1)}K</span>
                                        </div>
                                    </motion.div>

                                    {/* Month label */}
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                                        className="text-ai-muted text-xs font-medium"
                                    >
                                        {dataPoint.month}
                                    </motion.span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-ai-muted text-sm">No revenue data for the selected period.</p>
                    </div>
                )}

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
                    <p className="text-white font-semibold">₹{(avgMonthly / 1000).toFixed(1)}K</p>
                </div>
                <div>
                    <p className="text-ai-muted text-xs mb-1">Peak Month</p>
                    <p className="text-white font-semibold">
                        {peakMonth ? `${peakMonth.month} (₹${(peakMonth.value / 1000).toFixed(1)}K)` : 'N/A'}
                    </p>
                </div>
                <div>
                    <p className="text-ai-muted text-xs mb-1">Growth Rate</p>
                    <p className={`${growthRate >= 0 ? 'text-emerald-400' : 'text-red-400'} font-semibold`}>
                        {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
