/**
 * Match an itinerary location/title string to a real photo in /public/.
 *
 * Why this exists: the client-facing share view needs a real Sikkim photo
 * in the hero and per activity card. We already ship a library of ~40 Sikkim
 * photos in /public/ (used by the SEO guide pages), so we reuse those rather
 * than pulling from a third-party CDN.
 *
 * Strategy: case-insensitive substring match against keyword lists. First
 * keyword that hits wins. Always returns *something* — falls back to a
 * decent default Sikkim hero so we never render a broken image.
 */

// Keep the order roughly "most specific first" so e.g. "Khecheopalri Lake"
// hits its dedicated image before a more general "lake" rule would.
const LOCATION_RULES: Array<{ keywords: string[]; image: string }> = [
    // North Sikkim — high-altitude
    { keywords: ['gurudongmar', 'gurudungmar'], image: '/gurudongmar.jpeg' },
    { keywords: ['yumthang', 'yumesamdong', 'zero point', 'lachung'], image: '/yumgthang.jpeg' },
    { keywords: ['lachen', 'thangu', 'chopta'], image: '/tangu.jpeg' },
    { keywords: ['singhik', 'mangan'], image: '/singhik-viewpoint-mangan-sikkim-1-attr-hero.jpeg' },
    { keywords: ['dzongu', 'passingdang', 'lepcha'], image: '/Dongu.jpg' },
    { keywords: ['tholung'], image: '/thulung.jpeg' },
    { keywords: ['kabi', 'lungchok'], image: '/dongu.webp' },

    // East Sikkim
    { keywords: ['zuluk', 'thambi', 'lungthung'], image: '/zuluk.jpg' },
    { keywords: ['phadamchen', 'silk route'], image: '/zuluk.jpg' },
    { keywords: ['aritar', 'lampokhri', 'mankhim'], image: '/aritar.webp' },
    { keywords: ['kupup'], image: '/pic_kupup_lake.jpg' },
    { keywords: ['gnathang', 'gathang'], image: '/gathangvally.jpg' },
    { keywords: ['rolep'], image: '/rolepwaterfalls.jpg' },
    { keywords: ['reshikhola', 'reshi khola', 'rishikhola'], image: '/Rishikhola-resort-1.jpg' },
    { keywords: ['nathula', 'tsomgo', 'changu'], image: '/fly-sikkim-adventure.jpg' },

    // West Sikkim
    { keywords: ['yuksom', 'dubdi', 'goecha la'], image: '/yuksom.jpeg' },
    { keywords: ['khecheopalri'], image: '/68973b325e83ec80921034e58fd82ad1.jpg' },
    { keywords: ['pelling', 'skywalk', 'sky walk', 'rabdentse'], image: '/Pelling_Sky_walk.jpg' },
    { keywords: ['barsey', 'bermiok', 'hee', 'rhododendron'], image: '/garden-itself.jpg' },
    { keywords: ['uttarey'], image: '/garden-itself.jpg' },
    { keywords: ['biksthang'], image: '/our-huts-are-made-of.jpg' },
    { keywords: ['tashiding'], image: '/tashiding.jpeg' },
    { keywords: ['kaluk'], image: '/our-huts-are-made-of.jpg' },

    // South Sikkim
    { keywords: ['borong', 'ralong', 'hot spring'], image: '/borong.jpg' },
    { keywords: ['ravangla', 'buddha park'], image: '/ravangla.jpg' },
    { keywords: ['tendong', 'damthang'], image: '/Tendong-Hill-Where-Mountains-Share-Their-Secrets-1.webp' },
    { keywords: ['namchi', 'chardham', 'char dham', 'temi'], image: '/chardham.jpg' },
    { keywords: ['tinkitam'], image: '/tinkitam.jpg' },
    { keywords: ['maenam', 'bhaledunga'], image: '/maenam-hill.jpg' },
    { keywords: ['martam'], image: '/our-huts-are-made-of.jpg' },
    { keywords: ['kewzing'], image: '/tashiding.jpeg' },
    { keywords: ['lingee', 'payong'], image: '/our-huts-are-made-of.jpg' },

    // Activities (used when the location is generic but the title hints)
    { keywords: ['rafting', 'teesta'], image: '/riverrafting.jpg' },
    { keywords: ['paraglid'], image: '/paragliding .webp' },
    { keywords: ['waterfall'], image: '/rolepwaterfalls.jpg' },
    { keywords: ['monastery', 'gompa'], image: '/tashiding.jpeg' },
    { keywords: ['cherry blossom'], image: '/sikkim-3.webp' },

    // Gangtok (very common, kept lower-priority so specific spots win first)
    { keywords: ['gangtok', 'mg marg', 'rumtek', 'enchey'], image: '/Gangtok-View.jpg' },
    { keywords: ['kanchenjunga', 'kanchendzonga'], image: '/Gangtok-View.jpg' },
];

const DEFAULT_HERO = '/gangtok-bnnr.jpg';
const DEFAULT_ACTIVITY = '/sikkim-3.webp';

/**
 * Pick the best image for a given location string.
 * @param query  Location / title text. e.g. "Yumthang Valley", "Visit Tashiding Monastery"
 * @param fallback  Override fallback (used to differentiate hero vs activity)
 */
export function imageForLocation(query: string | undefined | null, fallback: string = DEFAULT_ACTIVITY): string {
    if (!query) return fallback;
    const q = query.toLowerCase();
    for (const rule of LOCATION_RULES) {
        if (rule.keywords.some((k) => q.includes(k))) {
            return rule.image;
        }
    }
    return fallback;
}

/**
 * Pick the hero image for a whole itinerary. Walks every activity location
 * and title looking for the first concrete match — so a North Sikkim trip
 * gets a Yumthang/Gurudongmar hero rather than a generic Gangtok shot.
 */
export function heroImageForItinerary(data: {
    days?: Array<{ activities?: Array<{ location?: string; title?: string }> }>;
} | null | undefined): string {
    if (!data?.days) return DEFAULT_HERO;
    for (const day of data.days) {
        for (const activity of day.activities ?? []) {
            for (const text of [activity.location, activity.title]) {
                if (!text) continue;
                const q = text.toLowerCase();
                for (const rule of LOCATION_RULES) {
                    if (rule.keywords.some((k) => q.includes(k))) {
                        return rule.image;
                    }
                }
            }
        }
    }
    return DEFAULT_HERO;
}
