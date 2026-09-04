import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Calendar, Clock, Trash2, ExternalLink, Plus, ArrowRight } from 'lucide-react';
import { apiClient } from '../../services/api';
import { ConfirmationModal } from '../ConfirmationModal';

interface ItineraryItem {
    _id: string;
    prompt: string;
    itineraryData?: { days?: Array<{ day: number; title: string }> };
    shared?: boolean;
    slug?: string;
    businessName?: string;
    createdAt: string;
}

const PAGE_SIZE = 12;

export function ItinerariesSection() {
    const navigate = useNavigate();
    const [items, setItems] = useState<ItineraryItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<ItineraryItem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const res = await apiClient.getItineraryHistory(page, PAGE_SIZE);
                if (cancelled) return;
                if (res.status === 'success') {
                    setItems(res.data.itineraries || []);
                    setTotal(res.data.total || 0);
                    setTotalPages(res.data.totalPages || 1);
                }
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Could not load your itineraries.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [page]);

    const handleDelete = async () => {
        if (!confirmDelete) return;
        setDeletingId(confirmDelete._id);
        try {
            await apiClient.deleteItinerary(confirmDelete._id);
            setItems((prev) => prev.filter((i) => i._id !== confirmDelete._id));
            setTotal((t) => Math.max(0, t - 1));
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
            <div className="mb-5">
                <h2 className="text-xl font-bold text-ai-text">Itineraries</h2>
                <p className="text-sm text-ai-muted">
                    {loading ? 'Loading…' : `${total} plan${total === 1 ? '' : 's'} you've created`}
                </p>
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
                </div>
            ) : (
                <>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map((it, index) => {
                            const days = it.itineraryData?.days?.length ?? 0;
                            return (
                                <motion.div
                                    key={it._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                                    className="group bg-ai-card rounded-2xl border border-black/8 p-5 flex flex-col hover:border-ai-accent/40 hover:shadow-[0_10px_30px_-14px_rgba(47,74,58,0.4)] transition-all"
                                >
                                    {/* Top row: icon + status */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-ai-accent/10 flex items-center justify-center flex-none">
                                            <Map className="w-5 h-5 text-ai-accent" />
                                        </div>
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                                it.shared
                                                    ? 'bg-ai-accent/12 text-ai-accent'
                                                    : 'bg-black/5 text-ai-muted'
                                            }`}
                                        >
                                            {it.shared ? 'Shared' : 'Draft'}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-sm font-semibold text-ai-text leading-snug line-clamp-2 min-h-[2.5rem]">
                                        {it.prompt}
                                    </h3>

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

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/6">
                                        <button
                                            onClick={() => navigate(`/itinerary/${it._id}`)}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-ai-accent/10 text-ai-accent text-xs font-semibold hover:bg-ai-accent/20 transition-colors"
                                        >
                                            Open <ArrowRight className="w-3.5 h-3.5" />
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
