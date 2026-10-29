// Display metadata for "Popular right now" places. The places themselves are
// managed from the admin panel (/manage-himato/places) and served by /api/places.
import type { PlaceCategory } from '../services/api';

export const PLACE_CATEGORY_META: Record<PlaceCategory, { emoji: string; label: string }> = {
    monasteries: { emoji: '⛩️', label: 'Monasteries & Spiritual' },
    lakes:       { emoji: '🌊', label: 'Lakes & Falls' },
    valleys:     { emoji: '⛰️', label: 'Valleys & Passes' },
    treks:       { emoji: '🥾', label: 'Treks & Villages' },
};

export const PLACE_CATEGORY_KEYS = Object.keys(PLACE_CATEGORY_META) as PlaceCategory[];
