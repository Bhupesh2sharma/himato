import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { SEO_TOPICS } from '../data/seoTopics';
import type { SeoTopic } from '../data/seoTopics';

/**
 * /guides — the SEO hub page.
 *
 * Why this exists: 49+ guide articles already live at /guide/:slug but nothing
 * links to them as a set. Without a hub, Google sees orphan pages and ranks
 * them slowly. This page is the internal-link backbone for every article and
 * the natural landing point for "Sikkim travel guides" search traffic.
 */

const CATEGORY_ORDER: SeoTopic['category'][] = [
    'Hidden Gem',
    'Offbeat',
    'Adventure',
    'Spiritual',
    'Family',
    'Food',
    'Logistics',
    'Workation',
    'Seasonal',
    'History',
];

const CATEGORY_BLURB: Record<SeoTopic['category'], string> = {
    'Hidden Gem': 'Spots most blogs miss — and a few we wish they would keep missing.',
    'Offbeat': 'Restricted reserves and slow-travel valleys for those who skip the bus tours.',
    'Adventure': 'Treks, hot springs, hairpin bends, paragliding — the parts of Sikkim that get the legs working.',
    'Spiritual': 'Monasteries, sacred lakes, prayer-flag ridgelines.',
    'Family': 'Itineraries, safety calls, and the stuff you actually need to know with kids in tow.',
    'Food': 'Where to eat thukpa, momos, and gundruk — and which cafés actually have power outlets.',
    'Logistics': 'Permits, transport, scooters, taxis — the paperwork side of Sikkim trips.',
    'Workation': 'Coworking, internet speeds, and homestays built for laptops.',
    'Seasonal': 'Cherry blossom, monsoon, December packing — Sikkim by month.',
    'History': 'The treaties, the kings, and the ruins worth driving an extra hour to see.',
};

export function GuidesIndexPage() {
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<SeoTopic['category'] | 'All'>('All');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return SEO_TOPICS.filter((t) => {
            if (activeCategory !== 'All' && t.category !== activeCategory) return false;
            if (!q) return true;
            return (
                t.title.toLowerCase().includes(q) ||
                t.shortDescription.toLowerCase().includes(q) ||
                (t.description ?? '').toLowerCase().includes(q)
            );
        });
    }, [query, activeCategory]);

    const grouped = useMemo(() => {
        const map: Partial<Record<SeoTopic['category'], SeoTopic[]>> = {};
        for (const t of filtered) {
            (map[t.category] ||= []).push(t);
        }
        return map;
    }, [filtered]);

    const categories = useMemo<SeoTopic['category'][]>(() => {
        const present = new Set(SEO_TOPICS.map((t) => t.category));
        return CATEGORY_ORDER.filter((c) => present.has(c));
    }, []);

    return (
        <main
            className="min-h-screen"
            style={{ background: '#f6f1e7', color: '#0e1116' }}
            role="main"
        >
            {/* Hero */}
            <section className="pt-28 pb-10 sm:pt-32 sm:pb-12">
                <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                    <p className="text-[11px] tracking-[0.25em] uppercase font-bold mb-3" style={{ color: '#b89559' }}>
                        Himato · Guides
                    </p>
                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-5"
                    >
                        Everything we've learned
                        <br />
                        about <span style={{ color: '#2f4a3a' }}>Sikkim</span>.
                    </motion.h1>
                    <p className="text-base sm:text-lg max-w-2xl leading-relaxed" style={{ color: '#5c6470' }}>
                        {SEO_TOPICS.length} hand-written guides — permits, hidden valleys, family safety calls, café Wi-Fi, the lot. Read what you need, then plan your trip free at{' '}
                        <Link to="/chat" className="font-bold underline underline-offset-4" style={{ color: '#2f4a3a' }}>
                            himato.in/chat
                        </Link>
                        .
                    </p>

                    {/* Search */}
                    <div className="mt-8 max-w-xl">
                        <label className="relative block">
                            <Search
                                className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2"
                                style={{ color: '#5c6470' }}
                            />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder='Search guides — "permit", "Dzongu", "kids", "café"…'
                                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border focus:outline-none focus:ring-2 transition"
                                style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                            />
                        </label>
                    </div>

                    {/* Category chips */}
                    <div className="mt-5 flex flex-wrap gap-2">
                        <CategoryChip
                            label="All"
                            count={SEO_TOPICS.length}
                            active={activeCategory === 'All'}
                            onClick={() => setActiveCategory('All')}
                        />
                        {categories.map((c) => (
                            <CategoryChip
                                key={c}
                                label={c}
                                count={SEO_TOPICS.filter((t) => t.category === c).length}
                                active={activeCategory === c}
                                onClick={() => setActiveCategory(c)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="pb-24">
                <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                    {filtered.length === 0 ? (
                        <div className="py-20 text-center" style={{ color: '#5c6470' }}>
                            <p className="text-lg font-medium mb-2" style={{ color: '#0e1116' }}>
                                Nothing matched.
                            </p>
                            <p className="text-sm">
                                Try a different keyword, or{' '}
                                <Link to="/chat" className="underline font-bold" style={{ color: '#2f4a3a' }}>
                                    ask the planner directly →
                                </Link>
                            </p>
                        </div>
                    ) : (
                        (activeCategory === 'All' ? categories : [activeCategory]).map((cat) => {
                            const items = grouped[cat as SeoTopic['category']];
                            if (!items || items.length === 0) return null;
                            return (
                                <CategoryBlock
                                    key={cat as string}
                                    category={cat as SeoTopic['category']}
                                    items={items}
                                />
                            );
                        })
                    )}
                </div>
            </section>

            {/* Footer CTA */}
            <section
                className="py-16"
                style={{ background: '#2f4a3a', color: '#f6f1e7' }}
            >
                <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
                    <p
                        className="text-[11px] tracking-[0.25em] uppercase font-bold mb-3"
                        style={{ color: '#b89559' }}
                    >
                        Ready to plan?
                    </p>
                    <h2 className="text-3xl sm:text-5xl font-black mb-5">
                        Build your full Sikkim trip free.
                    </h2>
                    <p className="text-base sm:text-lg mb-8" style={{ color: 'rgba(246,241,231,0.75)' }}>
                        Type any of these into Himato — we'll build a day-by-day itinerary in 60 seconds.
                    </p>
                    <Link
                        to="/chat"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all hover:scale-105"
                        style={{ background: '#f6f1e7', color: '#0e1116' }}
                    >
                        Open the planner
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* JSON-LD: ItemList of all guides for richer Google indexing */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'CollectionPage',
                        name: 'Sikkim Travel Guides — Himato',
                        description: 'Hand-written Sikkim travel guides covering permits, hidden valleys, family safety, and everyday logistics.',
                        url: 'https://www.himato.in/guides',
                        mainEntity: {
                            '@type': 'ItemList',
                            numberOfItems: SEO_TOPICS.length,
                            itemListElement: SEO_TOPICS.map((t, i) => ({
                                '@type': 'ListItem',
                                position: i + 1,
                                url: `https://www.himato.in/guide/${t.id}`,
                                name: t.title,
                            })),
                        },
                    }),
                }}
            />
        </main>
    );
}

