
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Share2, Sparkles, Brain, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SEO_TOPICS } from '../data/seoTopics';
import { apiClient } from '../services/api';
import { chatWithSherpa } from '../services/ai';

interface GuideTopic {
    id: string;
    title: string;
    shortDescription: string;
    description?: string;
    category: string;
    image: string;
    content: string;
}

export const GuidePage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [topic, setTopic] = useState<GuideTopic | null>(null);
    const [loading, setLoading] = useState(true);
    const [showKnowMore, setShowKnowMore] = useState(false);
    const [knowMoreContent, setKnowMoreContent] = useState('');
    const [knowMoreLoading, setKnowMoreLoading] = useState(false);

    const handleKnowMore = async () => {
        if (!topic) return;
        setShowKnowMore(true);
        if (knowMoreContent) return; // already fetched
        setKnowMoreLoading(true);
        try {
            const prompt = `Tell me everything about "${topic.title}" in Sikkim, India. Include: its history and cultural significance, best time to visit, how to reach there, local food specialties, accommodation options, must-do activities, hidden local tips, and any permits required. Format with clear markdown headings.`;
            const response = await chatWithSherpa(prompt);
            setKnowMoreContent(response);
        } catch {
            setKnowMoreContent('Sorry, could not fetch information right now. Please try again.');
        } finally {
            setKnowMoreLoading(false);
        }
    };

    useEffect(() => {
        if (!slug) return;

        // Try API first, fall back to static data
        apiClient.getGuideBySlug(slug)
            .then(res => {
                const g = res.data.guide;
                setTopic({ id: g.slug, title: g.title, shortDescription: g.shortDescription, description: g.description, category: g.category, image: g.image, content: g.content });
            })
            .catch(() => {
                const staticTopic = SEO_TOPICS.find(t => t.id === slug);
                if (staticTopic) setTopic(staticTopic);
            })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-ai-dark flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-black/10 border-t-ai-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="min-h-screen bg-ai-dark text-ai-text flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Guide Not Found</h1>
                    <button onClick={() => navigate('/')} className="text-ai-accent hover:underline">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-ai-dark text-ai-text selection:bg-ai-accent/30 font-sans">
            {/* Hero Image */}
            <header className="relative h-[60vh] w-full overflow-hidden">
                <img
                    src={topic.image}
                    alt={topic.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0e1116 0%, rgba(14,17,22,0.5) 50%, transparent 100%)' }} />

                {/* Navigation Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                    <button
                        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
                        className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 text-white transition-colors border border-black/10"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button
                        className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 text-white transition-colors border border-black/10"
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
                        <span className="inline-block px-3 py-1 rounded-full bg-ai-accent text-white text-xs font-bold mb-4 uppercase tracking-widest">
                            {topic.category} Guide
                        </span>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 drop-shadow-xl text-white">
                            {topic.title}
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl font-light">
                            {topic.shortDescription}
                        </p>
                    </motion.div>
                </div>
            </header>

            {/* Content Container */}
            <main className="container mx-auto px-4 md:px-6 py-12 flex flex-col lg:flex-row gap-12 relative z-10 -mt-10">
                {/* Main Article */}
                <div className="flex-1 bg-white border border-black/10 rounded-2xl p-6 md:p-10 shadow-sm">
                    <div className="prose prose-lg max-w-none prose-headings:text-ai-text prose-headings:font-semibold prose-p:text-ai-muted prose-li:text-ai-muted prose-strong:text-ai-text">
                        {/* 
                            Note: In a real production app, we would sanitize this content.
                            Since it comes from our internal file, it's safe.
                        */}
                        <ReactMarkdown>{topic.content}</ReactMarkdown>
                    </div>

                    <div className="mt-10 pt-8 border-t border-black/10">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-ai-dark/5 to-ai-accent/5 border border-ai-accent/20">
                            <div className="flex-1">
                                <h3 className="text-base font-semibold text-ai-text mb-1 flex items-center gap-2">
                                    <Brain className="w-4 h-4 text-ai-accent" />
                                    Want to know more?
                                </h3>
                                <p className="text-sm text-ai-muted">Let our AI dig deeper — history, tips, food, permits and everything in between.</p>
                            </div>
                            <button
                                onClick={handleKnowMore}
                                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-accent/90 transition-colors"
                            >
                                <Brain className="w-4 h-4" />
                                Know More About This
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-black/10">
                        <h3 className="text-xl font-bold text-ai-text mb-4">Was this guide helpful?</h3>
                        <p className="text-ai-muted mb-6">
                            This is just a starting point. Himato AI can generate a fully personalized itinerary based on this guide, customized to your exact dates and budget.
                        </p>
                    </div>
                </div>

                {/* Sidebar / CTA */}
                <aside className="lg:w-80 flex-shrink-0 space-y-6">
                    <div className="sticky top-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative rounded-2xl overflow-hidden"
                            style={{ background: '#2f4a3a' }}
                        >
                            {/* Subtle radial glow */}
                            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(201,169,97,0.25) 0%, transparent 65%)' }} />

                            <div className="relative p-7">
                                <span className="inline-flex items-center gap-1.5 text-[#c9a961] text-[11px] font-semibold tracking-[0.22em] uppercase mb-5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Want to go here?
                                </span>

                                <h3 className="text-3xl font-bold text-white mb-3 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                                    Turn this guide<br />into your trip
                                </h3>
                                <p className="text-white/65 text-sm leading-relaxed mb-7">
                                    Our AI reads this guide and builds a personalised day-by-day itinerary — hotels, routes, permits, everything.
                                </p>

                                <button
                                    onClick={() => navigate('/', { state: { prompt: `Plan a trip based on: ${topic.title}` } })}
                                    className="w-full py-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 group"
                                    style={{ background: '#f6f1e7', color: '#0e1116', boxShadow: '0 8px 24px -6px rgba(0,0,0,0.4)' }}
                                >
                                    <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Generate My Itinerary
                                </button>

                                <p className="text-white/35 text-xs text-center mt-4">Free · Ready in seconds</p>
                            </div>
                        </motion.div>

                        <div className="mt-4 bg-white border border-black/10 rounded-2xl p-6">
                            <h4 className="font-semibold text-ai-text mb-4 flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-ai-accent" />
                                Locations Covered
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {topic.category === 'Workation' && ['Gangtok', 'MG Marg', 'Tadong'].map(loc => (
                                    <span key={loc} className="text-xs px-3 py-1 bg-black/5 rounded-lg border border-black/10 text-gray-500">{loc}</span>
                                ))}
                                {topic.category === 'Offbeat' && ['Zuluk', 'Lungthung', 'Nathang Valley'].map(loc => (
                                    <span key={loc} className="text-xs px-3 py-1 bg-black/5 rounded-lg border border-black/10 text-gray-500">{loc}</span>
                                ))}
                                {topic.category === 'Family' && ['Ravangla', 'Pelling', 'Darap'].map(loc => (
                                    <span key={loc} className="text-xs px-3 py-1 bg-black/5 rounded-lg border border-black/10 text-gray-500">{loc}</span>
                                ))}
                                {topic.category === 'Adventure' && ['Lachen', 'Gurudongmar', 'Lachung', 'Zero Point'].map(loc => (
                                    <span key={loc} className="text-xs px-3 py-1 bg-black/5 rounded-lg border border-black/10 text-gray-500">{loc}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </main>


            {/* Know More Modal */}
            {showKnowMore && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowKnowMore(false)} />
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="relative w-full sm:max-w-2xl max-h-[85vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-ai-accent" />
                                <span className="font-semibold text-ai-text text-sm">AI Deep Dive</span>
                            </div>
                            <button onClick={() => setShowKnowMore(false)} className="p-1.5 rounded-full hover:bg-black/5 transition-colors">
                                <X className="w-5 h-5 text-ai-muted" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            {knowMoreLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4">
                                    <div className="w-8 h-8 border-2 border-black/10 border-t-ai-accent rounded-full animate-spin" />
                                    <p className="text-ai-muted text-sm">Gathering everything about {topic.title}…</p>
                                </div>
                            ) : (
                                <div className="prose prose-sm max-w-none prose-headings:text-ai-text prose-headings:font-semibold prose-p:text-ai-muted prose-li:text-ai-muted prose-strong:text-ai-text">
                                    <ReactMarkdown>{knowMoreContent}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </article>
    );
};
