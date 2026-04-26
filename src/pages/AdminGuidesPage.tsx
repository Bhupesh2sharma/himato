import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, X, Save, ImageIcon, Globe, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import type { GuidePost } from '../services/api';

const CATEGORIES = ['Offbeat', 'Spiritual', 'Workation', 'Family', 'Adventure', 'Logistics', 'Food', 'Seasonal', 'Hidden Gem', 'History'];

const CATEGORY_COLORS: Record<string, string> = {
    Offbeat: '#5a7a2a', Spiritual: '#7c6f9f', Workation: '#2f6b8a',
    Family: '#c9a961', Adventure: '#2f4a3a', Logistics: '#6b7280',
    Food: '#b73f25', Seasonal: '#d97a2c', 'Hidden Gem': '#4a7a5e', History: '#8a6540',
};

const emptyForm = (): Partial<GuidePost> => ({
    title: '', shortDescription: '', description: '', category: 'Offbeat',
    image: '', content: '', published: false, order: 0,
});

export function AdminGuidesPage() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [guides, setGuides] = useState<GuidePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<GuidePost | null>(null);
    const [form, setForm] = useState<Partial<GuidePost>>(emptyForm());
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isLoading && (!user || !user.isAdmin)) {
            navigate('/');
        }
    }, [user, isLoading, navigate]);

    useEffect(() => {
        if (user?.isAdmin) fetchGuides();
    }, [user]);

    const fetchGuides = async () => {
        setLoading(true);
        try {
            const res = await apiClient.adminGetAllGuides();
            setGuides(res.data.guides);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm());
        setPreviewImage('');
        setShowForm(true);
        setError('');
    };

    const openEdit = (guide: GuidePost) => {
        setEditing(guide);
        setForm({ ...guide });
        setPreviewImage(guide.image || '');
        setShowForm(true);
        setError('');
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm());
        setPreviewImage('');
        setError('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const res = await apiClient.adminUploadGuideImage(
                file,
                editing?._id,
                editing?.imagePublicId
            );
            setForm(f => ({ ...f, image: res.data.url, imagePublicId: res.data.publicId }));
            setPreviewImage(res.data.url);
        } catch (err: any) {
            setError('Image upload failed: ' + err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        if (!form.title || !form.shortDescription || !form.category) {
            setError('Title, short description and category are required');
            return;
        }
        setSaving(true);
        setError('');
        try {
            if (editing) {
                await apiClient.adminUpdateGuide(editing._id, form);
            } else {
                await apiClient.adminCreateGuide(form);
            }
            await fetchGuides();
            closeForm();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await apiClient.adminTogglePublished(id);
            setGuides(gs => gs.map(g => g._id === id ? { ...g, published: !g.published } : g));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiClient.adminDeleteGuide(id);
            setGuides(gs => gs.filter(g => g._id !== id));
            setDeleteConfirm(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (isLoading || !user?.isAdmin) return null;

    return (
        <div className="min-h-screen bg-ai-dark pt-28 pb-16 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-ai-muted mb-1">Admin</p>
                        <h1 className="text-3xl text-ai-text" style={{ fontWeight: 600 }}>Guide Posts</h1>
                        <p className="text-sm text-ai-muted mt-1">{guides.length} guides · {guides.filter(g => g.published).length} published</p>
                    </div>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                        style={{ background: '#2f4a3a' }}>
                        <Plus className="w-4 h-4" />
                        New Guide
                    </button>
                </div>

                {error && !showForm && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
                )}

                {/* Guide List */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-3 border-black/10 border-t-ai-accent rounded-full animate-spin" />
                    </div>
                ) : guides.length === 0 ? (
                    <div className="text-center py-24 text-ai-muted">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">No guides yet</p>
                        <p className="text-sm mt-1">Create your first guide to get started</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {guides.map(guide => (
                            <motion.div key={guide._id} layout
                                className="bg-white rounded-2xl border border-black/8 p-5 flex items-center gap-5 hover:border-black/15 transition-all">
                                {/* Thumbnail */}
                                <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-black/5">
                                    {guide.image
                                        ? <img src={guide.image} alt={guide.title} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-black/20" /></div>
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-bold text-ai-text truncate">{guide.title}</h3>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                                            style={{ background: CATEGORY_COLORS[guide.category] || '#2f4a3a' }}>
                                            {guide.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-ai-muted mt-0.5 truncate">{guide.shortDescription}</p>
                                    <p className="text-[10px] text-black/30 mt-1">/{guide.slug}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => handleToggle(guide._id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${guide.published ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-black/10 bg-black/5 text-ai-muted'}`}>
                                        {guide.published ? <><Globe className="w-3 h-3" />Live</> : <><Lock className="w-3 h-3" />Draft</>}
                                    </button>
                                    <button onClick={() => openEdit(guide)}
                                        className="p-2 rounded-xl border border-black/10 text-ai-muted hover:border-ai-accent hover:text-ai-accent transition-all">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setDeleteConfirm(guide._id)}
                                        className="p-2 rounded-xl border border-black/10 text-ai-muted hover:border-red-300 hover:text-red-500 transition-all">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Create / Edit Form Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
                        <motion.div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                            initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}>

                            {/* Modal header */}
                            <div className="flex items-center justify-between px-7 py-5 border-b border-black/8">
                                <h2 className="text-lg font-bold text-ai-text">{editing ? 'Edit Guide' : 'New Guide'}</h2>
                                <button onClick={closeForm} className="p-2 rounded-xl hover:bg-black/5 text-ai-muted transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-7 space-y-5">
                                {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

                                {/* Image upload */}
                                <div>
                                    <label className="block text-xs font-semibold text-ai-muted uppercase tracking-wider mb-2">Cover Image</label>
                                    <div className="relative h-48 rounded-2xl overflow-hidden border-2 border-dashed border-black/15 hover:border-ai-accent transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}>
                                        {previewImage
                                            ? <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            : <div className="flex flex-col items-center justify-center h-full gap-2 text-ai-muted">
                                                <Upload className="w-8 h-8 opacity-40" />
                                                <span className="text-sm">Click to upload image</span>
                                                <span className="text-xs opacity-60">JPG, PNG, WebP up to 10MB</span>
                                            </div>
                                        }
                                        {uploadingImage && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <div className="w-8 h-8 border-2 border-ai-accent border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                        {previewImage && (
                                            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-medium">
                                                <Upload className="w-3 h-3" />Change
                                            </div>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-semibold text-ai-muted uppercase tracking-wider mb-2">Title *</label>
                                    <input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        placeholder="e.g. Best time to visit Gurudongmar Lake"
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 text-ai-text text-sm focus:outline-none focus:border-ai-accent bg-white" />
                                </div>

                                {/* Category + Published row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-ai-muted uppercase tracking-wider mb-2">Category *</label>
                                        <select value={form.category || 'Offbeat'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-black/10 text-ai-text text-sm focus:outline-none focus:border-ai-accent bg-white">
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-ai-muted uppercase tracking-wider mb-2">Order</label>
                                        <input type="number" value={form.order ?? 0} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-4 py-3 rounded-xl border border-black/10 text-ai-text text-sm focus:outline-none focus:border-ai-accent bg-white" />
                                    </div>
                                </div>

                                {/* Short description */}
                                <div>
                                    <label className="block text-xs font-semibold text-ai-muted uppercase tracking-wider mb-2">Short Description *</label>
                                    <input value={form.shortDescription || ''} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                                        placeholder="1-2 sentence teaser shown in the reel"
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 text-ai-text text-sm focus:outline-none focus:border-ai-accent bg-white" />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-xs font-semibold text-ai-muted uppercase tracking-wider mb-2">Content (Markdown)</label>
                                    <textarea value={form.content || ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                        rows={10} placeholder="# Guide Title&#10;&#10;Write your guide in markdown..."
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 text-ai-text text-sm focus:outline-none focus:border-ai-accent bg-white resize-y font-mono" />
                                </div>

                                {/* Published toggle */}
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`w-11 h-6 rounded-full transition-colors relative ${form.published ? 'bg-ai-accent' : 'bg-black/15'}`}
                                        onClick={() => setForm(f => ({ ...f, published: !f.published }))}>
                                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.published ? 'left-5.5' : 'left-0.5'}`}
                                            style={{ left: form.published ? '22px' : '2px' }} />
                                    </div>
                                    <span className="text-sm font-medium text-ai-text">Publish immediately</span>
                                    {form.published ? <Globe className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-ai-muted" />}
                                </label>
                            </div>

                            {/* Modal footer */}
                            <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-black/8 bg-black/[0.02]">
                                <button onClick={closeForm} className="px-5 py-2.5 rounded-xl border border-black/10 text-ai-muted text-sm font-medium hover:bg-black/5 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving || uploadingImage}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50"
                                    style={{ background: '#2f4a3a' }}>
                                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Saving…' : editing ? 'Update Guide' : 'Create Guide'}
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
                            <h3 className="text-lg font-bold text-ai-text mb-2">Delete Guide?</h3>
                            <p className="text-sm text-ai-muted mb-6">This will permanently delete the guide and its Cloudinary image. This cannot be undone.</p>
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
