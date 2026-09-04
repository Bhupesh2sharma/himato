import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import type { ItineraryPdfData } from './ItineraryPdf';

/**
 * Generates the branded itinerary PDF on click and downloads it. The heavy
 * @react-pdf/renderer library (and the PDF layout) are dynamically imported
 * only when the user actually clicks, so they stay out of the initial bundle.
 */
export function DownloadItineraryButton({
    data,
    className,
    label = 'Download PDF',
}: {
    data: ItineraryPdfData | null;
    className?: string;
    label?: string;
}) {
    const [busy, setBusy] = useState(false);

    const handle = async () => {
        if (!data || busy) return;
        setBusy(true);
        try {
            const [{ pdf }, { ItineraryPdf }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('./ItineraryPdf'),
            ]);
            const blob = await pdf(<ItineraryPdf data={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const base = (data.businessName || 'sikkim').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            a.download = `${base || 'sikkim'}-itinerary.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('PDF generation failed', e);
            alert('Could not generate the PDF. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <button onClick={handle} disabled={busy || !data} className={className}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            <span>{busy ? 'Preparing…' : label}</span>
        </button>
    );
}
