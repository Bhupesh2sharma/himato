import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Mail, Loader2, Check, AlertCircle, Download } from 'lucide-react';
import { track } from '../utils/analytics';

/**
 * Floating "Free Sikkim Guide" lead magnet for cold visitors.
 *
 * Why this exists: a fraction of landing-page traffic isn't ready to plan a
 * trip *today* but will plan one in 1–6 months. The Hidden Gems PDF gives
 * them something useful now in exchange for an email — turning otherwise-
 * lost visitors into a list we can re-engage with.
 *
 * Pipeline: same Web3Forms account as EmailItineraryCapture. Optional second
 * form key (VITE_WEB3FORMS_LEAD_MAGNET_KEY) keeps lead-magnet leads in their
 * own inbox; falls back to the main key if not set.
 *
 * Behavior:
 *   • Pill stays bottom-right while the user is on the landing page.
 *   • If dismissed or captured, hides for 30 days via localStorage.
 *   • Modal asks for email + first name, fires lead_magnet_downloaded on
 *     success, then surfaces a direct download button so the user gets the
 *     PDF instantly (no waiting on inbox delivery).
 */

const STORAGE_KEY = 'himato_lead_magnet_state'; // JSON: { status: 'captured'|'dismissed', at: ISO }
const HIDE_FOR_DAYS = 30;

const WEB3FORMS_KEY =
    (import.meta.env.VITE_WEB3FORMS_LEAD_MAGNET_KEY as string | undefined) ||
    (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined);

const PDF_URL =
    (import.meta.env.VITE_HIDDEN_GEMS_PDF_URL as string | undefined) ||
    '/Hidden_Gems_of_Sikkim.pdf';

type Status = 'idle' | 'submitting' | 'success' | 'error';

function shouldShowPill(): boolean {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return true;
        const parsed = JSON.parse(raw) as { status: string; at: string };
        const ageDays = (Date.now() - new Date(parsed.at).getTime()) / (1000 * 60 * 60 * 24);
        return ageDays > HIDE_FOR_DAYS;
    } catch {
        return true;
    }
}

function rememberState(status: 'captured' | 'dismissed') {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ status, at: new Date().toISOString() })
        );
    } catch {
        /* noop */
    }
}

