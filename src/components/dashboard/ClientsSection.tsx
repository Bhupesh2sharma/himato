import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Plus, Pencil, Trash2, Loader2, X, FileText, Camera, Upload,
    Phone, Mail, MapPin, CalendarRange, Plane, Search,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { ConfirmationModal } from '../ConfirmationModal';

type ClientStatus = 'prospect' | 'upcoming' | 'travelling' | 'completed';

interface ClientDoc {
    _id: string;
    label?: string;
    key: string;
    url?: string;
    mimeType?: string;
    size?: number;
}

interface Client {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    nationality?: 'indian' | 'foreign';
    origin?: string;
    destination?: string;
    arrivalDate?: string | null;
    returnDate?: string | null;
    travellers?: number;
    status: ClientStatus;
    notes?: string;
    documents?: ClientDoc[];
}

const STATUS_META: Record<ClientStatus, { label: string; cls: string }> = {
    prospect:   { label: 'Prospect', cls: 'bg-black/5 text-ai-muted' },
    upcoming:   { label: 'Upcoming', cls: 'bg-sky-500/12 text-sky-700' },
    travelling: { label: 'Travelling', cls: 'bg-emerald-500/12 text-emerald-700' },
    completed:  { label: 'Completed', cls: 'bg-amber-500/12 text-amber-700' },
};
const STATUS_ORDER: ClientStatus[] = ['upcoming', 'travelling', 'prospect', 'completed'];

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';

