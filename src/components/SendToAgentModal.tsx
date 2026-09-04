import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Phone, Users, MapPin, BadgeCheck } from 'lucide-react';
import { apiClient } from '../services/api';

interface Agent {
    _id: string;
    name: string;
    businessName: string;
    location?: string;
}

// Deterministic avatar accent per agent so the list feels varied and human.
const AVATAR_ACCENTS = [
    'linear-gradient(135deg, #2f4a3a, #1a2e23)',
    'linear-gradient(135deg, #5a7a2a, #3c5219)',
    'linear-gradient(135deg, #c9a961, #8a6e25)',
    'linear-gradient(135deg, #b73f25, #7d2a17)',
];

const initialsOf = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'A';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: any; // itinerary data (with days)
    preselectAgentId?: string; // open with this agent already ticked
}

/**
 * Tourist-facing: pick one or more registered travel agents and send them the
 * itinerary + a callback request. Each selected agent gets a lead in their
 * dashboard and an email.
 */
export function SendToAgentModal({ isOpen, onClose, data, preselectAgentId }: Props) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState<number | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setDone(null);
        setError('');
        setSelected(new Set(preselectAgentId ? [preselectAgentId] : []));
        setLoadingAgents(true);
        apiClient
            .getRegisteredAgents()
            .then((res) => setAgents(res.data.agents || []))
            .catch(() => setError('Could not load travel agents. Please try again.'))
            .finally(() => setLoadingAgents(false));
    }, [isOpen]);

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const canSubmit = selected.size > 0 && form.name.trim() && form.phone.trim() && !submitting;

    const submit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await apiClient.createLead({
                agentIds: [...selected],
                touristName: form.name.trim(),
                touristPhone: form.phone.trim(),
                touristEmail: form.email.trim() || undefined,
                message: form.message.trim() || undefined,
                itineraryData: data,
            });
            setDone(res.data.count);
        } catch (err: any) {
            setError(err.message || 'Could not send. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls =
        'w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm text-ai-text placeholder:text-ai-muted/60 focus:outline-none focus:border-ai-accent transition-colors';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="bg-ai-card rounded-3xl w-full max-w-lg shadow-2xl border border-black/8 flex flex-col"
                        style={{ maxHeight: 'min(90vh, 720px)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <header className="flex items-center justify-between px-6 py-4 border-b border-black/8">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.18em] text-ai-accent font-bold">Get quotes</p>
                                <h3 className="text-lg font-bold text-ai-text">Send to a travel agent</h3>
                                <p className="text-xs text-ai-muted mt-0.5">Vetted Sikkim agencies — they'll call you back with a custom quote.</p>
                            </div>
                            <button onClick={onClose} className="text-ai-muted hover:text-ai-text" aria-label="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </header>

                        {done !== null ? (
                            <div className="px-6 py-8 text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #2f4a3a, #1a2e23)' }}
                                >
                                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                                </motion.div>
                                <h4 className="text-2xl font-bold text-ai-text">
                                    Request sent{form.name ? `, ${form.name.trim().split(' ')[0]}` : ''}!
                                </h4>
                                <p className="text-sm text-ai-muted mt-1.5">
                                    Your itinerary is on its way to {done} {done === 1 ? 'agent' : 'agents'}.
                                </p>

                                {/* Who it went to — concrete + reassuring */}
                                <div className="flex flex-wrap justify-center gap-2 mt-4">
                                    {agents.filter((a) => selected.has(a._id)).map((a, i) => (
                                        <span key={a._id} className="inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full bg-ai-dark border border-black/8">
                                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-none"
                                                style={{ background: AVATAR_ACCENTS[i % AVATAR_ACCENTS.length] }}>
                                                {initialsOf(a.businessName)}
                                            </span>
                                            <span className="text-xs font-semibold text-ai-text">{a.businessName}</span>
                                        </span>
                                    ))}
                                </div>

                                {/* Callback reminder */}
                                {form.phone && (
                                    <div className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ai-accent/8 border border-ai-accent/20">
                                        <Phone className="w-4 h-4 text-ai-accent" />
                                        <span className="text-sm text-ai-text">Keep your phone handy — they'll call <span className="font-bold">{form.phone}</span></span>
                                    </div>
                                )}

                                <button onClick={onClose} className="mt-6 w-full px-6 py-3 rounded-xl bg-ai-accent text-white text-sm font-bold hover:bg-ai-secondary transition-colors">
                                    Done
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                                    {/* Agent picker */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-bold uppercase tracking-wider text-ai-muted">Choose agents</p>
                                            {selected.size > 0 && (
                                                <span className="text-[11px] font-semibold text-ai-accent">{selected.size} selected</span>
                                            )}
                                        </div>
                                        {loadingAgents ? (
                                            <div className="flex items-center justify-center py-8 text-ai-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>
                                        ) : agents.length === 0 ? (
                                            <div className="flex flex-col items-center text-center py-8 text-ai-muted">
                                                <Users className="w-8 h-8 mb-2 opacity-50" />
                                                <p className="text-sm">No travel agents are available yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                {agents.map((a, i) => {
                                                    const isSel = selected.has(a._id);
                                                    return (
                                                        <button
                                                            key={a._id}
                                                            onClick={() => toggle(a._id)}
                                                            className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                                                                isSel
                                                                    ? 'border-ai-accent bg-ai-accent/5 ring-1 ring-ai-accent/30'
                                                                    : 'border-black/8 hover:border-ai-accent/40 hover:shadow-[0_8px_20px_-14px_rgba(47,74,58,0.4)]'
                                                            }`}
                                                        >
                                                            {/* Avatar */}
                                                            <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold flex-none shadow-sm"
                                                                style={{ background: AVATAR_ACCENTS[i % AVATAR_ACCENTS.length] }}>
                                                                {initialsOf(a.businessName)}
                                                            </span>
                                                            {/* Info */}
                                                            <span className="flex-1 min-w-0">
                                                                <span className="flex items-center gap-1.5">
                                                                    <span className="text-sm font-bold text-ai-text truncate">{a.businessName}</span>
                                                                    <BadgeCheck className="w-4 h-4 text-ai-accent flex-none" />
                                                                </span>
                                                                <span className="flex items-center gap-1.5 text-xs text-ai-muted mt-0.5">
                                                                    <MapPin className="w-3 h-3 flex-none" />
                                                                    {a.location || 'Gangtok, Sikkim'}
                                                                    <span className="text-black/15">·</span>
                                                                    <span className="text-ai-accent font-medium">Verified partner</span>
                                                                </span>
                                                            </span>
                                                            {/* Check */}
                                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center border flex-none transition-colors ${isSel ? 'bg-ai-accent border-ai-accent' : 'border-black/20'}`}>
                                                                {isSel && <Check className="w-3.5 h-3.5 text-white" />}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact form */}
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold uppercase tracking-wider text-ai-muted">Your details</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <input className={inputCls} placeholder="Your name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                            <input className={inputCls} placeholder="Phone number *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                        </div>
                                        <input className={inputCls} placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Anything the agent should know? (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                                    </div>

                                    {error && <p className="text-sm text-red-600">{error}</p>}
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-black/8">
                                    <button
                                        onClick={submit}
                                        disabled={!canSubmit}
                                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ai-accent text-white text-sm font-bold hover:bg-ai-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                                        {selected.size > 0 ? `Request callback from ${selected.size} agent${selected.size === 1 ? '' : 's'}` : 'Select agents to continue'}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
