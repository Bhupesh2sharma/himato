import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Calendar, ExternalLink, Inbox, Loader2, Check } from 'lucide-react';
import { apiClient } from '../../services/api';

type LeadStatus = 'new' | 'contacted' | 'closed';

interface Lead {
    _id: string;
    touristName: string;
    touristPhone: string;
    touristEmail?: string;
    message?: string;
    slug?: string;
    status: LeadStatus;
    read: boolean;
    createdAt: string;
}

const STATUS_META: Record<LeadStatus, { label: string; cls: string }> = {
    new: { label: 'New', cls: 'bg-orange-500/12 text-orange-700' },
    contacted: { label: 'Contacted', cls: 'bg-blue-500/10 text-blue-600' },
    closed: { label: 'Closed', cls: 'bg-black/5 text-ai-muted' },
};

export function LeadsSection({ onRead }: { onRead?: () => void }) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await apiClient.getLeads();
                if (cancelled) return;
                const list = res.data.leads || [];
                setLeads(list);
                if (list.some((l: Lead) => !l.read)) {
                    apiClient.markLeadsRead().then(() => onRead?.()).catch(() => {});
                }
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Could not load your leads.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const setStatus = async (id: string, status: LeadStatus) => {
        setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
        try {
            await apiClient.updateLead(id, { status });
        } catch {
            /* optimistic; ignore */
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-xl font-bold text-ai-text">Leads</h2>
                <p className="text-sm text-ai-muted">
                    {loading ? 'Loading…' : `${leads.length} traveller${leads.length === 1 ? '' : 's'} want you to plan their trip`}
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16 text-ai-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : error ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-10 text-center">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            ) : leads.length === 0 ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-12 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-ai-accent/10 flex items-center justify-center mb-4">
                        <Inbox className="w-7 h-7 text-ai-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-ai-text">No leads yet</h3>
                    <p className="text-sm text-ai-muted mt-1 max-w-sm">
                        When a traveller sends you an itinerary from the Himato planner, it shows up here with their number.
                    </p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {leads.map((lead, index) => {
                        const badge = STATUS_META[lead.status];
                        return (
                            <motion.div
                                key={lead._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                                className={`bg-ai-card rounded-2xl border p-5 ${lead.status === 'new' ? 'border-orange-300 ring-1 ring-orange-300/50' : 'border-black/8'}`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-ai-text truncate">{lead.touristName}</h3>
                                        <p className="text-xs text-ai-muted inline-flex items-center gap-1 mt-0.5">
                                            <Calendar className="w-3.5 h-3.5" /> {formatDate(lead.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                                </div>

                                {lead.message && <p className="text-sm text-ai-muted italic mb-3">“{lead.message}”</p>}

                                {/* Contact + itinerary */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <a href={`tel:${lead.touristPhone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ai-accent/10 text-ai-accent text-xs font-semibold hover:bg-ai-accent/20 transition-colors">
                                        <Phone className="w-3.5 h-3.5" /> {lead.touristPhone}
                                    </a>
                                    {lead.touristEmail && (
                                        <a href={`mailto:${lead.touristEmail}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 text-ai-muted text-xs font-medium hover:border-ai-accent/40 transition-colors">
                                            <Mail className="w-3.5 h-3.5" /> Email
                                        </a>
                                    )}
                                    {lead.slug && (
                                        <a href={`/${lead.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 text-ai-muted text-xs font-medium hover:border-ai-accent/40 transition-colors">
                                            <ExternalLink className="w-3.5 h-3.5" /> Itinerary
                                        </a>
                                    )}
                                </div>

                                {/* Status controls */}
                                <div className="flex items-center gap-2 pt-3 border-t border-black/6">
                                    {(['contacted', 'closed'] as LeadStatus[]).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setStatus(lead._id, lead.status === s ? 'new' : s)}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                                lead.status === s ? 'bg-ai-accent text-white border-ai-accent' : 'border-black/10 text-ai-muted hover:border-ai-accent/40'
                                            }`}
                                        >
                                            {lead.status === s && <Check className="w-3 h-3" />}
                                            {s === 'contacted' ? 'Mark contacted' : 'Close'}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
