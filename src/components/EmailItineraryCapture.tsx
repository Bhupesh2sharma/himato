import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { track } from '../utils/analytics';

interface EmailItineraryCaptureProps {
    itineraryData: any;
    onCaptured?: (email: string) => void;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;

/**
 * Post-result email capture.
 *
 * Why this exists: the moment a guest sees their generated itinerary is the
 * single highest-intent moment in the funnel. We trade an email for a
 * concrete reward (PDF in inbox) instead of asking them to "create an
 * account" for vague benefits. Account creation is still offered as a
 * secondary link below the primary ask.
 *
 * Pipeline: Web3Forms (https://web3forms.com). Free, no API key in code,
 * just an access key in env. Submissions land in your inbox; you send the
 * PDFs by hand for the first 30-50 emails (this is a feature, not a bug).
 * When you outgrow it, swap to Brevo/Resend without changing the UI.
 */
export function EmailItineraryCapture({ itineraryData, onCaptured }: EmailItineraryCaptureProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setStatus('error');
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        if (!WEB3FORMS_ACCESS_KEY) {
            console.error('VITE_WEB3FORMS_ACCESS_KEY is not set. Add it to .env.local.');
            setStatus('error');
            setErrorMsg("We can't send right now. Please try again in a minute.");
            return;
        }

        setStatus('submitting');
        setErrorMsg('');

        try {
            // Build a compact, human-readable summary of the itinerary so the
            // inbound email actually contains the plan (not just metadata).
            const days = itineraryData?.days ?? [];
            const summary = days
                .map((d: any) => {
                    const acts = (d.activities ?? [])
                        .map((a: any) => `  - ${a.time ?? ''} ${a.title ?? ''} (${a.location ?? ''})`)
                        .join('\n');
                    return `Day ${d.day}: ${d.title}\n${acts}`;
                })
                .join('\n\n');

            const formData = new FormData();
            formData.append('access_key', WEB3FORMS_ACCESS_KEY);
            formData.append('subject', `[Himato] PDF requested by ${email}`);
            formData.append('from_name', 'Himato — PDF Requests');
            formData.append('email', email);
            formData.append('itinerary_days', String(days.length));
            formData.append('itinerary_summary', summary || 'No itinerary content captured.');
            formData.append('source', document.referrer || 'direct');
            formData.append('page_path', window.location.pathname);

            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData,
            });

            const json = await res.json();

            if (!res.ok || !json?.success) {
                throw new Error(json?.message || 'Submission failed.');
            }

            track('pdf_email_requested', {
                email_domain: email.split('@')[1] ?? 'unknown',
                itinerary_days: days.length,
            });

            onCaptured?.(email);
            setStatus('success');
        } catch (err: any) {
            console.error('EmailItineraryCapture submit failed:', err);
            setStatus('error');
            setErrorMsg("Something went wrong. Try again, or copy your share link instead.");
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                id="email-capture"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-ai-secondary/20 to-ai-accent/5 border border-ai-accent/20 text-center relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles className="w-32 h-32 text-ai-accent" />
                </div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ai-accent/10 border border-ai-accent/20 mb-4">
                        <Check className="w-7 h-7 text-ai-accent" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-ai-text mb-3">
                        Check your inbox
                    </h3>
                    <p className="text-ai-muted mb-6 text-sm sm:text-base">
                        We'll email your printable Sikkim itinerary to <span className="text-ai-text font-medium">{email}</span> within the next few minutes. Permits, maps, and the full day-by-day plan included.
                    </p>
                    <p className="text-xs text-ai-muted">
                        Want to edit this trip later or save more itineraries?{' '}
                        <Link to="/register" className="text-ai-accent hover:underline font-medium">
                            Create a free account
                        </Link>
                        .
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            id="email-capture"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-ai-secondary/20 to-ai-accent/5 border border-ai-accent/20 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles className="w-32 h-32 text-ai-accent" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ai-accent/10 border border-ai-accent/20 mb-4">
                    <Mail className="w-7 h-7 text-ai-accent" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-ai-text mb-3">
                    Want this itinerary in your inbox?
                </h3>
                <p className="text-ai-muted mb-8 text-sm sm:text-base">
                    We'll email a printable PDF with maps, permit info, and the full day-by-day plan. No spam, no signup needed.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                    <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (status === 'error') setStatus('idle');
                        }}
                        placeholder="you@gmail.com"
                        disabled={status === 'submitting'}
                        className="flex-1 px-5 py-3 rounded-full bg-white text-ai-text placeholder-ai-muted/60 border border-black/10 focus:outline-none focus:border-ai-accent/60 focus:ring-2 focus:ring-ai-accent/20 transition disabled:opacity-50"
                        aria-label="Email address"
                    />
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="px-6 py-3 bg-ai-accent hover:bg-ai-secondary text-white rounded-full font-bold transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {status === 'submitting' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending…
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4" />
                                Email me the PDF
                            </>
                        )}
                    </button>
                </form>

                {status === 'error' && errorMsg && (
                    <div className="mt-4 inline-flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2">
                        <AlertCircle className="w-4 h-4" />
                        {errorMsg}
                    </div>
                )}

                <p className="text-xs text-ai-muted mt-6">
                    Or{' '}
                    <Link to="/register" className="text-ai-accent hover:underline font-medium">
                        create a free account
                    </Link>{' '}
                    to save and edit it later.
                </p>
            </div>
        </motion.div>
    );
}
