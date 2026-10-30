// The AI marks the one must-know detail in a piece of text as ==like this==.
// <Highlighted> draws those as a highlighter stroke; stripHighlights() removes
// the markers for plain-text outputs (copy, PDF).
const MARKER = /==(.+?)==/g;

// Older itineraries have no markers — fall back to highlighting hard facts:
// altitudes / distances, durations, and permit mentions.
const AUTO = /(\b\d[\d,.]*\s?(?:m|km|ft)\b|~\s?\d[\d,.]*\s?(?:m|km|ft)\b|\b\d+(?:\s?[–-]\s?\d+)?\s?(?:hours?|hrs?|mins?|minutes)\b|\b(?:Protected Area Permit|Inner Line Permit|PAP|ILP|permits?)\b)/gi;

export type HighlightSegment = { text: string; highlight: boolean };

export function stripHighlights(text: string | undefined | null): string {
    return (text ?? '').replace(MARKER, '$1');
}

/** Split text into plain / highlighted runs (explicit ==markers==, else auto facts). */
export function splitHighlights(text: string | undefined | null, auto = true): HighlightSegment[] {
    const value = text ?? '';
    const hasMarkers = /==.+?==/.test(value);
    const pattern = hasMarkers ? MARKER : auto ? AUTO : null;
    if (!pattern) return [{ text: value, highlight: false }];

    const segments: HighlightSegment[] = [];
    let last = 0;
    for (const match of value.matchAll(new RegExp(pattern.source, pattern.flags))) {
        const start = match.index ?? 0;
        if (start > last) segments.push({ text: value.slice(last, start), highlight: false });
        segments.push({ text: hasMarkers ? match[1] : match[0], highlight: true });
        last = start + match[0].length;
    }
    if (last < value.length) segments.push({ text: value.slice(last), highlight: false });
    return segments;
}
