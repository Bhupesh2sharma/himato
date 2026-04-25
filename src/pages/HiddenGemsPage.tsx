import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { SEO_TOPICS, type SeoTopic } from '../data/seoTopics';
import { apiClient } from '../services/api';
import type { GuidePost } from '../services/api';

const CATEGORY_COLOR: Record<string, string> = {
    Offbeat:      '#d97a2c',
    Adventure:    '#b73f25',
    Spiritual:    '#7ba9c4',
    Family:       '#2f4a3a',
    Workation:    '#0e1116',
    Food:         '#c9a961',
    Seasonal:     '#2f4a3a',
    'Hidden Gem': '#b73f25',
    History:      '#7ba9c4',
    Logistics:    '#6b7280',
};

// Normalise both source shapes into one unified type
type SlideItem = { id: string; title: string; shortDescription: string; category: string; image: string };

function toSlide(item: SeoTopic | GuidePost): SlideItem {
    if ('_id' in item) {
        return { id: item.slug, title: item.title, shortDescription: item.shortDescription, category: item.category, image: item.image };
    }
    return { id: item.id, title: item.title, shortDescription: item.shortDescription, category: item.category, image: item.image };
}

export function HiddenGemsPage() {
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [slides, setSlides] = useState<SlideItem[]>(SEO_TOPICS.map(toSlide));

    // Fetch from backend; use static data as instant fallback
    useEffect(() => {
        apiClient.getPublishedGuides()
            .then(res => {
                if (res.data.guides.length > 0) setSlides(res.data.guides.map(toSlide));
            })
            .catch(() => {}); // keep static fallback silently
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => setActiveIndex(Math.round(el.scrollTop / el.clientHeight));
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    const goTo = (i: number) => {
        scrollRef.current?.scrollTo({ top: i * (scrollRef.current.clientHeight ?? 0), behavior: 'smooth' });
    };

    return (
        <div className="fixed inset-0 bg-[#0e1116]">
            {/* Close button */}
            <button
                onClick={() => navigate(-1 as any)}
                className="fixed top-6 left-6 z-50 p-2.5 rounded-full transition-all"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
                <X className="w-5 h-5 text-white" />
            </button>

            {/* Slide counter */}
            <div className="fixed top-6 right-6 z-50 text-white/30 text-xs font-mono tracking-widest">
                {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </div>

            {/* Scroll reel */}
            <div
                ref={scrollRef}
                className="h-full overflow-y-scroll no-scrollbar"
                style={{ scrollSnapType: 'y mandatory' }}
            >
                {slides.map((slide, i) => (
                    <Slide
                        key={slide.id}
                        topic={slide}
                        isActive={activeIndex === i}
                        onReadGuide={() => navigate(`/guide/${slide.id}`)}
                    />
                ))}
            </div>

            {/* Right-side progress dots */}
            <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                    >
                        <span
                            className="block rounded-full transition-all duration-300"
                            style={{
                                width: 4,
                                height: activeIndex === i ? 20 : 4,
                                background: activeIndex === i ? '#ffffff' : 'rgba(255,255,255,0.3)',
                            }}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

function Slide({ topic, isActive, onReadGuide }: { topic: SlideItem; isActive: boolean; onReadGuide: () => void }) {
    const catColor = CATEGORY_COLOR[topic.category] || '#2f4a3a';

    return (
        <div className="relative h-screen w-full overflow-hidden" style={{ scrollSnapAlign: 'start' }}>
            {/* Photo */}
            <img
                src={topic.image}
                alt={topic.title}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(14,17,22,0.95) 0%, rgba(14,17,22,0.5) 45%, rgba(14,17,22,0.2) 100%)' }}
            />

            {/* Content */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute inset-0 flex flex-col justify-end px-8 md:px-14 pb-16"
                    >
                        {/* Category badge */}
                        <span
                            className="inline-block text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4 w-fit text-white"
                            style={{ background: catColor }}
                        >
                            {topic.category}
                        </span>

                        {/* Title */}
                        <h2
                            className="text-white text-3xl md:text-5xl font-bold leading-tight mb-3 max-w-xl"
                            style={{ letterSpacing: '-0.02em' }}
                        >
                            {topic.title}
                        </h2>

                        {/* Short description */}
                        <p className="text-white/60 text-base max-w-lg leading-relaxed mb-8 font-light">
                            {topic.shortDescription}
                        </p>

                        {/* CTA */}
                        <button
                            onClick={onReadGuide}
                            className="flex items-center gap-2.5 w-fit px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:gap-4 group"
                            style={{ background: '#f6f1e7', color: '#0e1116' }}
                        >
                            Read Full Guide
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
