
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEO_TOPICS } from '../data/seoTopics';

export const LocalInsights = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 400; // Approx card width + gap
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <section className="py-24 overflow-hidden relative" aria-label="Local Travel Insights">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ai-accent/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ai-accent/30 to-transparent" />

            <div className="container mx-auto px-4 mb-12">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="p-1 px-3 rounded-full bg-ai-accent/10 border border-ai-accent/30 text-ai-accent text-xs font-bold tracking-wider uppercase flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Hidden Gems
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Discover the <span className="text-ai-accent">Unexplored</span>
                        </h2>
                        <p className="text-ai-muted max-w-xl">
                            Go beyond the tourist traps. Our AI has curated deep local insights on where to stay, work, and explore.
                        </p>
                    </div>

                    {/* Carousel Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-ai-accent/30 transition-all active:scale-95 text-white group"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:text-ai-accent transition-colors" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-ai-accent/30 transition-all active:scale-95 text-white group"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-6 h-6 group-hover:text-ai-accent transition-colors" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrolling Cards Container */}
            <div className="relative w-full">
                {/* Fade Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-ai-dark to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-ai-dark to-transparent z-10 pointer-events-none" />

                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 px-4 md:px-20 overflow-x-auto pb-8 snap-x snap-mandatory"
                    style={{
                        scrollbarWidth: 'none',  /* Firefox */
                        msOverflowStyle: 'none',  /* IE and Edge */
                    }}
                >
                    <style>{`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                    {SEO_TOPICS.map((topic, index) => (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            onClick={() => navigate(`/guide/${topic.id}`)}
                            className="snap-center group relative w-[300px] md:w-[400px] h-[400px] md:h-[500px] rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 border border-white/10 hover:border-ai-accent/50 transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                        >
                            <img
                                src={topic.image}
                                alt={topic.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ai-dark via-ai-dark/60 to-transparent opacity-90" />

                            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                                <span className="inline-block px-3 py-1 rounded-full bg-ai-secondary/80 backdrop-blur-md text-white text-xs font-bold w-fit mb-3 border border-white/10">
                                    {topic.category}
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-ai-accent transition-colors">
                                    {topic.title}
                                </h3>
                                <p className="text-sm text-gray-300 line-clamp-2 mb-6">
                                    {topic.shortDescription}
                                </p>
                                <div className="flex items-center gap-2 text-ai-accent text-sm font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                    Read Guide <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
