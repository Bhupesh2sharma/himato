import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, Plus, Pencil, Trash2, Loader2, X, Info,
    ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, HelpCircle,
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { ConfirmationModal } from '../ConfirmationModal';

/**
 * FinancesSection — a friendly front door to a real double-entry ledger.
 *
 * Agents never see debits/credits. They tap a plain-language action ("Client
 * paid me", "I paid a cost", …); each maps to a fixed two-account journal entry
 * on the backend so the books always balance. This screen shows the four
 * numbers that matter (cash, dues in, dues out, profit) plus the ledger.
 */

type Template =
    | 'income' | 'expense' | 'receivable' | 'payable'
    | 'settle_receivable' | 'settle_payable' | 'owner_in' | 'owner_out';

interface LedgerEntry {
    _id: string;
    date: string;
    description: string;
    amount: number;
    template: Template;
    debit: string;
    credit: string;
    category?: string;
    party?: string;
    method?: 'cash' | 'bank' | 'upi' | 'other';
}

interface Summary {
    cash: number;
    receivable: number;
    payable: number;
    incomeTotal: number;
    expenseTotal: number;
    profit: number;
    monthIncome: number;
    monthExpense: number;
    monthProfit: number;
    categories: Record<string, number>;
    balanced: boolean;
}

// Direction drives how each entry reads in the ledger (colour + sign + icon).
type Dir = 'in' | 'out' | 'due_in' | 'due_out';

const ACTIONS: Record<Template, {
    label: string;
    hint: string;
    dir: Dir;
    partyLabel: string;
    needsCategory?: boolean;
    primary?: boolean;
}> = {
    income:            { label: 'Client paid me',        hint: 'Cash comes in for a trip.',            dir: 'in',      partyLabel: 'Client name',  primary: true },
    expense:           { label: 'I paid a cost',         hint: 'Driver, hotel, permit, fuel, etc.',    dir: 'out',     partyLabel: 'Paid to',      needsCategory: true, primary: true },
    receivable:        { label: 'Client owes me',        hint: 'Booked now, collect the money later.', dir: 'due_in',  partyLabel: 'Client name',  primary: true },
    payable:           { label: 'I owe a vendor',        hint: 'Cost booked now, pay the bill later.', dir: 'due_out', partyLabel: 'Vendor name',  needsCategory: true, primary: true },
    settle_receivable: { label: 'Client cleared a due',  hint: 'A client paid what they owed you.',    dir: 'in',      partyLabel: 'Client name' },
    settle_payable:    { label: 'I paid a vendor bill',  hint: 'You paid off a bill you owed.',         dir: 'out',     partyLabel: 'Vendor name' },
    owner_in:          { label: 'I added my own money',  hint: 'Owner funds put into the business.',   dir: 'in',      partyLabel: 'Note (optional)' },
    owner_out:         { label: 'I took money out',      hint: 'Owner funds taken out.',                dir: 'out',     partyLabel: 'Note (optional)' },
};

const ACCOUNT_NAME: Record<string, string> = {
    cash: 'Cash', receivable: 'Client dues', payable: 'Vendor dues',
    income: 'Income', expense: 'Cost', owner: 'Owner funds',
};

