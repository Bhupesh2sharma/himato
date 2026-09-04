import { useEffect, useState } from 'react';
import { CheckCircle2, MessageSquarePlus, Send, Loader2, PartyPopper } from 'lucide-react';
import { apiClient } from '../services/api';

interface ThreadMessage {
    _id: string;
    from: 'client' | 'agent';
    body: string;
    dayRef?: number | null;
    authorName?: string;
    createdAt: string;
}

interface Props {
    slug: string;
    dayCount: number;
    accentColor: string;
    agencyName?: string;
    defaultClientName?: string;
}

/**
 * Client-facing actions on a shared proposal: Accept the plan or Request
 * changes (which opens a note form). Both notify the agent server-side.
 * Also shows the message thread so the client can see the agent's replies.
 * Styled for Himato's light parchment palette.
 */
export function ClientProposalActions({ slug, dayCount, accentColor, agencyName, defaultClientName }: Props) {
    const [messages, setMessages] = useState<ThreadMessage[]>([]);
    const [mode, setMode] = useState<'idle' | 'form'>('idle');
    const [body, setBody] = useState('');
    const [dayRef, setDayRef] = useState<number | ''>('');
    const [clientName, setClientName] = useState(defaultClientName || '');
    const [submitting, setSubmitting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.getSharedMessages(slug);
                if (!cancelled && res.status === 'success') setMessages(res.data.messages || []);
            } catch {
                /* thread is best-effort; ignore load errors */
            }
        })();
        return () => { cancelled = true; };
    }, [slug]);

    const handleAccept = async () => {
        setError('');
        setSubmitting(true);
        try {
            await apiClient.acceptSharedItinerary(slug, clientName ? { clientName } : {});
            setAccepted(true);
        } catch (err: any) {
            setError(err.message || 'Could not submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequest = async () => {
        if (!body.trim()) return;
        setError('');
        setSubmitting(true);
        try {
            const res = await apiClient.postClientMessage(slug, {
                body: body.trim(),
                ...(dayRef !== '' ? { dayRef: Number(dayRef) } : {}),
                ...(clientName ? { clientName } : {}),
            });
            setMessages((prev) => [...prev, res.data.message]);
            setBody('');
            setDayRef('');
            setSent(true);
            setMode('idle');
        } catch (err: any) {
            setError(err.message || 'Could not send. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = 'bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm text-ai-text placeholder-ai-muted/60 focus:outline-none focus:border-ai-accent transition-colors';

    return (
        <section className="mt-12 rounded-3xl bg-ai-card border border-black/8 p-6 sm:p-8">
            {accepted ? (
                <div className="flex flex-col items-center text-center py-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${accentColor}1f` }}>
                        <PartyPopper className="w-6 h-6" style={{ color: accentColor }} />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-ai-text">Plan accepted!</h3>
                    <p className="text-sm text-ai-muted mt-1">
                        {agencyName || 'The agent'} has been notified and will reach out to confirm your booking.
                    </p>
                </div>
            ) : (
                <>
                    <h3 className="font-serif text-xl font-bold text-ai-text">Happy with this plan?</h3>
                    <p className="text-sm text-ai-muted mt-1">
                        Accept it, or ask {agencyName || 'the agent'} for changes — they'll be notified right away.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                        <button
                            onClick={handleAccept}
                            disabled={submitting}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                            style={{ background: accentColor }}
                        >
                            {submitting && mode === 'idle' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Accept this plan
                        </button>
                        <button
                            onClick={() => { setMode(mode === 'form' ? 'idle' : 'form'); setSent(false); }}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-white border border-black/10 text-ai-text hover:border-ai-accent/40 transition-colors"
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            Request changes
                        </button>
                    </div>

                    {sent && mode === 'idle' && (
                        <p className="mt-3 text-sm font-medium" style={{ color: accentColor }}>
                            ✓ Your request was sent. The agent will get back to you.
                        </p>
                    )}

                    {mode === 'form' && (
                        <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="Your name"
                                    className={inputCls}
                                />
                                <select
                                    value={dayRef}
                                    onChange={(e) => setDayRef(e.target.value === '' ? '' : Number(e.target.value))}
                                    className={inputCls}
                                >
                                    <option value="">Whole trip (optional day)</option>
                                    {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
                                        <option key={d} value={d}>Day {d}</option>
                                    ))}
                                </select>
                            </div>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={3}
                                placeholder="e.g. Can we add one more night in Pelling and swap the day 2 lunch spot?"
                                className={`${inputCls} w-full resize-none`}
                            />
                            <button
                                onClick={handleRequest}
                                disabled={submitting || !body.trim()}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
                                style={{ background: accentColor }}
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Send request
                            </button>
                        </div>
                    )}

                    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                </>
            )}

            {/* Thread */}
            {messages.length > 0 && (
                <div className="mt-6 pt-5 border-t border-black/8 space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ai-muted">Conversation</p>
                    {messages.map((m) => (
                        <div key={m._id} className={`flex ${m.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                    m.from === 'client' ? 'text-white' : 'bg-ai-dark text-ai-text border border-black/8'
                                }`}
                                style={m.from === 'client' ? { background: accentColor } : undefined}
                            >
                                {m.dayRef ? <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">Day {m.dayRef}</span> : null}
                                {m.body}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
