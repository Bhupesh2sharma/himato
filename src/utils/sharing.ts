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