const CATEGORIES = ['Driver', 'Hotel', 'Permit', 'Fuel/Transport', 'Food', 'Marketing', 'Other'];
const METHODS: LedgerEntry['method'][] = ['cash', 'bank', 'upi', 'other'];

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function FinancesSection() {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState<LedgerEntry | Template | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<LedgerEntry | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const load = async () => {
        try {
            const res = await apiClient.getLedger();
            setEntries(res.data.entries || []);
            setSummary(res.data.summary || null);
        } catch (err: any) {
            setError(err.message || 'Could not load your finances.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSaved = () => { setEditing(null); load(); };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        setDeleting(true);
        try {
            await apiClient.deleteBusinessItem('ledger', confirmDelete._id);
            setConfirmDelete(null);
            await load();
        } catch (err: any) {
            alert(err.message || 'Failed to delete entry.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-xl font-bold text-ai-text">Finances</h2>
                    <p className="text-sm text-ai-muted">
                        Keep your books clean — track every rupee in and out, and always know your real profit.
                    </p>
                </div>
                <button
                    onClick={() => setShowHelp((s) => !s)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 text-ai-muted hover:text-ai-text hover:bg-black/5 text-sm font-medium transition-colors"
                >
                    <HelpCircle className="w-4 h-4" />
                    How it works
                </button>
            </div>

            {/* Explainer */}
            {showHelp && (
                <div className="mb-5 rounded-2xl border border-ai-accent/20 bg-ai-accent/[0.06] p-5">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-ai-accent mt-0.5 shrink-0" />
                        <div className="text-sm text-ai-text/90 space-y-2">
                            <p><strong>Every entry has two sides — that's what keeps your books honest.</strong></p>
                            <p className="text-ai-muted">
                                When a client pays you, your <em>cash</em> goes up <em>and</em> your <em>income</em> goes up.
                                When you pay a driver, a <em>cost</em> goes up <em>and</em> your <em>cash</em> goes down.
                                You never do this maths — just tap what happened and we record both sides for you, so the
                                totals can never quietly go wrong.
                            </p>
                            <p className="text-ai-muted">
                                <strong className="text-ai-text">Client owes me / I owe a vendor</strong> let you book money that
                                hasn't moved yet, so you always see who still needs to pay and which bills are pending.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary cards */}
            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                    <StatCard label="Cash in hand" value={inr(summary.cash)} tone="neutral"
                        sub="Money you actually hold" />
                    <StatCard label="Clients owe you" value={inr(summary.receivable)} tone="amber"
                        sub="Still to be collected" />
                    <StatCard label="You owe others" value={inr(summary.payable)} tone="rose"
                        sub="Bills still to pay" />
                    <StatCard label="Profit this month" value={inr(summary.monthProfit)}
                        tone={summary.monthProfit >= 0 ? 'emerald' : 'rose'}
                        sub={`${inr(summary.monthIncome)} in · ${inr(summary.monthExpense)} out`} />
                </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {(Object.entries(ACTIONS) as [Template, typeof ACTIONS[Template]][])
                    .filter(([, a]) => a.primary)
                    .map(([tpl, a]) => (
                        <button
                            key={tpl}
                            onClick={() => setEditing(tpl)}
                            className="group flex items-start gap-3 rounded-2xl border border-black/8 bg-ai-card p-4 text-left hover:border-ai-accent/40 hover:shadow-sm transition-all"
                        >
                            <DirIcon dir={a.dir} />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-ai-text">{a.label}</p>
                                <p className="text-[11px] text-ai-muted leading-snug mt-0.5">{a.hint}</p>
                            </div>
                        </button>
                    ))}
            </div>

            {/* Ledger */}
            {loading ? (
                <div className="flex items-center justify-center py-16 text-ai-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : error ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-10 text-center"><p className="text-sm text-red-600">{error}</p></div>
            ) : entries.length === 0 ? (
                <div className="bg-ai-card rounded-2xl border border-black/8 p-12 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-ai-accent/10 flex items-center justify-center mb-4"><Wallet className="w-7 h-7 text-ai-accent" /></div>
                    <h3 className="text-lg font-bold text-ai-text">Your books are empty</h3>
                    <p className="text-sm text-ai-muted mt-1 max-w-sm">Record your first payment or cost above. Everything you add keeps your cash, dues and profit up to date.</p>
                </div>
            ) : (
                <div className="bg-ai-card rounded-2xl border border-black/8 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-black/8">
                        <h3 className="text-sm font-bold text-ai-text">Ledger</h3>
                        {summary && (
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                summary.balanced ? 'bg-emerald-500/12 text-emerald-700' : 'bg-red-500/12 text-red-700'}`}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {summary.balanced ? 'Books balanced' : 'Out of balance'}
                            </span>
                        )}
                    </div>
                    <ul className="divide-y divide-black/6">
                        {entries.map((e, i) => (
                            <LedgerRow key={e._id} entry={e} index={i}
                                onEdit={() => setEditing(e)} onDelete={() => setConfirmDelete(e)} />
                        ))}
                    </ul>
                </div>
            )}

            {editing && (
                <EntryForm
                    initial={typeof editing === 'string' ? null : editing}
                    template={typeof editing === 'string' ? editing : editing.template}
                    onClose={() => setEditing(null)}
                    onSaved={handleSaved}
                />
            )}

            <ConfirmationModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Delete this entry?"
                message="This removes it from your books and recalculates your balances."
                confirmText="Delete"
                isLoading={deleting}
            />
        </div>
    );
}

// ── Direction icon ──
function DirIcon({ dir }: { dir: Dir }) {
    const map = {
        in:      { Icon: ArrowDownLeft, cls: 'bg-emerald-500/12 text-emerald-700' },
        out:     { Icon: ArrowUpRight,  cls: 'bg-rose-500/12 text-rose-700' },
        due_in:  { Icon: Clock,         cls: 'bg-amber-500/12 text-amber-700' },
        due_out: { Icon: Clock,         cls: 'bg-amber-500/12 text-amber-700' },
    }[dir];
    const { Icon, cls } = map;
    return <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${cls}`}><Icon className="w-4.5 h-4.5" /></span>;
}

// ── Summary stat card ──
function StatCard({ label, value, sub, tone }:
    { label: string; value: string; sub: string; tone: 'neutral' | 'emerald' | 'amber' | 'rose' }) {
    const valueCls = {
        neutral: 'text-ai-text', emerald: 'text-emerald-600', amber: 'text-amber-600', rose: 'text-rose-600',
    }[tone];
    return (
        <div className="rounded-2xl border border-black/8 bg-ai-card p-4">
            <p className="text-[11px] uppercase tracking-wide text-ai-muted font-semibold">{label}</p>
            <p className={`text-xl font-bold mt-1 ${valueCls}`}>{value}</p>
            <p className="text-[11px] text-ai-muted mt-0.5 truncate">{sub}</p>
        </div>
    );
}

// ── One ledger row ──
function LedgerRow({ entry, index, onEdit, onDelete }:
    { entry: LedgerEntry; index: number; onEdit: () => void; onDelete: () => void }) {
    const action = ACTIONS[entry.template];
    const dir = action?.dir ?? 'out';
    const signed =
        dir === 'in' ? { txt: `+ ${inr(entry.amount)}`, cls: 'text-emerald-600' }
        : dir === 'out' ? { txt: `− ${inr(entry.amount)}`, cls: 'text-rose-600' }
        : { txt: inr(entry.amount), cls: 'text-amber-600' };

    return (
        <motion.li
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.02, 0.3) }}
            className="group flex items-center gap-3 px-5 py-3 hover:bg-black/[0.02]"
        >
            <DirIcon dir={dir} />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ai-text truncate">{entry.description}</p>
                <p className="text-[11px] text-ai-muted truncate">
                    {fmtDate(entry.date)}
                    {entry.party ? ` · ${entry.party}` : ''}
                    {entry.category ? ` · ${entry.category}` : ''}
                    {' · '}
                    <span className="text-ai-muted/80">{ACCOUNT_NAME[entry.debit]} ↑ · {ACCOUNT_NAME[entry.credit]} ↓</span>
                </p>
            </div>
            <div className={`text-sm font-bold tabular-nums ${signed.cls}`}>{signed.txt}</div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-1.5 rounded-lg text-ai-muted hover:text-ai-text hover:bg-black/5" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={onDelete} className="p-1.5 rounded-lg text-ai-muted hover:text-red-600 hover:bg-red-500/10" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
            </div>
        </motion.li>
    );
}

// ── Add / edit entry modal ──
function EntryForm({ initial, template: initialTpl, onClose, onSaved }:
    { initial: LedgerEntry | null; template: Template; onClose: () => void; onSaved: () => void }) {
    const [template, setTemplate] = useState<Template>(initialTpl);
    const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [party, setParty] = useState(initial?.party ?? '');
    const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
    const [date, setDate] = useState((initial?.date ?? new Date().toISOString()).slice(0, 10));
    const [method, setMethod] = useState<LedgerEntry['method']>(initial?.method ?? 'cash');
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const action = ACTIONS[template];

    const submit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const value = parseFloat(amount);
        if (!value || value <= 0) { setErr('Enter an amount greater than zero.'); return; }
        if (!description.trim()) { setErr('Add a short description.'); return; }
        setSaving(true);
        setErr('');
        const payload = {
            template,
            amount: value,
            description: description.trim(),
            party: party.trim() || undefined,
            category: action.needsCategory ? category : undefined,
            date: new Date(date).toISOString(),
            method,
        };
        try {
            if (initial) await apiClient.updateLedgerEntry(initial._id, payload);
            else await apiClient.addLedgerEntry(payload);
            onSaved();
        } catch (e: any) {
            setErr(e.message || 'Could not save. Try again.');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="w-full sm:max-w-md bg-ai-card rounded-t-3xl sm:rounded-3xl border border-black/8 max-h-[92vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-black/8 sticky top-0 bg-ai-card">
                    <h3 className="text-base font-bold text-ai-text">{initial ? 'Edit entry' : 'Record money'}</h3>
                    <button onClick={onClose} className="text-ai-muted hover:text-ai-text" aria-label="Close"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    {/* What happened */}
                    <div>
                        <label className="block text-xs font-semibold text-ai-muted mb-1.5">What happened?</label>
                        <select value={template} onChange={(e) => setTemplate(e.target.value as Template)}
                            className="w-full rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 text-sm text-ai-text focus:outline-none focus:border-ai-accent">
                            {(Object.entries(ACTIONS) as [Template, typeof ACTIONS[Template]][]).map(([tpl, a]) => (
                                <option key={tpl} value={tpl}>{a.label}</option>
                            ))}
                        </select>
                        <p className="text-[11px] text-ai-muted mt-1">{action.hint}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-ai-muted mb-1.5">Amount (₹)</label>
                            <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                                placeholder="0" autoFocus
                                className="w-full rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 text-sm text-ai-text focus:outline-none focus:border-ai-accent" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-ai-muted mb-1.5">Date</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 text-sm text-ai-text focus:outline-none focus:border-ai-accent" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ai-muted mb-1.5">Description</label>
                        <input value={description} onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Gangtok 4-day trip — advance"
                            className="w-full rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 text-sm text-ai-text focus:outline-none focus:border-ai-accent" />
                    </div>

                    <div className={action.needsCategory ? 'grid grid-cols-2 gap-3' : ''}>
                        <div>
                            <label className="block text-xs font-semibold text-ai-muted mb-1.5">{action.partyLabel}</label>
                            <input value={party} onChange={(e) => setParty(e.target.value)}
                                className="w-full rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 text-sm text-ai-text focus:outline-none focus:border-ai-accent" />
                        </div>
                        {action.needsCategory && (
                            <div>
                                <label className="block text-xs font-semibold text-ai-muted mb-1.5">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 text-sm text-ai-text focus:outline-none focus:border-ai-accent">
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ai-muted mb-1.5">Paid via</label>
                        <div className="flex gap-2">
                            {METHODS.map((m) => (
                                <button key={m} type="button" onClick={() => setMethod(m)}
                                    className={`flex-1 capitalize rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                                        method === m ? 'border-ai-accent bg-ai-accent/10 text-ai-accent' : 'border-black/10 text-ai-muted hover:bg-black/5'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {err && <p className="text-sm text-red-600">{err}</p>}

                    <button type="submit" disabled={saving}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors disabled:opacity-60">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {initial ? 'Save changes' : 'Add to books'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
