// Sikkim's travel seasons — drives the "Popular right now" header and the
// chat widget's seasonal opener.

export interface SikkimSeason {
    key: 'winter' | 'spring' | 'summer' | 'monsoon' | 'postMonsoon' | 'autumn';
    emoji: string;
    tagline: string; // shown next to "Popular right now"
}

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