export function HiddenGemsLeadMagnet() {
    const [visible, setVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Reveal the pill after a short delay so it doesn't fight with the hero
    // entrance animation. Skip entirely if user has already dismissed/captured.
    useEffect(() => {
        if (!shouldShowPill()) return;
        const t = setTimeout(() => setVisible(true), 1800);
        return () => clearTimeout(t);
    }, []);

    const handleDismiss = () => {
        rememberState('dismissed');
        setVisible(false);
    };

    const openModal = () => {
        setOpen(true);
        setStatus('idle');
        setErrorMsg('');
    };

    const closeModal = () => {
        if (status === 'submitting') return;
        setOpen(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setStatus('error');
            setErrorMsg('Please enter a valid email address.');
            return;
        }
        if (!WEB3FORMS_KEY) {
            console.error('No Web3Forms key set for the lead magnet.');
            setStatus('error');
            setErrorMsg("We can't send right now. Please try again in a minute.");
            return;
        }

        setStatus('submitting');
        setErrorMsg('');

        try {
            const formData = new FormData();
            formData.append('access_key', WEB3FORMS_KEY);
            formData.append('subject', `[Himato Lead Magnet] ${firstName || 'Guest'} requested Hidden Gems PDF`);
            formData.append('from_name', 'Himato — Lead Magnet');
            formData.append('email', email);
            formData.append('first_name', firstName || '');
            formData.append('magnet', '15 Hidden Gems of Sikkim');
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

            track('lead_magnet_downloaded', {
                magnet: 'hidden_gems_sikkim',
                email_domain: email.split('@')[1] ?? 'unknown',
                has_first_name: Boolean(firstName),
            });

            rememberState('captured');
            setStatus('success');
        } catch (err: any) {
            console.error('HiddenGemsLeadMagnet submit failed:', err);
            setStatus('error');
            setErrorMsg('Something went wrong. Try again in a moment.');
        }
    };

    if (!visible) return null;

    return (
        <>
            {/* Floating pill */}
            <AnimatePresence>
                {visible && !open && (
                    <motion.div
                        key="lead-magnet-pill"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[60] flex items-center gap-2"
                    >
                        <button
                            onClick={openModal}
                            aria-label="Get the free Sikkim guide"
                            className="group flex items-center gap-3 pl-3 pr-5 py-3 rounded-full shadow-2xl backdrop-blur-md transition-all hover:scale-[1.03] active:scale-[0.99]"
                            style={{
                                background: '#f6f1e7',
                                color: '#0e1116',
                                border: '1px solid rgba(0,0,0,0.08)',
                                boxShadow: '0 14px 30px -10px rgba(0,0,0,0.45)',
                            }}
                        >
                            <span
                                className="flex items-center justify-center w-9 h-9 rounded-full"
                                style={{ background: '#2f4a3a', color: '#f6f1e7' }}
                            >
                                <BookOpen className="w-4 h-4" />
                            </span>
                            <span className="flex flex-col items-start leading-tight">
                                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#b89559' }}>
                                    Free guide
                                </span>
                                <span className="text-sm font-bold">15 Hidden Gems of Sikkim</span>
                            </span>
                        </button>
                        <button
                            onClick={handleDismiss}
                            aria-label="Dismiss"
                            className="flex items-center justify-center w-7 h-7 rounded-full transition-all hover:scale-105"
                            style={{
                                background: 'rgba(255,255,255,0.85)',
                                color: '#0e1116',
                                border: '1px solid rgba(0,0,0,0.08)',
                            }}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal */}
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                            style={{ background: '#f6f1e7', color: '#0e1116' }}
                        >
                            {/* Header band */}
                            <div className="px-7 pt-7 pb-6" style={{ background: '#2f4a3a', color: '#f6f1e7' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <span
                                        className="text-[10px] tracking-[0.2em] uppercase font-bold"
                                        style={{ color: '#b89559' }}
                                    >
                                        Free guide · 20 pages
                                    </span>
                                    <button
                                        onClick={closeModal}
                                        aria-label="Close"
                                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                                    15 Hidden Gems
                                    <br />
                                    of Sikkim.
                                </h3>
                                <p className="text-sm mt-2" style={{ color: 'rgba(246,241,231,0.75)' }}>
                                    The valleys, monasteries, and viewpoints most tourists never see — with permits, best season, and a local tip per spot.
                                </p>
                            </div>

                            {/* Form / success body */}
                            <div className="px-7 py-6">
                                {status === 'success' ? (
                                    <div className="text-center">
                                        <div
                                            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                                            style={{ background: 'rgba(47,74,58,0.1)', color: '#2f4a3a' }}
                                        >
                                            <Check className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-lg font-bold mb-1">Your guide is ready</h4>
                                        <p className="text-sm mb-5" style={{ color: '#5c6470' }}>
                                            We've also sent a copy to <span className="font-medium" style={{ color: '#0e1116' }}>{email}</span>.
                                        </p>
                                        <a
                                            href={PDF_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => closeModal()}
                                            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-bold transition-all hover:scale-[1.02]"
                                            style={{ background: '#2f4a3a', color: '#f6f1e7' }}
                                        >
                                            <Download className="w-4 h-4" />
                                            Download the PDF
                                        </a>
                                        <p className="text-[11px] mt-4" style={{ color: '#5c6470' }}>
                                            When you're ready to plan the actual trip, type any of these spots into Himato — we'll build a full day-by-day in 60 seconds.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <div>
                                            <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5" style={{ color: '#5c6470' }}>
                                                First name <span style={{ color: '#b89559' }}>(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                disabled={status === 'submitting'}
                                                placeholder="Spacey"
                                                className="w-full px-4 py-3 rounded-xl bg-white border focus:outline-none focus:ring-2 transition disabled:opacity-50"
                                                style={{ borderColor: 'rgba(0,0,0,0.1)', color: '#0e1116' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5" style={{ color: '#5c6470' }}>
                                                Email
                                            </label>
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
                                                disabled={status === 'submitting'}
                                                placeholder="you@gmail.com"
                                                className="w-full px-4 py-3 rounded-xl bg-white border focus:outline-none focus:ring-2 transition disabled:opacity-50"
                                                style={{ borderColor: 'rgba(0,0,0,0.1)', color: '#0e1116' }}
                                            />
                                        </div>

                                        {status === 'error' && errorMsg && (
                                            <div
                                                className="flex items-center gap-2 text-xs rounded-xl px-3 py-2"
                                                style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                {errorMsg}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={status === 'submitting'}
                                            className="w-full py-3.5 rounded-full font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                            style={{ background: '#2f4a3a', color: '#f6f1e7' }}
                                        >
                                            {status === 'submitting' ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Sending…
                                                </>
                                            ) : (
                                                <>
                                                    <Mail className="w-4 h-4" />
                                                    Send me the free guide
                                                </>
                                            )}
                                        </button>

                                        <p className="text-[11px] text-center" style={{ color: '#5c6470' }}>
                                            No spam. Unsubscribe anytime.
                                        </p>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
