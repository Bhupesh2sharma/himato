// Small hand-drawn Sikkim motifs used as section backdrops.
import { useEffect, useRef, useState } from 'react';

// Lungta prayer flags — blue, white, red, green, yellow, always in this order.
const FLAG_COLOURS = ['#3d6ea8', '#efe9dc', '#b73f25', '#4a7a5e', '#d9a93c'];

/** A string of prayer flags sagging across the top of a section. */
export function PrayerFlags({ count = 28, className = '' }: { count?: number; className?: string }) {
    // Only animate while on screen — an off-screen animation still costs paint time
    const ref = useRef<SVGSVGElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Quadratic curve from the left edge to the right edge, sagging in the middle.
    const p0 = { x: -20, y: 14 };
    const p1 = { x: 720, y: 130 };
    const p2 = { x: 1460, y: 10 };
    const at = (t: number) => ({
        x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x,
        y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y,
    });
    const slope = (t: number) => {
        const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
        const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
        return (Math.atan2(dy, dx) * 180) / Math.PI;
    };

    return (
        <svg ref={ref} data-paused={visible ? undefined : ''} viewBox="0 0 1440 170" preserveAspectRatio="xMidYMin slice" className={className} aria-hidden="true">
            <g className="flag-string">
            <path d={`M${p0.x},${p0.y} Q${p1.x},${p1.y} ${p2.x},${p2.y}`} fill="none" stroke="rgba(239,233,220,0.35)" strokeWidth="1.2" />
            {Array.from({ length: count }, (_, i) => {
                const t = (i + 0.5) / count;
                const { x, y } = at(t);
                // Slight per-flag sway so the row doesn't look stamped out
                const sway = ((i * 37) % 7) - 3;
                // Each flag flutters on its own rhythm (see .flag-wave in index.css)
                const wave = { animationDuration: `${2.2 + ((i * 53) % 10) / 10}s`, animationDelay: `-${((i * 29) % 17) / 10}s` };
                return (
                    <g key={i} transform={`translate(${x} ${y}) rotate(${slope(t) + sway})`}>
                        <path className="flag-wave" style={wave} d="M-12,0 L12,0 L11,30 L1,27 L-10,31 Z" fill={FLAG_COLOURS[i % FLAG_COLOURS.length]} opacity={0.85} />
                    </g>
                );
            })}
            </g>
        </svg>
    );
}

/** A Himalayan ridgeline silhouette; fill it with the next section's background to blend. */
export function Ridgeline({ fill = '#0e1116', className = '' }: { fill?: string; className?: string }) {
    return (
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className={className} aria-hidden="true">
            <path
                fill={fill}
                d="M0,140 L0,96 L70,78 L120,88 L190,52 L240,66 L300,30 L338,44 L372,20 L410,48 L470,62 L540,40 L600,58 L660,34 L700,8 L736,30 L780,22 L840,54 L900,46 L960,70 L1020,50 L1080,62 L1130,36 L1170,48 L1230,28 L1290,60 L1350,52 L1400,74 L1440,66 L1440,140 Z"
            />
        </svg>
    );
}
