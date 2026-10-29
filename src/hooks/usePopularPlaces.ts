import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import type { PopularPlace } from '../services/api';

// Admin-managed "Popular right now" places, already sorted by priority.
// Cached for the session so the Hero and landing page share one request.
let cache: Promise<PopularPlace[]> | null = null;

const fetchPlaces = () => {
    if (!cache) {
        cache = apiClient
            .getPopularPlaces()
            .then((res) => res.data.places)
            .catch((err) => {
                cache = null; // allow a retry on next mount
                console.error('Failed to load popular places:', err);
                return [];
            });
    }
    return cache;
};

export function usePopularPlaces() {
    const [places, setPlaces] = useState<PopularPlace[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchPlaces().then((list) => {
            if (cancelled) return;
            setPlaces(list);
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return { places, loading };
}
