
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Share2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Ensure this is installed or use simple formatting
import { SEO_TOPICS } from '../data/seoTopics';


export const GuidePage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const topic = SEO_TOPICS.find(t => t.id === slug);

    if (!topic) {
        return (
            <div className="min-h-screen bg-ai-dark text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Guide Not Found</h1>
                    <button onClick={() => navigate('/')} className="text-ai-accent hover:underline">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-ai-dark text-white selection:bg-ai-accent/30 font-sans">
            {/* Hero Image */}
            <header className="relative h-[60vh] w-full overflow-hidden">
                <img
                    src={topic.image}
                    alt={topic.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ai-dark via-ai-dark/50 to-transparent" />

                {/* Navigation Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 text-white transition-colors border border-white/10"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button
                        className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 text-white transition-colors border border-white/10"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                        }}
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12 max-w-4xl mx-auto text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="inline-block px-3 py-1 rounded-full bg-ai-accent text-ai-dark text-xs font-bold mb-4 uppercase tracking-widest">
                            {topic.category} Guide
                        </span>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 drop-shadow-xl">
                            {topic.title}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 max-w-2xl font-light">
                            {topic.shortDescription}
                        </p>
                    </motion.div>
                </div>
            </header>

            {/* Content Container */}
            <main className="container mx-auto px-4 md:px-6 py-12 flex flex-col lg:flex-row gap-12 relative z-10 -mt-10">
                {/* Main Article */}
                <div className="flex-1 bg-ai-card border border-white/5 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-xl">
                    <div className="prose prose-invert prose-lg max-w-none prose-headings:text-ai-accent prose-p:text-gray-300 prose-li:text-gray-300">
                        {/* 
                            Note: In a real production app, we would sanitize this content.
                            Since it comes from our internal file, it's safe.
                        */}
                        <ReactMarkdown>{topic.content}</ReactMarkdown>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">Was this guide helpful?</h3>
                        <p className="text-ai-muted mb-6">
                            This is just a starting point. Himato AI can generate a fully personalized itinerary based on this guide, customized to your exact dates and budget.
                        </p>
                    </div>
                </div>

                {/* Sidebar / CTA */}
                <aside className="lg:w-80 flex-shrink-0 space-y-6">
                    <div className="sticky top-24">
                        <div className="bg-gradient-to-br from-ai-secondary/20 to-ai-accent/10 border border-ai-accent/30 rounded-2xl p-6 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-4 text-ai-accent">
                                <Sparkles className="w-5 h-5" />
                                <span className="font-bold text-sm tracking-uppercase">WANT TO GO HERE?</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Plan this Trip</h3>
                            <p className="text-sm text-gray-300 mb-6">
                                Use our AI to turn this guide into an actionable day-by-day plan with flight and hotel options.
                            </p>

                            <button
                                onClick={() => navigate('/', { state: { prompt: `Plan a trip based on: ${topic.title}` } })}
                                className="w-full py-4 bg-ai-accent hover:bg-ai-accent-dark text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                <Calendar className="w-5 h-5" />
                                Generate Itinerary
                            </button>
                        </div>

                        <div className="mt-6 bg-ai-card/50 border border-white/5 rounded-2xl p-6">
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-ai-muted" />
                                Locations Covered
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {topic.category === 'Workation' && ['Gangtok', 'MG Marg', 'Tadong'].map(loc => (
                                    <span key={loc} className="text-xs px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-gray-400">{loc}</span>
                                ))}
                                {topic.category === 'Offbeat' && ['Zuluk', 'Lungthung', 'Nathang Valley'].map(loc => (
                                    <span key={loc} className="text-xs px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-gray-400">{loc}</span>
                                ))}
                                {topic.category === 'Family' && ['Ravangla', 'Pelling', 'Darap'].map(loc => (
                                    <span key={loc} className="text-xs px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-gray-400">{loc}</span>
                                ))}
                                {topic.category === 'Adventure' && ['Lachen', 'Gurudongmar', 'Lachung', 'Zero Point'].map(loc => (
                                    <span key={loc} className="text-xs px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-gray-400">{loc}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </main>


        </article>
    );
};
