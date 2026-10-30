import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { BedDouble, Mountain, ShieldCheck, Heart, Clock, MapPin } from 'lucide-react';
import { optimizedSrc } from '../../data/optimizedImages';

interface Stop { time: string; title: string; km: number; image: string }
interface Day { day: number; title: string; stay?: string; altitude?: string; stops: Stop[] }

// A sample of what Himato plans for the prompt shown above it. Photos are from
// /public; where we don't have the exact landmark the stop is titled to match
// what the photo shows. Distances are approximate road km from Gangtok.
const DAYS: Day[] = [
    {
        day: 1,
        title: 'Gangtok to Lachung',
        stay: 'Lachung',
        stops: [
            { time: '08:00', title: 'Drive north via Mangan', km: 118, image: '/tangu.jpeg' },
            { time: '11:30', title: 'Singhik viewpoint', km: 75, image: '/singhik-viewpoint-mangan-sikkim-1-attr-hero.jpeg' },
            { time: '13:30', title: 'Waterfall stop', km: 32, image: '/rolepwaterfalls.jpg' },
        ],
    },
    {
        day: 2,
        title: 'Yumthang Valley',
        stay: 'Lachung',
        altitude: '3,564 m',
        stops: [
            { time: '07:00', title: 'Yumthang Valley', km: 140, image: '/yumgthang.jpeg' },
            { time: '10:30', title: 'Hot spring by the river', km: 140, image: '/borong.jpg' },
            { time: '15:00', title: 'Lachung homestay', km: 118, image: '/our-huts-are-made-of.jpg' },
        ],
    },
    {
        day: 3,
        title: 'Lachung to Gangtok',
        stay: 'Gangtok',
        stops: [
            { time: '08:30', title: 'Drive back through the hills', km: 118, image: '/tinkitam.jpg' },
            { time: '12:30', title: 'Lunch by the Teesta', km: 70, image: '/Rishikhola-resort-1.jpg' },
            { time: '17:30', title: 'Gangtok ropeway', km: 0, image: '/gangtok-bnnr.jpg' },
        ],
    },
    {
        day: 4,
        title: 'Heading home',
        stops: [
            { time: '09:00', title: 'Monastery morning', km: 24, image: '/thulung.jpeg' },
            { time: '12:00', title: 'Teesta riverside drive', km: 60, image: '/riverrafting.jpg' },
            { time: '15:30', title: 'Bagdogra airport', km: 125, image: '/maxresdefault.jpg' },
        ],
    },
];

const AUTO_ADVANCE_MS = 4500;

/** Interactive preview of a Himato itinerary on the landing page. */
export function SampleTripCard() {
    const [active, setActive] = useState(0);
    const [touched, setTouched] = useState(false); // stop auto-advancing once someone interacts
    const [hovering, setHovering] = useState(false);
    const [saved, setSaved] = useState<Set<string>>(() => new Set());
    // Only cycle while the card is actually on screen, so visitors start at Day 1
    const cardRef = useRef<HTMLDivElement>(null);
    const inView = useInView(cardRef, { amount: 0.5 });

    useEffect(() => {
        if (touched || hovering || !inView) return;
        const t = setTimeout(() => setActive((i) => (i + 1) % DAYS.length), AUTO_ADVANCE_MS);
        return () => clearTimeout(t);
    }, [active, touched, hovering, inView]);

    const toggleSaved = (key: string) => {
        setTouched(true);
        setSaved((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const day = DAYS[active];

    return (
        <div
            ref={cardRef}
            className="on-glass w-full min-w-0 rounded-2xl text-white overflow-hidden border border-white/20 bg-white/[0.08] backdrop-blur-md [box-shadow:inset_0_1px_0_rgba(255,255,255,0.15),0_30px_60px_-30px_rgba(0,0,0,0.7)]"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            {/* Header */}
            <div className="px-5 sm:px-6 pt-5">
                <p className="font-semibold text-lg leading-tight">North Sikkim in 4 days</p>
                <p className="text-sm text-white/60 mt-0.5">Easy pace · April</p>

                {/* Day tabs */}
                <div role="tablist" aria-label="Days" className="mt-4 grid grid-cols-4 gap-1 p-1 rounded-xl bg-white/[0.08] border border-white/10">
                    {DAYS.map((d, i) => (
                        <button
                            key={d.day}
                            role="tab"
                            aria-selected={i === active}
                            onClick={() => { setActive(i); setTouched(true); }}
                            className={`relative py-1.5 rounded-lg text-sm font-medium transition-colors ${i === active ? 'text-ai-text' : 'text-white/65 hover:text-white'}`}
                        >
                            {i === active && (
                                <motion.span layoutId="sample-day-pill" className="absolute inset-0 rounded-lg bg-white/90 shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                            )}
                            <span className="relative">Day {d.day}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Day panel */}
            <div className="px-5 sm:px-6 pt-4 pb-5">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={day.day}
                        role="tabpanel"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3.5">
                            <p className="font-semibold">{day.title}</p>
                            {day.stay && (
                                <span className="inline-flex items-center gap-1 text-xs text-white/65">
                                    <BedDouble className="w-3.5 h-3.5 text-[#e6d29f]" />{day.stay}
                                </span>
                            )}
                            {day.altitude && (
                                <span className="inline-flex items-center gap-1 text-xs text-[#f2c48d]">
                                    <Mountain className="w-3.5 h-3.5" />{day.altitude}
                                </span>
                            )}
                        </div>

                        {/* Stop cards — a row on desktop, swipeable on phones */}
                        <ul className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scroll-px-5 sm:scroll-px-0 no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
                            {day.stops.map((s) => {
                                const key = `${day.day}-${s.title}`;
                                const isSaved = saved.has(key);
                                return (
                                    <li key={key} className="snap-start shrink-0 w-[62%] sm:w-auto rounded-xl overflow-hidden bg-white/[0.08] border border-white/10">
                                        <div className="relative aspect-[4/3]">
                                            <img
                                                src={optimizedSrc(s.image)}
                                                alt={s.title}
                                                loading="lazy"
                                                decoding="async"
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => toggleSaved(key)}
                                                aria-pressed={isSaved}
                                                aria-label={isSaved ? `Remove ${s.title} from saved` : `Save ${s.title}`}
                                                className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-black/25 hover:bg-black/40 transition-colors"
                                            >
                                                <motion.span
                                                    key={String(isSaved)}
                                                    initial={{ scale: 0.6 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                                                    className="flex"
                                                >
                                                    <Heart className={`w-[18px] h-[18px] drop-shadow ${isSaved ? 'fill-[#e5484d] text-[#e5484d]' : 'fill-white/0 text-white'}`} />
                                                </motion.span>
                                            </button>
                                        </div>
                                        <div className="px-3 py-2.5">
                                            <p className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5em]">{s.title}</p>
                                            <p className="mt-1.5 flex items-center gap-3 text-xs text-white/60">
                                                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.time}</span>
                                                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.km ? `${s.km} km` : 'Gangtok'}</span>
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Permit */}
            <div className="mx-5 sm:mx-6 mb-5 pt-4 border-t border-white/15 flex items-start gap-2 text-sm text-white/65 min-w-0">
                <ShieldCheck className="w-4 h-4 text-[#e6d29f] shrink-0 mt-0.5" />
                <p className="sm:whitespace-nowrap sm:truncate"><span className="font-medium text-white">Protected Area Permit</span> needed. Your Gangtok tour operator arranges it.</p>
            </div>
        </div>
    );
}
