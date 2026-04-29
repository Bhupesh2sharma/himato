import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, Compass, Camera, Coffee, Navigation2, Tent } from 'lucide-react';

const STEPS = [
    { text: "Packing the Yak with extra treats…",         icon: Tent },
    { text: "Chasing morning clouds over Kanchenjunga…",  icon: Mountain },
    { text: "Consulting the local Monastery wisemen…",    icon: Compass },
    { text: "Finding the perfect spot for Momos…",        icon: Coffee },
    { text: "Mapping out hidden waterfall trails…",       icon: Navigation2 },
    { text: "Capturing the best viewpoints for you…",     icon: Camera },
];

export const AILoadingState = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setStep(p => (p + 1) % STEPS.length), 2800);
        return () => clearInterval(interval);
    }, []);

    const Icon = STEPS[step].icon;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ai-dark overflow-hidden">
            {/* Subtle background blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-40"
                    style={{ background: 'radial-gradient(circle, rgba(47,74,58,0.12) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(201,169,97,0.08) 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-6">
                {/* Icon card */}
                <div className="relative mb-10">
                    <motion.div
                        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="absolute inset-[-16px] rounded-[2.5rem]"
                        style={{ background: 'rgba(47,74,58,0.1)' }}
                    />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                            transition={{ duration: 0.4 }}
                            className="w-24 h-24 rounded-[2rem] flex items-center justify-center relative z-10 bg-white border border-black/10 shadow-sm"
                            style={{ boxShadow: '0 8px 32px rgba(47,74,58,0.15)' }}
                        >
                            <Icon className="w-10 h-10" style={{ color: '#2f4a3a' }} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Text */}
                <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-ai-muted mb-4">
                    Hang tight, Traveller!
                </p>

                <AnimatePresence mode="wait">
                    <motion.h2
                        key={step}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35 }}
                        className="text-2xl md:text-3xl text-ai-text leading-snug max-w-sm"
                        style={{ fontWeight: 500 }}
                    >
                        {STEPS[step].text}
                    </motion.h2>
                </AnimatePresence>

                {/* Step dots */}
                <div className="flex gap-2 mt-8">
                    {STEPS.map((_, i) => (
                        <motion.span
                            key={i}
                            animate={{ scale: i === step ? 1.4 : 1 }}
                            className="block rounded-full transition-colors"
                            style={{
                                width: 6, height: 6,
                                background: i === step ? '#2f4a3a' : 'rgba(0,0,0,0.12)'
                            }}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
};
