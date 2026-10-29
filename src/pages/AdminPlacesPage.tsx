import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, MapPin, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import type { PopularPlace, PlaceCategory } from '../services/api';
import { PLACE_CATEGORY_META, PLACE_CATEGORY_KEYS } from '../data/placeCategories';

// How many places the homepage list shows before "Explore all" (matches Hero).
const HOMEPAGE_SLOTS = 6;

const emptyForm = (priority = 1): Partial<PopularPlace> => ({
    name: '', prompt: '', category: 'treks', priority, active: true,
});

export function AdminPlacesPage() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [places, setPlaces] = useState<PopularPlace[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<PopularPlace | null>(null);
    const [form, setForm] = useState<Partial<PopularPlace>>(emptyForm());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && (!user || !user.isAdmin)) {
            navigate('/manage-himato/login', { replace: true });
        }
    }, [user, isLoading, navigate]);

    useEffect(() => {
        if (user?.isAdmin) fetchPlaces();
    }, [user]);

    const fetchPlaces = async () => {
        setLoading(true);
        try {
            const res = await apiClient.adminGetAllPlaces();
            setPlaces(res.data.places);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        const nextPriority = places.reduce((max, p) => Math.max(max, p.priority), 0) + 1;
        setEditing(null);
        setForm(emptyForm(nextPriority));
        setShowForm(true);
        setError('');
    };

    const openEdit = (place: PopularPlace) => {
        setEditing(place);
        setForm({ ...place });
        setShowForm(true);
        setError('');
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm());
        setError('');
    };

    const handleSave = async () => {
        if (!form.name?.trim() || !form.prompt?.trim() || !form.category) {
            setError('Name, prompt and category are required');
            return;
        }
        setSaving(true);
        setError('');
        const payload = {
            name: form.name.trim(),
            prompt: form.prompt.trim(),
            category: form.category,
            priority: form.priority ?? 0,
            active: form.active ?? true,
        };
        try {
            if (editing) {
                await apiClient.adminUpdatePlace(editing._id, payload);
            } else {
                await apiClient.adminCreatePlace(payload);
            }
            await fetchPlaces();
            closeForm();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await apiClient.adminTogglePlace(id);
            setPlaces(ps => ps.map(p => p._id === id ? { ...p, active: !p.active } : p));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiClient.adminDeletePlace(id);
            setPlaces(ps => ps.filter(p => p._id !== id));
            setDeleteConfirm(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (isLoading || !user?.isAdmin) return null;

    // Position among active places — the first HOMEPAGE_SLOTS show on the homepage list.
    const activeIds = places.filter(p => p.active).map(p => p._id);

    return (
        <div className="min-h-screen bg-ai-dark pt-28 pb-16 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
                    <div>
                        <Link to="/manage-himato" className="inline-flex items-center gap-1.5 text-xs text-ai-muted hover:text-ai-accent mb-3 transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to dashboard
                        </Link>
                        <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-ai-muted mb-1">Admin</p>
                        <h1 className="text-3xl text-ai-text" style={{ fontWeight: 600 }}>Popular Places</h1>
                        <p className="text-sm text-ai-muted mt-1">
                            {places.length} places · {activeIds.length} active · lower priority number shows first; top {HOMEPAGE_SLOTS} appear on the homepage
                        </p>
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                        style={{ background: '#2f4a3a' }}>
                        <Plus className="w-4 h-4" />
                        New Place
                    </button>
                </div>

                {error && !showForm && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
                )}

                {/* Place List */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-3 border-black/10 border-t-ai-accent rounded-full animate-spin" />
                    </div>
                ) : places.length === 0 ? (
                    <div className="text-center py-24 text-ai-muted">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">No places yet</p>
                        <p className="text-sm mt-1">Add a place to show it in "Popular right now"</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {places.map(place => {
                            const rank = activeIds.indexOf(place._id);
                            const onHomepage = rank !== -1 && rank < HOMEPAGE_SLOTS;
                            const meta = PLACE_CATEGORY_META[place.category];
                            return (
                                <motion.div key={place._id} layout
                                    className={`bg-white rounded-2xl border border-black/8 p-5 flex items-center gap-5 hover:border-black/15 transition-all ${place.active ? '' : 'opacity-60'}`}>
                                    {/* Priority */}
                                    <div className="w-12 h-12 rounded-xl shrink-0 bg-ai-accent/10 flex flex-col items-center justify-center">
                                        <span className="text-[9px] font-semibold uppercase tracking-wider text-ai-muted leading-none">Pri</span>
                                        <span className="text-base font-bold text-ai-accent leading-tight">{place.priority}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-sm font-bold text-ai-text truncate">{place.name}</h3>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 text-ai-muted">
                                                {meta ? `${meta.emoji} ${meta.label}` : place.category}
                                            </span>
                                            {onHomepage && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: '#2f4a3a' }}>
                                                    Homepage #{rank + 1}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-ai-muted mt-1 truncate">“{place.prompt}”</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => handleToggle(place._id)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${place.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-black/10 bg-black/5 text-ai-muted'}`}>
                                            {place.active ? <><Eye className="w-3 h-3" />Active</> : <><EyeOff className="w-3 h-3" />Hidden</>}
                                        </button>
                                        <button onClick={() => openEdit(place)}
                                            className="p-2 rounded-xl border border-black/10 text-ai-muted hover:border-ai-accent hover:text-ai-accent transition-all">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => setDeleteConfirm(place._id)}
                                            className="p-2 rounded-xl border border-black/10 text-ai-muted hover:border-red-300 hover:text-red-500 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Create / Edit Form Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
                        <motion.div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                            initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}>

                            {/* Modal header */}
                            <div className="flex items-center justify-between px-7 py-5 border-b border-black/8">
                                <h2 className="text-lg font-bold text-ai-text">{editing ? 'Edit Place' : 'New Place'}</h2>
                                <button onClick={closeForm} className="p-2 rounded-xl hover:bg-black/5 text-ai-muted transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-7 space-y-5">
                                {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-ai-muted uppercase tracking-wider mb-2">Place name *</label>
                                    <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g. Pelling Skywalk"
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 text-ai-text text-sm focus:outline-none focus:border-ai-accent bg-white" />
                                </div>

                                {/* Prompt */}
                                <div>
                                    <label className="block text-xs font-semibold text-ai-muted uppercase tracking-wider mb-2">Prompt *</label>
                                    <textarea value={form.prompt || ''} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                                        rows={3} placeholder="e.g. 2 days in Pelling — the Skywalk, Pemayangtse and a Kanchenjunga sunrise"
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 text-ai-text text-sm focus:outline-none focus:border-ai-accent bg-white resize-y" />
                                    <p className="text-[11px] text-ai-muted mt-1.5">Filled into the planner box when a visitor taps this place.</p>
                                </div>

                                {/* Category + Priority row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-ai-muted uppercase tracking-wider mb-2">Category *</label>
                                        <select value={form.category || 'treks'} onChange={e => setForm(f => ({ ...f, category: e.target.value as PlaceCategory }))}
                                            className="w-full px-4 py-3 rounded-xl border border-black/10 text-ai-text text-sm focus:outline-none focus:border-ai-accent bg-white">
                                            {PLACE_CATEGORY_KEYS.map(key => (
                                                <option key={key} value={key}>{PLACE_CATEGORY_META[key].emoji} {PLACE_CATEGORY_META[key].label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-ai-muted uppercase tracking-wider mb-2">Priority</label>
                                        <input type="number" min={0} value={form.priority ?? 0} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-4 py-3 rounded-xl border border-black/10 text-ai-text text-sm focus:outline-none focus:border-ai-accent bg-white" />
                                        <p className="text-[11px] text-ai-muted mt-1.5">1 = shown first</p>
                                    </div>
                                </div>

                                {/* Active toggle */}
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="w-11 h-6 rounded-full transition-colors relative"
                                        style={{ background: form.active ? '#2f4a3a' : 'rgba(0,0,0,0.15)' }}
                                        onClick={() => setForm(f => ({ ...f, active: !f.active }))}>
                                        <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                                            style={{ left: form.active ? '22px' : '2px' }} />
                                    </div>
                                    <span className="text-sm font-medium text-ai-text">Show on the website</span>
                                    {form.active ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-ai-muted" />}
                                </label>
                            </div>

                            {/* Modal footer */}
                            <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-black/8 bg-black/[0.02]">
                                <button onClick={closeForm} className="px-5 py-2.5 rounded-xl border border-black/10 text-ai-muted text-sm font-medium hover:bg-black/5 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50"
                                    style={{ background: '#2f4a3a' }}>
                                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Saving…' : editing ? 'Update Place' : 'Create Place'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete confirm */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                        <motion.div className="relative bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl"
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
                            <h3 className="text-lg font-bold text-ai-text mb-2">Delete Place?</h3>
                            <p className="text-sm text-ai-muted mb-6">This removes it from "Popular right now". To hide it temporarily, set it to Hidden instead.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-ai-muted hover:bg-black/5 transition-all">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
