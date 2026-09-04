import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Calendar, Clock, Trash2, ExternalLink, Plus, ArrowRight, Eye, MessageSquare } from 'lucide-react';
import { apiClient } from '../../services/api';
import { ConfirmationModal } from '../ConfirmationModal';
import { ThreadModal } from './ThreadModal';

type ProposalStatus =
    | 'draft' | 'sent' | 'viewed' | 'changes_requested' | 'revised' | 'accepted' | 'booked';

interface ItineraryItem {
    _id: string;
    prompt: string;
    itineraryData?: { days?: Array<{ day: number; title: string }> };
    shared?: boolean;
    slug?: string;
    businessName?: string;
    status?: ProposalStatus;
    viewCount?: number;
    lastViewedAt?: string;
    unreadCount?: number;
    clientName?: string;
    createdAt: string;
}

const PAGE_SIZE = 12;

type SegmentId = 'all' | 'attention' | 'live' | 'accepted' | 'draft';

const SEGMENTS: { id: SegmentId; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'attention', label: 'Needs attention' },
    { id: 'live', label: 'Sent' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'draft', label: 'Drafts' },
];

// A proposal needs the agent's attention when the client asked for changes
// or there are unread messages.
function needsAttention(it: { status?: ProposalStatus; unreadCount?: number }): boolean {
    return it.status === 'changes_requested' || (it.unreadCount ?? 0) > 0;
}

// Lifecycle badge styling. Falls back to shared/draft for older records
// created before the status field existed.
const STATUS_META: Record<ProposalStatus, { label: string; cls: string }> = {
    draft: { label: 'Draft', cls: 'bg-black/5 text-ai-muted' },
    sent: { label: 'Sent', cls: 'bg-blue-500/10 text-blue-600' },
    viewed: { label: 'Viewed', cls: 'bg-amber-500/12 text-amber-700' },
    changes_requested: { label: 'Changes', cls: 'bg-orange-500/12 text-orange-700' },
    revised: { label: 'Revised', cls: 'bg-indigo-500/10 text-indigo-600' },
    accepted: { label: 'Accepted', cls: 'bg-ai-accent/12 text-ai-accent' },
    booked: { label: 'Booked', cls: 'bg-emerald-500/12 text-emerald-700' },
};

function statusFor(it: ItineraryItem): { label: string; cls: string } {
    if (it.status && STATUS_META[it.status]) return STATUS_META[it.status];
    return it.shared ? { label: 'Shared', cls: 'bg-ai-accent/12 text-ai-accent' } : STATUS_META.draft;
}

