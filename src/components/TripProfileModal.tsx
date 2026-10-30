import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CalendarDays, Users, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { track } from '../utils/analytics';
import { markTripProfileSkipped } from '../utils/tripProfile';

const GROUP_SIZES = [
    { value: '1', label: 'Just me' },
    { value: '2', label: '2' },
    { value: '3-4', label: '3–4' },
    { value: '5-8', label: '5–8' },
    { value: '9+', label: '9+' },
];

/** The next 12 months as "YYYY-MM" options, plus "not sure". */
const useMonthOptions = () =>
    useMemo(() => {
        const now = new Date();
        const months = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            return {
                value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
            };
        });
        return [...months, { value: 'not-sure', label: 'Not sure yet' }];
    }, []);

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Three quick questions right after a traveller unlocks their plan: when,
 * how many, and (optionally) a WhatsApp number. Turns a sign-up into a lead
 * an agent can act on. The number is only passed to agents when the
 * traveller asks for quotes.
 */
export function TripProfileModal({ isOpen, onClose }: Props) {
    const { user, updateProfile } = useAuth();
    const months = useMonthOptions();
    const [travelMonth, setTravelMonth] = useState('');
    const [groupSize, setGroupSize] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const skip = () => {
        if (user) markTripProfileSkipped(user.id);
        track('trip_profile_skipped');
        onClose();
    };

    const save = async () => {
        if (!travelMonth || !groupSize || saving) return;
        setSaving(true);
        setError('');
        try {
            await updateProfile({ travelProfile: { travelMonth, groupSize, whatsapp: whatsapp.trim() || undefined } });
            track('trip_profile_completed', { travel_month: travelMonth, group_size: groupSize, has_whatsapp: Boolean(whatsapp.trim()) });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const chip = (active: boolean) =>
        `px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors ${active
            ? 'bg-ai-accent text-white border-ai-accent'
            : 'bg-white text-ai-text border-black/10 hover:border-ai-accent/50'}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm" onClick={skip}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="bg-ai-card rounded-3xl w-full max-w-md shadow-2xl border border-black/8 flex flex-col"
                        style={{ maxHeight: 'min(90vh, 680px)' }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-labelledby="trip-profile-title"
                    >
                        <header className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-black/8">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-ai-accent font-bold">Your plan is unlocked</p>
                                <h3 id="trip-profile-title" className="text-lg font-bold text-ai-text">Tell us about your trip</h3>
                                <p className="text-xs text-ai-muted mt-0.5">Two quick taps, so we can tailor tips and agent quotes to you.</p>
                            </div>
                            <button onClick={skip} className="text-ai-muted hover:text-ai-text" aria-label="Skip">
                                <X className="w-5 h-5" />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                            <label className="block">
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ai-muted mb-2">
                                    <CalendarDays className="w-4 h-4 text-ai-accent" />When are you travelling?
                                </span>
                                <select
                                    value={travelMonth}
                                    onChange={(e) => setTravelMonth(e.target.value)}
                                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm text-ai-text focus:outline-none focus:border-ai-accent"
                                >
                                    <option value="" disabled>Pick a month</option>
                                    {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </label>

                            <div>
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ai-muted mb-2">
                                    <Users className="w-4 h-4 text-ai-accent" />How many people?
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {GROUP_SIZES.map((g) => (
                                        <button key={g.value} type="button" onClick={() => setGroupSize(g.value)} className={chip(groupSize === g.value)} aria-pressed={groupSize === g.value}>
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label className="block">
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ai-muted mb-2">
                                    <Phone className="w-4 h-4 text-ai-accent" />WhatsApp number <span className="normal-case tracking-normal font-medium">(optional)</span>
                                </span>
                                <input
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="98765 43210"
                                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm text-ai-text placeholder:text-ai-muted/60 focus:outline-none focus:border-ai-accent"
                                />
                                <span className="block text-[11px] text-ai-muted mt-1.5">
                                    Only shared with a local agent if you ask for quotes.
                                </span>
                            </label>

                            {error && <p className="text-sm text-red-600">{error}</p>}
                        </div>

                        <footer className="px-6 py-4 border-t border-black/8 flex items-center gap-3">
                            <button onClick={skip} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-ai-muted hover:text-ai-text">
                                Skip
                            </button>
                            <button
                                onClick={save}
                                disabled={!travelMonth || !groupSize || saving}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-ai-accent text-white text-sm font-bold hover:bg-ai-secondary transition-colors disabled:opacity-50"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
