import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cloud,
    Mountain,
    Sparkles,
    Compass,
    Camera,
    Coffee,
    Navigation2,
    Tent
} from 'lucide-react';

const FUN_STEPS = [
    {
        text: "Packing the Yak with extra treats...",
        icon: <Tent className="w-12 h-12" />,
        accent: "#22C55E",
        bg: "rgba(34, 197, 94, 0.1)"
    },
    {
        text: "Chasing the morning clouds over Kanchenjunga...",
        icon: <Cloud className="w-12 h-12" />,
        accent: "#4ade80",
        bg: "rgba(74, 222, 128, 0.1)"
    },
    {
        text: "Consulting the local Monastery wisemen...",
        icon: <Sparkles className="w-12 h-12" />,
        accent: "#16a34a",
        bg: "rgba(22, 163, 74, 0.1)"
    },
    {
        text: "Finding the perfect spot for Momos...",
        icon: <Coffee className="w-12 h-12" />,
        accent: "#22C55E",
        bg: "rgba(34, 197, 94, 0.1)"
    },
    {
        text: "Mapping out hidden waterfall trails...",
        icon: <Navigation2 className="w-12 h-12" />,
        accent: "#86efac",
        bg: "rgba(134, 239, 172, 0.1)"
    }
];

export const AILoadingState = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % FUN_STEPS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-ai-dark flex flex-col items-center justify-center overflow-hidden">
            {/* Playful Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Gangtok Background Image */}
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.3 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="/gangtok-bnnr.jpg" // Reference path for local use
                        alt="Gangtok Skyline"
                        className="w-full h-full object-cover grayscale-[20%] sepia-[10%] contrast-[1.2]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-ai-dark via-ai-dark/80 to-ai-dark" />
                </motion.div>

                {/* Animated Light Pulses */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-ai-accent rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 12, repeat: Infinity }}
                    className="absolute -bottom-24 -right-24 w-96 h-96 bg-ai-secondary rounded-full blur-[120px]"
                />
            </div>

            {/* Character / Hero Animation */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-12">
                    {/* Floating Glow Rings */}
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-[-20px] bg-ai-accent/20 rounded-full blur-2xl"
                    />

                    {/* The Icon Container */}
                    <motion.div
                        key={step}
                        initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 1.5, rotate: 20, opacity: 0 }}
                        className="w-32 h-32 bg-ai-card border-4 border-ai-accent rounded-[2.5rem] flex items-center justify-center text-ai-accent shadow-[0_0_30px_rgba(34,197,94,0.3)] relative z-10"
                    >
                        {FUN_STEPS[step].icon}

                        {/* Little Sparkles around the icon */}
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute -top-2 -right-2"
                        >
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                        </motion.div>
                    </motion.div>

                    {/* Fun Particles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                x: [0, (Math.random() - 0.5) * 200],
                                y: [0, (Math.random() - 0.5) * 200],
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
                            style={{ backgroundColor: FUN_STEPS[step].accent }}
                        />
                    ))}
                </div>

                {/* Fun Text Sequence */}
                <div className="text-center px-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="space-y-4"
                        >
                            <h2 className="text-3xl md:text-4xl font-black text-white flex flex-col items-center gap-2">
                                <span className="text-ai-accent text-sm font-mono tracking-[0.3em] uppercase mb-2">
                                    Hang tight, Traveller!
                                </span>
                                {FUN_STEPS[step].text}
                            </h2>

                            <div className="flex justify-center gap-2">
                                {[...Array(FUN_STEPS.length)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ scale: i === step ? 1.5 : 1 }}
                                        className={`h-2 w-2 rounded-full ${i === step ? 'bg-ai-accent' : 'bg-white/10'}`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Fun Feature: The Hiking Trail */}
            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-ai-accent/5 to-transparent overflow-hidden">
                <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-0 w-full flex items-center gap-4 text-ai-accent/20"
                >
                    <Mountain size={40} />
                    <div className="h-[2px] w-48 border-t-2 border-dashed border-current shrink-0" />
                    <Tent size={40} />
                    <div className="h-[2px] w-48 border-t-2 border-dashed border-current shrink-0" />
                    <Camera size={40} />
                    <div className="h-[2px] w-48 border-t-2 border-dashed border-current shrink-0" />
                    <Compass size={40} />
                </motion.div>
            </div>

            {/* Tip of the Moment */}
            <div className="fixed bottom-12 text-ai-muted text-xs font-mono uppercase tracking-[0.2em] px-8 text-center animate-pulse">
                Pro Tip: Don't forget to try the Butter Tea!
            </div>
        </div>
    );
};
