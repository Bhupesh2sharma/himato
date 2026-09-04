import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Phone, Plus, Pencil, Trash2, Loader2, X, FileText, Camera, Upload, FileCheck } from 'lucide-react';
import { apiClient } from '../../services/api';
import { ConfirmationModal } from '../ConfirmationModal';

type DriverStatus = 'available' | 'busy' | 'inactive';

interface DriverDoc {
    _id: string;
    label?: string;
    key: string;
    url?: string;
    mimeType?: string;
    size?: number;
}

interface Driver {
    _id: string;
    name: string;
    phone: string;
    vehicleType?: string;
    vehicleNumber?: string;
    seats?: number | null;
    licenseNumber?: string;
    status: DriverStatus;
    notes?: string;
    documents?: DriverDoc[];
}

const STATUS_META: Record<DriverStatus, { label: string; cls: string }> = {
    available: { label: 'Available', cls: 'bg-emerald-500/12 text-emerald-700' },
    busy: { label: 'Busy', cls: 'bg-amber-500/12 text-amber-700' },
    inactive: { label: 'Inactive', cls: 'bg-black/5 text-ai-muted' },
};

export function DriversSection() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState<Driver | 'new' | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Driver | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await apiClient.getDrivers();
                if (!cancelled) setDrivers(res.data.drivers || []);
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Could not load your drivers.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleSaved = (driver: Driver, isNew: boolean) => {
        setDrivers((prev) => (isNew ? [driver, ...prev] : prev.map((d) => (d._id === driver._id ? driver : d))));
        setEditing(null);
    };

    // Update a driver's documents in the list without closing the form.
    const handleDocsPatch = (id: string, documents: DriverDoc[]) => {
        setDrivers((prev) => prev.map((d) => (d._id === id ? { ...d, documents } : d)));
        setEditing((cur) => (cur && cur !== 'new' && cur._id === id ? { ...cur, documents } : cur));
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        setDeletingId(confirmDelete._id);
        try {
            await apiClient.deleteDriver(confirmDelete._id);
            setDrivers((prev) => prev.filter((d) => d._id !== confirmDelete._id));
            setConfirmDelete(null);
        } catch (err: any) {
            alert(err.message || 'Failed to remove driver.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-xl font-bold text-ai-text">Drivers</h2>
                    <p className="text-sm text-ai-muted">{loading ? 'Loading…' : `${drivers.length} in your roster`}</p>
                </div>
                <button
                    onClick={() => setEditing('new')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add driver
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16 text-ai-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : error ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-10 text-center"><p className="text-sm text-red-600">{error}</p></div>
            ) : drivers.length === 0 ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-12 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-ai-accent/10 flex items-center justify-center mb-4"><Car className="w-7 h-7 text-ai-accent" /></div>
                    <h3 className="text-lg font-bold text-ai-text">No drivers yet</h3>
                    <p className="text-sm text-ai-muted mt-1 max-w-sm">Add the drivers and vehicles you work with so you can assign trips and reach them fast.</p>
                    <button onClick={() => setEditing('new')} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors">
                        <Plus className="w-4 h-4" /> Add your first driver
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {drivers.map((d, i) => {
                        const badge = STATUS_META[d.status] ?? STATUS_META.available;
                        return (
                            <motion.div
                                key={d._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                                className="group bg-ai-card rounded-2xl border border-black/8 p-5 flex flex-col"
                            >
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-ai-accent/10 flex items-center justify-center flex-none"><Car className="w-5 h-5 text-ai-accent" /></div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-bold text-ai-text truncate">{d.name}</h3>
                                            {(d.vehicleType || d.vehicleNumber) && (
                                                <p className="text-xs text-ai-muted truncate">{[d.vehicleType, d.vehicleNumber].filter(Boolean).join(' · ')}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex-none ${badge.cls}`}>{badge.label}</span>
                                </div>

                                {(d.seats || d.notes) && (
                                    <p className="text-xs text-ai-muted mb-2">
                                        {d.seats ? `${d.seats} seats` : ''}{d.seats && d.notes ? ' · ' : ''}{d.notes || ''}
                                    </p>
                                )}
                                {d.documents && d.documents.length > 0 && (
                                    <p className="text-xs text-ai-accent font-medium mb-3 inline-flex items-center gap-1">
                                        <FileCheck className="w-3.5 h-3.5" />
                                        {d.documents.length} document{d.documents.length === 1 ? '' : 's'}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-black/6">
                                    <a href={`tel:${d.phone}`} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-ai-accent/10 text-ai-accent text-xs font-semibold hover:bg-ai-accent/20 transition-colors">
                                        <Phone className="w-3.5 h-3.5" /> {d.phone}
                                    </a>
                                    <button onClick={() => setEditing(d)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-black/10 text-ai-muted hover:text-ai-accent hover:border-ai-accent/40 transition-colors" title="Edit">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setConfirmDelete(d)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-black/10 text-ai-muted hover:text-red-600 hover:border-red-300 transition-colors" title="Remove">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {editing && <DriverForm driver={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={handleSaved} onDocsPatch={handleDocsPatch} />}

            <ConfirmationModal
                isOpen={confirmDelete !== null}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Remove driver"
                message={`Remove ${confirmDelete?.name || 'this driver'} from your roster?`}
                confirmText="Remove"
                cancelText="Cancel"
                isDestructive
                isLoading={deletingId !== null}
            />
        </div>
    );
}

// ── Add / edit form modal ──
function DriverForm({ driver, onClose, onSaved, onDocsPatch }: {
    driver: Driver | null;
    onClose: () => void;
    onSaved: (d: Driver, isNew: boolean) => void;
    onDocsPatch: (id: string, documents: DriverDoc[]) => void;
}) {
    const [docs, setDocs] = useState<DriverDoc[]>(driver?.documents || []);
    const [uploading, setUploading] = useState(false);
    const [docError, setDocError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File | undefined) => {
        if (!file || !driver) return;
        setUploading(true);
        setDocError('');
        try {
            const res = await apiClient.uploadDriverDocument(driver._id, file);
            const next = [...docs, res.data.document];
            setDocs(next);
            onDocsPatch(driver._id, next);
        } catch (err: any) {
            setDocError(err.message || 'Upload failed.');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
            if (cameraRef.current) cameraRef.current.value = '';
        }
    };

    const deleteDoc = async (docId: string) => {
        if (!driver) return;
        const prev = docs;
        const next = docs.filter((d) => d._id !== docId);
        setDocs(next);
        onDocsPatch(driver._id, next);
        try {
            await apiClient.deleteDriverDocument(driver._id, docId);
        } catch {
            setDocs(prev); // revert on failure
            onDocsPatch(driver._id, prev);
        }
    };

    const [form, setForm] = useState({
        name: driver?.name || '',
        phone: driver?.phone || '',
        vehicleType: driver?.vehicleType || '',
        vehicleNumber: driver?.vehicleNumber || '',
        seats: driver?.seats ? String(driver.seats) : '',
        status: (driver?.status || 'available') as DriverStatus,
        notes: driver?.notes || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const canSave = form.name.trim() && form.phone.trim() && !saving;

    const save = async () => {
        if (!canSave) return;
        setSaving(true);
        setError('');
        const payload = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            vehicleType: form.vehicleType.trim(),
            vehicleNumber: form.vehicleNumber.trim(),
            seats: form.seats ? Number(form.seats) : null,
            status: form.status,
            notes: form.notes.trim(),
        };
        try {
            if (driver) {
                const res = await apiClient.updateDriver(driver._id, payload);
                onSaved(res.data.driver, false);
            } else {
                const res = await apiClient.createDriver(payload);
                onSaved(res.data.driver, true);
            }
        } catch (err: any) {
            setError(err.message || 'Could not save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = 'w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm text-ai-text placeholder:text-ai-muted/60 focus:outline-none focus:border-ai-accent transition-colors';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-ai-card rounded-3xl w-full max-w-md shadow-2xl border border-black/8" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between px-6 py-4 border-b border-black/8">
                    <h3 className="text-lg font-bold text-ai-text">{driver ? 'Edit driver' : 'Add driver'}</h3>
                    <button onClick={onClose} className="text-ai-muted hover:text-ai-text" aria-label="Close"><X className="w-5 h-5" /></button>
                </header>
                <div className="px-6 py-5 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input className={inputCls} placeholder="Driver name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input className={inputCls} placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input className={inputCls} placeholder="Vehicle (e.g. Innova)" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} />
                        <input className={inputCls} placeholder="Vehicle number" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input className={inputCls} type="number" placeholder="Seats" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
                        <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DriverStatus })}>
                            <option value="available">Available</option>
                            <option value="busy">Busy</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    {/* Documents (licence, vehicle papers) — only once the driver exists */}
                    {driver ? (
                        <div className="pt-3 border-t border-black/8">
                            <p className="text-xs font-bold uppercase tracking-wider text-ai-muted mb-2">Documents</p>
                            {docs.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {docs.map((doc) => {
                                        const isImage = (doc.mimeType || '').startsWith('image/');
                                        return (
                                            <div key={doc._id} className="relative group rounded-xl border border-black/10 overflow-hidden bg-ai-dark aspect-square">
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                                    {isImage && doc.url ? (
                                                        <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-ai-muted p-2">
                                                            <FileText className="w-6 h-6 mb-1" />
                                                            <span className="text-[9px] text-center leading-tight line-clamp-2">{doc.label || 'Document'}</span>
                                                        </div>
                                                    )}
                                                </a>
                                                <button
                                                    onClick={() => deleteDoc(doc._id)}
                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/10 text-xs font-semibold text-ai-text hover:border-ai-accent/40 transition-colors disabled:opacity-50">
                                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
                                </button>
                                <button type="button" onClick={() => cameraRef.current?.click()} disabled={uploading}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/10 text-xs font-semibold text-ai-text hover:border-ai-accent/40 transition-colors disabled:opacity-50">
                                    <Camera className="w-3.5 h-3.5" /> Take photo
                                </button>
                            </div>
                            <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={(e) => uploadFile(e.target.files?.[0])} />
                            <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => uploadFile(e.target.files?.[0])} />
                            {docError && <p className="mt-2 text-xs text-red-600">{docError}</p>}
                        </div>
                    ) : (
                        <p className="pt-3 border-t border-black/8 text-xs text-ai-muted">Save the driver first, then reopen to attach licence &amp; vehicle documents.</p>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-black/8 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-ai-muted hover:border-ai-accent/40 transition-colors">Cancel</button>
                    <button onClick={save} disabled={!canSave} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {driver ? 'Save changes' : 'Add driver'}
                    </button>
                </div>
            </div>
        </div>
    );
}
