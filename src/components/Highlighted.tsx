import { splitHighlights } from '../utils/highlights';

/** Renders text with its must-know details drawn as a highlighter stroke. */
export function Highlighted({ text, auto = true }: { text: string | undefined | null; auto?: boolean }) {
    return (
        <>
            {splitHighlights(text, auto).map((seg, i) =>
                seg.highlight ? <mark key={i} className="hl">{seg.text}</mark> : <span key={i}>{seg.text}</span>
            )}
        </>
    );
}
