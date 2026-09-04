import { useEffect, useRef, useState } from 'react';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { apiClient } from '../../services/api';

interface ThreadMessage {
    _id: string;
    from: 'client' | 'agent';
    body: string;
    dayRef?: number | null;
    authorName?: string;
    createdAt: string;
}

interface Props {
    itineraryId: string;
    title: string;
    onClose: () => void;
    onRead?: () => void; // called after unread client messages are marked read
}

/**
 * Agent-side conversation for one shared itinerary. Loads the thread, marks
 * incoming client messages read, and lets the agent reply.
 */
export function ThreadModal({ itineraryId, title, onClose, onRead }: Props) {
    const [messages, setMessages] = useState<ThreadMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await apiClient.getItineraryMessages(itineraryId);
                if (cancelled) return;
                const msgs = res.data.messages || [];
                setMessages(msgs);
                // Mark client messages read once the agent opens the thread.
                if (msgs.some((m: ThreadMessage) => m.from === 'client')) {
                    apiClient.markMessagesRead(itineraryId).then(() => onRead?.()).catch(() => {});
                }
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Could not load the conversation.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [itineraryId]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const send = async () => {
        if (!reply.trim()) return;
        setSending(true);
        setError('');
        try {
            const res = await apiClient.postAgentReply(itineraryId, { body: reply.trim() });
            setMessages((prev) => [...prev, res.data.message]);
            setReply('');
        } catch (err: any) {
            setError(err.message || 'Could not send reply.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-ai-card rounded-2xl w-full max-w-lg shadow-2xl border border-black/8 flex flex-col"
                style={{ height: 'min(80vh, 640px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/8">
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-ai-muted font-bold">Conversation</p>
                        <h3 className="text-sm font-bold text-ai-text truncate">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-ai-muted hover:text-ai-text" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </header>

                {/* Thread */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-ai-muted">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-ai-muted">
                            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No messages yet. The client hasn't sent anything.</p>
                        </div>
                    ) : (
                        messages.map((m) => (
                            <div key={m._id} className={`flex ${m.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                        m.from === 'agent'
                                            ? 'bg-ai-accent text-white'
                                            : 'bg-black/5 text-ai-text'
                                    }`}
                                >
                                    {m.dayRef ? (
                                        <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">
                                            Day {m.dayRef}
                                        </span>
                                    ) : null}
                                    {m.from === 'client' && m.authorName && (
                                        <span className="block text-[10px] font-semibold text-ai-muted mb-0.5">{m.authorName}</span>
                                    )}
                                    {m.body}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={endRef} />
                </div>

                {/* Reply */}
                <div className="px-5 py-4 border-t border-black/8">
                    {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
                    <div className="flex items-end gap-2">
                        <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            rows={2}
                            placeholder="Reply to your client…"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); }
                            }}
                            className="flex-1 bg-white border border-black/10 rounded-xl px-3 py-2 text-sm text-ai-text placeholder-ai-muted/60 focus:outline-none focus:border-ai-accent resize-none"
                        />
                        <button
                            onClick={send}
                            disabled={sending || !reply.trim()}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-ai-accent text-white hover:bg-ai-secondary transition-colors disabled:opacity-50"
                            aria-label="Send reply"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
