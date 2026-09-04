import LZString from 'lz-string';

export const encodeItineraryToUrl = (data: any): string => {
    try {
        const jsonString = JSON.stringify(data);
        const compressed = LZString.compressToEncodedURIComponent(jsonString);
        return `${window.location.origin}?plan=${compressed}`;
    } catch (error) {
        console.error('Error encoding itinerary:', error);
        return '';
    }
};

/**
 * Per-agent dashboard routing. Every registered travel agent gets a unique,
 * encoded path segment derived from their user id — /dashboard/<code>.
 * Uses the same lz-string scheme as itinerary sharing so it's URL-safe.
 */
export const encodeAgentId = (id: string): string => {
    try {
        return LZString.compressToEncodedURIComponent(id);
    } catch (error) {
        console.error('Error encoding agent id:', error);
        return '';
    }
};

export const decodeAgentId = (code: string): string | null => {
    try {
        return LZString.decompressFromEncodedURIComponent(code) || null;
    } catch (error) {
        console.error('Error decoding agent id:', error);
        return null;
    }
};

export const decodeItineraryFromUrl = (): any | null => {
    try {
        const params = new URLSearchParams(window.location.search);
        const compressed = params.get('plan');

        if (!compressed) return null;

        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (!decompressed) return null;

        return JSON.parse(decompressed);
    } catch (error) {
        console.error('Error decoding itinerary:', error);
        return null;
    }
};