function CategoryChip({
    label,
    count,
    active,
    onClick,
}: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-1.5 rounded-full text-sm font-bold transition-all hover:scale-[1.02]"
            style={
                active
                    ? { background: '#2f4a3a', color: '#f6f1e7' }
                    : { background: 'rgba(0,0,0,0.05)', color: '#0e1116', border: '1px solid rgba(0,0,0,0.08)' }
            }
        >
            {label}
            <span
                className="ml-2 text-[11px] font-medium"
                style={{ color: active ? 'rgba(246,241,231,0.7)' : '#5c6470' }}
            >
                {count}
            </span>
        </button>
    );
}

function CategoryBlock({
    category,
    items,
}: {
    category: SeoTopic['category'];
    items: SeoTopic[];
}) {
    return (
        <section className="mt-10 first:mt-2">
            <header className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <p className="text-[11px] tracking-[0.25em] uppercase font-bold mb-1" style={{ color: '#b89559' }}>
                        {category}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold">{CATEGORY_BLURB[category]}</h2>
                </div>
                <p className="text-sm font-medium hidden sm:block" style={{ color: '#5c6470' }}>
                    {items.length} {items.length === 1 ? 'guide' : 'guides'}
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((t) => (
                    <GuideCard key={t.id} topic={t} />
                ))}
            </div>
        </section>
    );
}

function GuideCard({ topic }: { topic: SeoTopic }) {
    return (
        <Link
            to={`/guide/${topic.id}`}
            className="group flex flex-col rounded-2xl bg-white border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ borderColor: 'rgba(0,0,0,0.06)' }}
        >
            <div
                className="aspect-[16/10] w-full overflow-hidden relative"
                style={{ background: '#2f4a3a' }}
            >
                <img
                    src={topic.image}
                    alt={topic.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    onError={(e) => {
                        // Fallback: hide broken image so the green block shows through
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                />
                <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                    style={{ background: '#f6f1e7', color: '#2f4a3a' }}
                >
                    {topic.category}
                </span>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-base leading-snug mb-2 group-hover:underline underline-offset-2 decoration-[#2f4a3a]">
                    {topic.title}
                </h3>
                <p className="text-sm flex-1" style={{ color: '#5c6470' }}>
                    {topic.shortDescription}
                </p>
                <div
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold"
                    style={{ color: '#2f4a3a' }}
                >
                    Read guide
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </Link>
    );
}
