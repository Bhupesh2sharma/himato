import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 1000); // 3 seconds total display time
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ai-dark overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            {/* Background radial glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(47,74,58,0.12) 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    <motion.div
                        className="flex items-center gap-3 mb-5"
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <Sparkles className="w-8 h-8 text-ai-accent" />
                        <h1
                            className="text-6xl md:text-8xl font-bold tracking-tighter text-ai-text"
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                        >
                            Himato
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.8 }}
                        className="text-sm text-ai-muted font-medium tracking-[0.3em] uppercase"
                    >
                        by waglogy
                    </motion.p>
                </motion.div>
            </div>
        </motion.div>
    );
};