function timeAgo(iso?: string): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export function ItinerariesSection() {
    const navigate = useNavigate();
    const [items, setItems] = useState<ItineraryItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<ItineraryItem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [thread, setThread] = useState<ItineraryItem | null>(null);
    const [filter, setFilter] = useState<SegmentId>('all');
    const [counts, setCounts] = useState<Record<SegmentId, number>>({ all: 0, attention: 0, live: 0, accepted: 0, draft: 0 });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const res = await apiClient.getItineraryHistory(page, PAGE_SIZE, filter);
                if (cancelled) return;
                if (res.status === 'success') {
                    setItems(res.data.itineraries || []);
                    setTotalPages(res.data.totalPages || 1);
                    if (res.data.counts) setCounts(res.data.counts);
                }
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Could not load your itineraries.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [page, filter]);

    // Reset to page 1 whenever the segment changes.
    const selectFilter = (f: SegmentId) => { setFilter(f); setPage(1); };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        setDeletingId(confirmDelete._id);
        try {
            await apiClient.deleteItinerary(confirmDelete._id);
            setItems((prev) => prev.filter((i) => i._id !== confirmDelete._id));
            setCounts((c) => ({
                ...c,
                all: Math.max(0, c.all - 1),
                ...(filter !== 'all' ? { [filter]: Math.max(0, (c[filter] ?? 0) - 1) } : {}),
            }));
            setConfirmDelete(null);
        } catch (err: any) {
            alert(err.message || 'Failed to delete. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div>
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-xl font-bold text-ai-text">Itineraries</h2>
                <p className="text-sm text-ai-muted">
                    {counts.attention > 0
                        ? <><span className="font-semibold text-orange-700">{counts.attention} need{counts.attention === 1 ? 's' : ''} your attention</span> · {counts.all} total</>
                        : `${counts.all} plan${counts.all === 1 ? '' : 's'} you've created`}
                </p>
            </div>

            {/* Segment filter */}
            <div className="flex flex-wrap gap-2 mb-5">
                {SEGMENTS.map((seg) => {
                    const count = counts[seg.id] ?? 0;
                    const activeSeg = filter === seg.id;
                    const isAttention = seg.id === 'attention' && count > 0;
                    return (
                        <button
                            key={seg.id}
                            onClick={() => selectFilter(seg.id)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                activeSeg
                                    ? 'bg-ai-accent text-white border-ai-accent'
                                    : isAttention
                                        ? 'bg-orange-500/10 text-orange-700 border-orange-300 hover:bg-orange-500/15'
                                        : 'bg-ai-card text-ai-muted border-black/10 hover:border-ai-accent/40'
                            }`}
                        >
                            {seg.label}
                            <span className={`text-xs font-semibold ${activeSeg ? 'text-white/80' : 'opacity-70'}`}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* States */}
            {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-ai-card rounded-2xl border border-black/8 p-5 animate-pulse">
                            <div className="h-4 bg-black/5 rounded w-3/4 mb-3" />
                            <div className="h-3 bg-black/5 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-10 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                    <button onClick={() => setPage((p) => p)} className="mt-3 text-sm text-ai-accent font-semibold hover:underline">
                        Try again
                    </button>
                </div>
            ) : items.length === 0 ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-12 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-ai-accent/10 flex items-center justify-center mb-4">
                        <Map className="w-7 h-7 text-ai-accent" />
                    </div>
                    {filter === 'all' ? (
                        <>
                            <h3 className="text-lg font-bold text-ai-text">No itineraries yet</h3>
                            <p className="text-sm text-ai-muted mt-1 max-w-sm">
                                Every AI plan you generate is saved here, ready to brand and share with clients.
                            </p>
                            <button
                                onClick={() => navigate('/chat')}
                                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create your first itinerary
                            </button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-ai-text">
                                {filter === 'attention' ? 'Nothing needs attention' : `No ${SEGMENTS.find((s) => s.id === filter)?.label.toLowerCase()} plans`}
                            </h3>
                            <p className="text-sm text-ai-muted mt-1 max-w-sm">
                                {filter === 'attention'
                                    ? "You're all caught up — no pending change requests."
                                    : 'Try a different filter to see more of your plans.'}
                            </p>
                            <button onClick={() => selectFilter('all')} className="mt-5 text-sm text-ai-accent font-semibold hover:underline">
                                Show all itineraries
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map((it, index) => {
                            const days = it.itineraryData?.days?.length ?? 0;
                            const badge = statusFor(it);
                            const views = it.viewCount ?? 0;
                            const unread = it.unreadCount ?? 0;
                            const attention = needsAttention(it);
                            return (
                                <motion.div
                                    key={it._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                                    className={`group bg-ai-card rounded-2xl border p-5 flex flex-col transition-all ${
                                        attention
                                            ? 'border-orange-300 ring-1 ring-orange-300/60 shadow-[0_10px_30px_-14px_rgba(234,88,12,0.35)]'
                                            : 'border-black/8 hover:border-ai-accent/40 hover:shadow-[0_10px_30px_-14px_rgba(47,74,58,0.4)]'
                                    }`}
                                >
                                    {/* Top row: icon + status */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-ai-accent/10 flex items-center justify-center flex-none">
                                            <Map className="w-5 h-5 text-ai-accent" />
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${badge.cls}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-sm font-semibold text-ai-text leading-snug line-clamp-2 min-h-[2.5rem]">
                                        {it.prompt}
                                    </h3>
                                    {it.clientName && (
                                        <p className="text-xs text-ai-muted mt-0.5">for <span className="font-medium text-ai-text">{it.clientName}</span></p>
                                    )}
                                    {attention && (
                                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-orange-700">
                                            {it.status === 'changes_requested' ? 'Client requested changes' : `${unread} new message${unread === 1 ? '' : 's'}`}
                                        </p>
                                    )}

                                    {/* Meta */}
                                    <div className="flex items-center gap-3 text-xs text-ai-muted mt-2">
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(it.createdAt)}
                                        </span>
                                        <span className="text-black/15">•</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {days} {days === 1 ? 'day' : 'days'}
                                        </span>
                                    </div>

                                    {/* Client view tracking — "did they open it?" */}
                                    {views > 0 && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-ai-accent">
                                            <Eye className="w-3.5 h-3.5" />
                                            Viewed {views}× {it.lastViewedAt && <span className="text-ai-muted font-normal">· {timeAgo(it.lastViewedAt)}</span>}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/6">
                                        <button
                                            onClick={() => navigate(`/itinerary/${it._id}`)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-ai-accent/10 text-ai-accent text-xs font-semibold hover:bg-ai-accent/20 transition-colors"
                                        >
                                            Open <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setThread(it)}
                                            className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-black/10 text-ai-muted hover:text-ai-accent hover:border-ai-accent/40 transition-colors"
                                            title="Messages"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            {unread > 0 && (
                                                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                    {unread}
                                                </span>
                                            )}
                                        </button>
                                        {it.shared && it.slug && (
                                            <a
                                                href={`/${it.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-black/10 text-ai-muted hover:text-ai-accent hover:border-ai-accent/40 transition-colors"
                                                title="Open live share link"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => setConfirmDelete(it)}
                                            disabled={deletingId === it._id}
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-black/10 text-ai-muted hover:text-red-600 hover:border-red-300 transition-colors"
                                            title="Delete itinerary"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl border border-black/10 text-sm text-ai-text disabled:opacity-40 disabled:cursor-not-allowed hover:border-ai-accent/40 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-ai-muted">Page {page} of {totalPages}</span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl border border-black/10 text-sm text-ai-text disabled:opacity-40 disabled:cursor-not-allowed hover:border-ai-accent/40 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {thread && (
                <ThreadModal
                    itineraryId={thread._id}
                    title={thread.prompt}
                    onClose={() => setThread(null)}
                    onRead={() =>
                        setItems((prev) => prev.map((i) => (i._id === thread._id ? { ...i, unreadCount: 0 } : i)))
                    }
                />
            )}

            <ConfirmationModal
                isOpen={confirmDelete !== null}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Delete itinerary"
                message={`Delete "${confirmDelete?.prompt || 'this itinerary'}"? This can't be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
                isLoading={deletingId !== null}
            />
        </div>
    );
}
