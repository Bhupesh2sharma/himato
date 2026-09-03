// Sikkim seasonal "best time to visit" calendar.
//
// Each destination is tagged with the months it's genuinely worth visiting
// (bestMonths) and the months to hold it back (avoidMonths) — driven by
// rhododendron blooms in spring, monsoon landslide risk on North Sikkim /
// Silk Route high-altitude roads (Jul–Aug, and early Sep for the highest
// passes), autumn's clear Kanchenjunga views, and deep-winter snow closures
// of Gurudongmar / Zero Point / Nathula.
//
// Sources: Sikkim Tourism (sikkimtourism.gov.in, esikkimtourism.in),
// Holidify, Thrillophilia, Northeast-India, Trawell.

export type AltitudeTier = 'high' | 'mid' | 'low';

export interface SeasonalPlace {
    name: string;          // exact chip label
    bestMonths: number[];  // 1–12, months this place shines
    avoidMonths: number[]; // 1–12, months it's risky / closed / underwhelming
    altitudeTier: AltitudeTier;
    note: string;
}

export interface SikkimSeason {
    key: 'winter' | 'spring' | 'summer' | 'monsoon' | 'postMonsoon' | 'autumn';
    emoji: string;
    tagline: string; // shown next to "Popular right now"
}

export const SEASONAL_PLACES: SeasonalPlace[] = [
    { name: 'Gangtok Nightlife',          bestMonths: [3, 4, 5, 10, 11, 12], avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'capital city, all-season; clearest in spring & autumn' },
    { name: 'Pelling Skywalk',            bestMonths: [3, 4, 5, 10, 11, 12], avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'Kanchenjunga views best Oct–Dec & spring' },
    { name: 'Lachung Valley',             bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'high', note: 'North Sikkim base; spring flowers & autumn clarity' },
    { name: 'Lachen Monastery',           bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'high', note: 'North Sikkim base town; best spring/autumn' },
    { name: 'Yumthang Valley of Flowers', bestMonths: [3, 4, 5],             avoidMonths: [7, 8],          altitudeTier: 'high', note: 'rhododendrons peak late Apr–mid May' },
    { name: 'Gurudongmar Lake',           bestMonths: [4, 5, 6, 10, 11],     avoidMonths: [1, 2, 7, 8, 12], altitudeTier: 'high', note: '5,430m; closed by deep-winter snow & monsoon' },
    { name: 'Nathula Pass Adventure',     bestMonths: [4, 5, 6, 9, 10],      avoidMonths: [1, 2, 7, 8],    altitudeTier: 'high', note: 'open Wed–Sun; heavy snow shuts it Dec–Feb' },
    { name: 'Tsomgo Lake Yak Ride',       bestMonths: [3, 4, 5, 10, 11, 12], avoidMonths: [7, 8],          altitudeTier: 'high', note: 'frozen snow scenery Dec–Feb; flowers in spring' },
    { name: 'Zuluk Silk Route',           bestMonths: [3, 4, 10, 11, 12],    avoidMonths: [7, 8, 9],       altitudeTier: 'high', note: 'autumn peaks / winter snow; monsoon landslides' },
    { name: 'Ravangla Buddha Park',       bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'pleasant spring & clear autumn hilltop views' },
    { name: 'Namchi Char Dham',           bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'all-season pilgrimage; best mild spring/autumn' },
    { name: 'Yuksom Trekking Base',       bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'Dzongri/Goecha La base; monsoon trails unsafe' },
    { name: 'Geyzing Local Culture',      bestMonths: [3, 4, 5, 10, 11, 12], avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'West Sikkim town; pleasant spring/autumn' },
    { name: 'Aritar Lake Boating',        bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'East Sikkim lake; good spring/autumn boating' },
    { name: 'Rinchenpong Village',        bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'Oct–Nov peak season for clear views' },
    { name: 'Mangan North Sikkim',        bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'North Sikkim gateway; monsoon landslide roads' },
    { name: 'Chungthang Confluence',      bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'en route to Lachen/Lachung; avoid monsoon' },
    { name: 'Thangu Valley Stay',         bestMonths: [5, 6, 10, 11],        avoidMonths: [1, 2, 7, 8, 12], altitudeTier: 'high', note: 'alpine flowers May–Jun; snowbound in winter' },
    { name: 'Chopta Valley Trek',         bestMonths: [4, 5, 6, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'high', note: 'alpine meadows late spring, snow in winter' },
    { name: 'Mt. Katao Snow Point',       bestMonths: [3, 4, 5, 6, 12, 1],   avoidMonths: [7, 8],          altitudeTier: 'high', note: 'snow year-round; Dec–Feb for snow play' },
    { name: 'Kala Patthar Snow',          bestMonths: [3, 4, 5, 6, 12, 1],   avoidMonths: [7, 8],          altitudeTier: 'high', note: 'year-round snow point near Lachen' },
    { name: 'Zero Point Yumesamdong',     bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [1, 2, 7, 8, 12], altitudeTier: 'high', note: 'snow-covered spring; road closes deep winter' },
    { name: 'Baba Mandir Visit',          bestMonths: [4, 5, 6, 9, 10],      avoidMonths: [1, 2, 7, 8],    altitudeTier: 'high', note: 'on Nathula road; heavy snow closes Dec–Feb' },
    { name: 'Rumtek Monastery',           bestMonths: [3, 4, 5, 10, 11, 12], avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'near Gangtok, all-season; clearest spring/autumn' },
    { name: 'Enchey Monastery',           bestMonths: [3, 4, 5, 10, 11, 12], avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'in Gangtok; Cham dance around Jan' },
    { name: 'Tashiding Monastery',        bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'hilltop monastery; Bhumchu festival late winter' },
    { name: 'Pemayangtse Monastery',      bestMonths: [3, 4, 5, 10, 11, 12], avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'near Pelling; clear Kanchenjunga autumn/spring' },
    { name: 'Khecheopalri Wish Lake',     bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'sacred forest lake; monsoon leeches & rain' },
    { name: 'Kanchenjunga Falls',         bestMonths: [3, 4, 5, 6, 10, 11],  avoidMonths: [8],             altitudeTier: 'mid',  note: 'strong flow after rains; spring/autumn access' },
    { name: 'Singshore Bridge Walk',      bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'gorge views clearest spring/autumn' },
    { name: 'Temi Tea Garden',            bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'lush green flush spring; clear autumn views' },
    { name: 'Samdruptse Hill',            bestMonths: [3, 4, 5, 10, 11],     avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'Guru Rinpoche statue; spring/autumn clear views' },
    { name: 'Maenam Wildlife Trek',       bestMonths: [3, 4, 5, 10, 11, 12], avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'rhododendrons/orchids spring; Oct–mid-Dec' },
    { name: 'Barsey Rhododendron Trek',   bestMonths: [3, 4, 5],             avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'rhododendrons peak Mar–Apr' },
    { name: 'Seven Sisters Waterfalls',   bestMonths: [6, 7, 9, 10, 11],     avoidMonths: [3],             altitudeTier: 'low',  note: 'fullest flow in the rains; great Sep–Nov' },
    { name: 'Banjhakri Falls',            bestMonths: [6, 7, 9, 10, 11],     avoidMonths: [3],             altitudeTier: 'low',  note: 'near Gangtok; most impressive after monsoon' },
    { name: 'Tashi View Point',           bestMonths: [3, 4, 5, 10, 11, 12], avoidMonths: [7, 8],          altitudeTier: 'mid',  note: 'Kanchenjunga sunrise clearest autumn/winter' },
];

// Every place name, for the "+N locations" full list.
export const ALL_PLACE_NAMES: string[] = SEASONAL_PLACES.map((p) => p.name);

export type CategoryKey = 'monasteries' | 'lakes' | 'valleys' | 'treks';

export interface PlaceCategory {
    key: CategoryKey;
    emoji: string;
    label: string;
    places: string[]; // exact names from SEASONAL_PLACES
}

// Groups every destination by type, for the searchable "explore all" panel.
export const PLACE_CATEGORIES: PlaceCategory[] = [
    {
        key: 'monasteries',
        emoji: '⛩️',
        label: 'Monasteries & Spiritual',
        places: [
            'Rumtek Monastery', 'Enchey Monastery', 'Pemayangtse Monastery',
            'Tashiding Monastery', 'Lachen Monastery', 'Ravangla Buddha Park',
            'Namchi Char Dham', 'Samdruptse Hill', 'Baba Mandir Visit',
        ],
    },
    {
        key: 'lakes',
        emoji: '🌊',
        label: 'Lakes & Falls',
        places: [
            'Gurudongmar Lake', 'Tsomgo Lake Yak Ride', 'Khecheopalri Wish Lake',
            'Aritar Lake Boating', 'Kanchenjunga Falls', 'Seven Sisters Waterfalls',
            'Banjhakri Falls',
        ],
    },
    {
        key: 'valleys',
        emoji: '⛰️',
        label: 'Valleys & Passes',
        places: [
            'Yumthang Valley of Flowers', 'Lachung Valley', 'Zero Point Yumesamdong',
            'Nathula Pass Adventure', 'Zuluk Silk Route', 'Thangu Valley Stay',
            'Chopta Valley Trek', 'Chungthang Confluence', 'Mt. Katao Snow Point',
            'Kala Patthar Snow',
        ],
    },
    {
        key: 'treks',
        emoji: '🥾',
        label: 'Treks & Villages',
        places: [
            'Yuksom Trekking Base', 'Barsey Rhododendron Trek', 'Maenam Wildlife Trek',
            'Singshore Bridge Walk', 'Pelling Skywalk', 'Tashi View Point',
            'Temi Tea Garden', 'Rinchenpong Village', 'Geyzing Local Culture',
            'Mangan North Sikkim', 'Gangtok Nightlife',
        ],
    },
];

/** Human season label for a given 1–12 month, tuned to Sikkim's travel calendar. */
export function getSeason(month: number): SikkimSeason {
    switch (month) {
        case 12:
        case 1:
        case 2:
            return { key: 'winter',      emoji: '❄️', tagline: 'snow season in the hills' };
        case 3:
        case 4:
            return { key: 'spring',      emoji: '🌸', tagline: 'rhododendrons in bloom' };
        case 5:
            return { key: 'spring',      emoji: '🌿', tagline: 'warm, green & clear' };
        case 6:
            return { key: 'summer',      emoji: '☀️', tagline: 'pre-monsoon high season' };
        case 7:
        case 8:
            return { key: 'monsoon',     emoji: '🌧️', tagline: 'lush, low-altitude & waterfalls' };
        case 9:
            return { key: 'postMonsoon', emoji: '🍃', tagline: 'fresh after the monsoon' };
        case 10:
        case 11:
        default:
            return { key: 'autumn',      emoji: '🍂', tagline: 'clearest mountain views' };
    }
}

const tierRank: Record<AltitudeTier, number> = { low: 0, mid: 1, high: 2 };

/**
 * Season-aware picks for the "Popular right now" row.
 * Drops anything risky/closed this month, leads with places that are at their
 * best, and backfills with safe lower-altitude spots (so we don't surface a
 * snowed-in high pass just to hit the count).
 */
export function getSeasonalPicks(date: Date = new Date()): {
    season: SikkimSeason;
    picks: SeasonalPlace[];
} {
    const month = date.getMonth() + 1;
    const season = getSeason(month);

    const eligible = SEASONAL_PLACES.filter((p) => !p.avoidMonths.includes(month));
    const best = eligible.filter((p) => p.bestMonths.includes(month));
    const rest = eligible
        .filter((p) => !p.bestMonths.includes(month))
        .sort((a, b) => tierRank[a.altitudeTier] - tierRank[b.altitudeTier]);

    return { season, picks: [...best, ...rest] };
}
