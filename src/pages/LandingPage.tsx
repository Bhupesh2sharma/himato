
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LocalInsights } from '../components/LocalInsights';


export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen text-white selection:bg-ai-accent/30 overflow-x-hidden" style={{ background: '#0e1116' }}>
            {/* Marketing Hero */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/1.png"
                        alt="Sikkim Landscape"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(14,17,22,0.6) 0%, rgba(14,17,22,0.3) 40%, rgba(14,17,22,0.75) 100%)' }} />
                </div>

                <div className="container mx-auto px-4 z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none mb-6">
                            DISCOVER <br />
                            <span className="text-shimmer">SIKKIM</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Personalised itineraries, hidden valleys, and local insights — powered by AI.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/chat')}
                                className="group relative px-8 py-4 font-bold rounded-xl transition-all hover:scale-105 w-full sm:w-auto overflow-hidden"
                                style={{ background: '#f6f1e7', color: '#0e1116', boxShadow: '0 12px 30px -8px rgba(0,0,0,0.5)' }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative flex items-center justify-center gap-2">
                                    Start Planning Free
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>

                            <button
                                onClick={() => navigate('/hidden-gems')}
                                className="px-8 py-4 text-white font-bold rounded-xl transition-all w-full sm:w-auto"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)' }}
                            >
                                Explore Hidden Gems
                            </button>
                        </div>
                    </motion.div>
                </div>

            </section>

            <div id="insights">
                <LocalInsights />
            </div>

            {/* <SikkimShowcase /> */}
        </div>
    );
}