export function ClientsSection() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState<Client | 'new' | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await apiClient.getClients();
                if (!cancelled) setClients(res.data.clients || []);
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Could not load your clients.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleSaved = (client: Client, isNew: boolean) => {
        setClients((prev) => (isNew ? [client, ...prev] : prev.map((c) => (c._id === client._id ? client : c))));
        setEditing(null);
    };

    const handleDocsPatch = (id: string, documents: ClientDoc[]) => {
        setClients((prev) => prev.map((c) => (c._id === id ? { ...c, documents } : c)));
        setEditing((cur) => (cur && cur !== 'new' && cur._id === id ? { ...cur, documents } : cur));
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        setDeletingId(confirmDelete._id);
        try {
            await apiClient.deleteClient(confirmDelete._id);
            setClients((prev) => prev.filter((c) => c._id !== confirmDelete._id));
            setConfirmDelete(null);
        } catch (err: any) {
            alert(err.message || 'Failed to remove client.');
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return clients.filter((c) => {
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            if (!q) return true;
            return [c.name, c.phone, c.email, c.origin, c.destination]
                .filter(Boolean).some((v) => v!.toLowerCase().includes(q));
        });
    }, [clients, query, statusFilter]);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-xl font-bold text-ai-text">Clients</h2>
                    <p className="text-sm text-ai-muted">{loading ? 'Loading…' : `${clients.length} traveller${clients.length === 1 ? '' : 's'} on record`}</p>
                </div>
                <button
                    onClick={() => setEditing('new')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add client
                </button>
            </div>

            {/* Search + filters */}
            {!loading && !error && clients.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-ai-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={query} onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search name, phone, place…"
                            className="w-full bg-ai-card border border-black/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-ai-text placeholder:text-ai-muted/60 focus:outline-none focus:border-ai-accent"
                        />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto">
                        {(['all', ...STATUS_ORDER] as const).map((s) => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                                    statusFilter === s ? 'bg-ai-accent text-white' : 'bg-ai-card border border-black/10 text-ai-muted hover:text-ai-text'}`}>
                                {s === 'all' ? 'All' : STATUS_META[s].label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16 text-ai-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : error ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-10 text-center"><p className="text-sm text-red-600">{error}</p></div>
            ) : clients.length === 0 ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-12 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-ai-accent/10 flex items-center justify-center mb-4"><Users className="w-7 h-7 text-ai-accent" /></div>
                    <h3 className="text-lg font-bold text-ai-text">No clients yet</h3>
                    <p className="text-sm text-ai-muted mt-1 max-w-sm">Add the travellers you're handling — who they are, where they're headed, their trip dates and documents — all in one place.</p>
                    <button onClick={() => setEditing('new')} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors">
                        <Plus className="w-4 h-4" /> Add your first client
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-10 text-center"><p className="text-sm text-ai-muted">No clients match your search.</p></div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((c, i) => (
                        <ClientCard key={c._id} client={c} index={i}
                            onEdit={() => setEditing(c)} onDelete={() => setConfirmDelete(c)} />
                    ))}
                </div>
            )}

            {editing && (
                <ClientForm
                    client={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={handleSaved}
                    onDocsPatch={handleDocsPatch}
                />
            )}

            <ConfirmationModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Remove this client?"
                message={`This permanently deletes ${confirmDelete?.name || 'this client'} and their documents.`}
                confirmText="Remove"
                isDestructive
                isLoading={deletingId !== null}
            />
        </div>
    );
}

// ── Client card ──
function ClientCard({ client, index, onEdit, onDelete }:
    { client: Client; index: number; onEdit: () => void; onDelete: () => void }) {
    const badge = STATUS_META[client.status] ?? STATUS_META.upcoming;
    const initial = (client.name[0] || 'C').toUpperCase();
    const docCount = client.documents?.length || 0;
    const trip = [client.origin, client.destination].filter(Boolean).join(' → ');
    const dates = client.arrivalDate || client.returnDate
        ? `${fmtDate(client.arrivalDate)}${client.returnDate ? ' – ' + fmtDate(client.returnDate) : ''}`
        : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.3) }}
            className="group bg-ai-card rounded-2xl border border-black/8 p-4 hover:border-ai-accent/30 hover:shadow-sm transition-all"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #2f4a3a, #1a2e23)' }}>
                    {initial}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-ai-text truncate">{client.name}</h3>
                        {client.nationality === 'foreign' && (
                            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-500/12 text-indigo-700">Foreign</span>
                        )}
                    </div>
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-1.5 rounded-lg text-ai-muted hover:text-ai-text hover:bg-black/5" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-1.5 rounded-lg text-ai-muted hover:text-red-600 hover:bg-red-500/10" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-ai-muted">
                {trip && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{trip}</span></p>}
                {dates && <p className="flex items-center gap-2"><CalendarRange className="w-3.5 h-3.5 shrink-0" />{dates}</p>}
                {client.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" />{client.phone}</p>}
                {client.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{client.email}</span></p>}
                <p className="flex items-center gap-2"><Plane className="w-3.5 h-3.5 shrink-0" />{client.travellers || 1} traveller{(client.travellers || 1) === 1 ? '' : 's'}
                    {docCount > 0 && <span className="ml-auto inline-flex items-center gap-1 text-ai-muted"><FileText className="w-3.5 h-3.5" />{docCount}</span>}
                </p>
            </div>
        </motion.div>
    );
}

// ── Add / edit form modal ──
function ClientForm({ client, onClose, onSaved, onDocsPatch }: {
    client: Client | null;
    onClose: () => void;
    onSaved: (c: Client, isNew: boolean) => void;
    onDocsPatch: (id: string, documents: ClientDoc[]) => void;
}) {
    const [docs, setDocs] = useState<ClientDoc[]>(client?.documents || []);
    const [uploading, setUploading] = useState(false);
    const [docError, setDocError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File | undefined) => {
        if (!file || !client) return;
        setUploading(true);
        setDocError('');
        try {
            const res = await apiClient.uploadClientDocument(client._id, file);
            const next = [...docs, res.data.document];
            setDocs(next);
            onDocsPatch(client._id, next);
        } catch (err: any) {
            setDocError(err.message || 'Upload failed.');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
            if (cameraRef.current) cameraRef.current.value = '';
        }
    };

    const deleteDoc = async (docId: string) => {
        if (!client) return;
        const prev = docs;
        const next = docs.filter((d) => d._id !== docId);
        setDocs(next);
        onDocsPatch(client._id, next);
        try {
            await apiClient.deleteClientDocument(client._id, docId);
        } catch {
            setDocs(prev);
            onDocsPatch(client._id, prev);
        }
    };

    const [form, setForm] = useState({
        name: client?.name || '',
        phone: client?.phone || '',
        email: client?.email || '',
        nationality: (client?.nationality || 'indian') as 'indian' | 'foreign',
        origin: client?.origin || '',
        destination: client?.destination || '',
        arrivalDate: client?.arrivalDate ? client.arrivalDate.slice(0, 10) : '',
        returnDate: client?.returnDate ? client.returnDate.slice(0, 10) : '',
        travellers: client?.travellers ? String(client.travellers) : '1',
        status: (client?.status || 'upcoming') as ClientStatus,
        notes: client?.notes || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const canSave = form.name.trim() && !saving;

    const save = async () => {
        if (!canSave) return;
        setSaving(true);
        setError('');
        const payload = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            nationality: form.nationality,
            origin: form.origin.trim(),
            destination: form.destination.trim(),
            arrivalDate: form.arrivalDate || null,
            returnDate: form.returnDate || null,
            travellers: form.travellers ? Number(form.travellers) : 1,
            status: form.status,
            notes: form.notes.trim(),
        };
        try {
            if (client) {
                const res = await apiClient.updateClient(client._id, payload);
                onSaved(res.data.client, false);
            } else {
                const res = await apiClient.createClient(payload);
                onSaved(res.data.client, true);
            }
        } catch (err: any) {
            setError(err.message || 'Could not save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = 'w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm text-ai-text placeholder:text-ai-muted/60 focus:outline-none focus:border-ai-accent transition-colors';
    const labelCls = 'block text-[11px] font-semibold text-ai-muted mb-1';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-ai-card rounded-3xl w-full max-w-lg shadow-2xl border border-black/8 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between px-6 py-4 border-b border-black/8 sticky top-0 bg-ai-card z-10">
                    <h3 className="text-lg font-bold text-ai-text">{client ? 'Edit client' : 'Add client'}</h3>
                    <button onClick={onClose} className="text-ai-muted hover:text-ai-text" aria-label="Close"><X className="w-5 h-5" /></button>
                </header>
                <div className="px-6 py-5 space-y-4">
                    {/* Who */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Full name *</label>
                            <input className={inputCls} placeholder="e.g. Rahul Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Phone</label>
                            <input className={inputCls} placeholder="+91…" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelCls}>Email</label>
                            <input className={inputCls} placeholder="name@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>

                    {/* Trip */}
                    <div className="pt-3 border-t border-black/8">
                        <p className="text-xs font-bold uppercase tracking-wider text-ai-muted mb-2">Trip</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Coming from</label>
                                <input className={inputCls} placeholder="e.g. Kolkata" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Going to</label>
                                <input className={inputCls} placeholder="e.g. Gangtok, Lachung" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Arrival date</label>
                                <input type="date" className={inputCls} value={form.arrivalDate} onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Return date</label>
                                <input type="date" className={inputCls} value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Travellers</label>
                                <input type="number" min="1" className={inputCls} value={form.travellers} onChange={(e) => setForm({ ...form, travellers: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Nationality</label>
                                <select className={inputCls} value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value as 'indian' | 'foreign' })}>
                                    <option value="indian">Indian</option>
                                    <option value="foreign">Foreign national</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelCls}>Status</label>
                                <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}>
                                    {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Notes</label>
                        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Preferences, allergies, special requests…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    {/* Documents — only once the client exists */}
                    {client ? (
                        <div className="pt-3 border-t border-black/8">
                            <p className="text-xs font-bold uppercase tracking-wider text-ai-muted mb-2">Documents <span className="font-medium normal-case text-ai-muted/70">— ID proof, permit, tickets</span></p>
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
                        <p className="pt-3 border-t border-black/8 text-xs text-ai-muted">Save the client first, then reopen to attach ID proof, permits &amp; tickets.</p>
                    )}
                </div>
                <div className="px-6 py-4 border-t border-black/8 flex justify-end gap-2 sticky bottom-0 bg-ai-card">
                    <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-ai-muted hover:border-ai-accent/40 transition-colors">Cancel</button>
                    <button onClick={save} disabled={!canSave} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {client ? 'Save changes' : 'Add client'}
                    </button>
                </div>
            </div>
        </div>
    );
}
