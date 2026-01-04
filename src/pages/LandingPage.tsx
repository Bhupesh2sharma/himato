
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LocalInsights } from '../components/LocalInsights';


export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-ai-dark text-white selection:bg-ai-accent/30 overflow-x-hidden">
            {/* Marketing Hero */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Background Video/Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80"
                        alt="Sikkim Landscape"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-ai-dark/80 via-ai-dark/50 to-ai-dark" />
                </div>

                <div className="container mx-auto px-4 z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                            <Sparkles className="w-4 h-4 text-ai-accent" />
                            <span className="text-sm font-medium text-gray-300">AI-Powered Travel Planning</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight">
                            DISCOVER <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-accent via-white to-ai-secondary animate-gradient-x">
                                SIKKIM
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Experience the Himalayas like never before.
                            Personalized itineraries, hidden gems, and local insights powered by advanced AI.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/chat')}
                                className="group relative px-8 py-4 bg-ai-accent text-ai-dark font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_40px_rgba(0,242,255,0.5)] w-full sm:w-auto overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative flex items-center justify-center gap-2">
                                    Start Planning Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>

                            <button
                                onClick={() => document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl transition-all hover:bg-white/10 w-full sm:w-auto"
                            >
                                Explore Hidden Gems
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div className="w-[1px] h-16 bg-gradient-to-b from-ai-accent to-transparent" />
                </motion.div>
            </section>

            <div id="insights">
                <LocalInsights />
            </div>

            {/* <SikkimShowcase /> */}
        </div>
    );
}
