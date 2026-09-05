import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { encodeAgentId, decodeAgentId } from '../utils/sharing';
import { ItinerariesSection } from '../components/dashboard/ItinerariesSection';
import { LeadsSection } from '../components/dashboard/LeadsSection';
import { DriversSection } from '../components/dashboard/DriversSection';
import { ClientsSection } from '../components/dashboard/ClientsSection';
import { FinancesSection } from '../components/dashboard/FinancesSection';
import { apiClient } from '../services/api';
import {
    LayoutDashboard, Map, Users, Wallet, Megaphone,
    Settings, Menu, X, Plus, LogOut, Inbox, Car, Loader2, Sparkles, CreditCard,
} from 'lucide-react';

/**
 * Travel-agent dashboard shell. Left-sidebar layout on the existing parchment
 * palette. Each section is a placeholder for now — features get built into
 * these panels one by one on top of the existing backend APIs.
 *
 * Routing: every registered agent has an encoded route /dashboard/<agentCode>.
 * Bare /dashboard redirects a signed-in agent to their encoded URL.
 */

type SectionId =
    | 'overview' | 'leads' | 'itineraries' | 'clients'
    | 'drivers' | 'finances' | 'marketing' | 'settings';

interface NavItem {
    id: SectionId;
    label: string;
    icon: ComponentType<{ className?: string }>;
}

const PRIMARY_NAV: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Inbox },
    { id: 'itineraries', label: 'Itineraries', icon: Map },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'drivers', label: 'Drivers', icon: Car },
    { id: 'finances', label: 'Finances', icon: Wallet },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
];

const SETTINGS_ITEM: NavItem = { id: 'settings', label: 'Settings', icon: Settings };

const SECTION_BLURB: Record<SectionId, string> = {
    overview: 'Snapshot of your business at a glance.',
    leads: 'Travellers who sent you an itinerary and want a callback.',
    itineraries: 'AI-generated plans and the branded links you share with clients.',
    clients: 'Your client list and their trip preferences.',
    drivers: 'Your roster of drivers and vehicles.',
    finances: 'Keep your books clean — money in, money out, and real profit.',
    marketing: 'Generate social content for your agency.',
    settings: 'Agency name, logo, and brand colour used on shared itineraries.',
};

export const B2BDashboard = () => {
    const { agentCode } = useParams<{ agentCode?: string }>();
    const { user, isLoading, logout } = useAuth();
    const navigate = useNavigate();

    
    const [active, setActive] = useState<SectionId>('overview');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [leadUnread, setLeadUnread] = useState(0);

    // Unread lead count for the sidebar badge (agents only).
    useEffect(() => {
        if (isLoading || !user?.id) return;
        apiClient.getLeads().then((res) => setLeadUnread(res.data.unreadCount || 0)).catch(() => {});
    }, [isLoading, user?.id]);

    // Bare /dashboard → redirect the signed-in agent to their encoded route.
    useEffect(() => {
        if (isLoading) return;
        if (!agentCode && user?.id) {
            navigate(`/dashboard/${encodeAgentId(user.id)}`, { replace: true });
        }
    }, [agentCode, user, isLoading, navigate]);

    const agentId = agentCode ? decodeAgentId(agentCode) : user?.id ?? null;
    const agencyName = user?.businessName || user?.name || 'Your agency';
    const initial = (agencyName[0] || 'A').toUpperCase();

    const activeItem = useMemo(
        () => [...PRIMARY_NAV, SETTINGS_ITEM].find((n) => n.id === active) ?? PRIMARY_NAV[0],
        [active],
    );

    const go = (id: SectionId) => {
        setActive(id);
        setDrawerOpen(false);
    };

    return (
        <div className="relative min-h-screen bg-ai-dark text-ai-text">
            {/* Background — Himalayan topographic contour map + soft warmth (same as chat screen) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.10]"
                    style={{ backgroundImage: 'url(/topo.svg)' }}
                />
                <div className="absolute -top-32 -left-24 w-[34rem] h-[34rem] rounded-full bg-ai-accent/10 blur-[130px]" />
                <div className="absolute -bottom-40 -right-24 w-[34rem] h-[34rem] rounded-full bg-ai-saffron/[0.06] blur-[130px]" />
            </div>

            {/* ── Sidebar ── */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-60 bg-ai-card border-r border-black/8 flex flex-col
                    transition-transform lg:translate-x-0 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Brand */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-black/8">
                    <div className="flex items-center gap-2">
                        <img src="/logo-trimmed.png" alt="Himato" className="h-7 w-auto" />
                        <span className="text-[10px] uppercase tracking-[0.18em] text-ai-muted font-semibold">Agent</span>
                    </div>
                    <button onClick={() => setDrawerOpen(false)}
                        className="lg:hidden text-ai-muted hover:text-ai-text" aria-label="Close menu">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {PRIMARY_NAV.map((item) => (
                        <NavButton key={item.id} item={item} active={active === item.id} onClick={() => go(item.id)} badge={item.id === 'leads' ? leadUnread : 0} />
                    ))}
                </nav>

                {/* Footer: settings + logout */}
                <div className="px-3 py-4 border-t border-black/8 space-y-1">
                    <NavButton item={SETTINGS_ITEM} active={active === 'settings'} onClick={() => go('settings')} />
                    <button
                        onClick={async () => { await logout(); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {drawerOpen && (
                <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setDrawerOpen(false)} />
            )}

            {/* ── Main ── */}
            <div className="relative z-10 lg:pl-60">
                {/* Top bar */}
                <header className="h-16 sticky top-0 z-20 bg-ai-dark/80 backdrop-blur border-b border-black/8 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => setDrawerOpen(true)}
                            className="lg:hidden text-ai-muted hover:text-ai-text" aria-label="Open menu">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-ai-text leading-tight truncate">{agencyName}</h1>
                            <p className="text-[11px] text-ai-muted truncate">{activeItem.label}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/chat')}
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New itinerary
                        </button>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ background: 'linear-gradient(135deg, #2f4a3a, #1a2e23)' }}>
                            {initial}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-4 sm:p-6 max-w-6xl mx-auto">
                    {active === 'overview' ? (
                        <OverviewScaffold />
                    ) : active === 'leads' ? (
                        <LeadsSection onRead={() => setLeadUnread(0)} />
                    ) : active === 'itineraries' ? (
                        <ItinerariesSection />
                    ) : active === 'clients' ? (
                        <ClientsSection />
                    ) : active === 'drivers' ? (
                        <DriversSection />
                    ) : active === 'finances' ? (
                        <FinancesSection />
                    ) : (
                        <SectionPlaceholder title={activeItem.label} icon={activeItem.icon} blurb={SECTION_BLURB[active]} />
                    )}

                    {!agentId && (
                        <p className="mt-6 text-center text-xs text-ai-muted">
                            Sign in as a travel agent to load your workspace.
                        </p>
                    )}
                </main>
            </div>
        </div>
    );
};

// ── Sidebar nav button ──
function NavButton({ item, active, onClick, badge = 0 }: { item: NavItem; active: boolean; onClick: () => void; badge?: number }) {
    const Icon = item.icon;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? 'bg-ai-accent/10 text-ai-accent' : 'text-ai-muted hover:bg-black/5 hover:text-ai-text'
            }`}
        >
            <Icon className="w-4 h-4" />
            <span className="flex-1 text-left">{item.label}</span>
            {badge > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
}

// ── Overview: live snapshot pulled from the business dashboard endpoint ──
interface Activity {
    id: string;
    type: 'booking' | 'payment' | 'client' | 'itinerary';
    title: string;
    description: string;
    time: string;
}
interface DashboardData {
    counts: { clients: number; itineraries: number; leads: number; unreadLeads: number };
    activities: Activity[];
}

const ACTIVITY_ICON: Record<Activity['type'], { Icon: ComponentType<{ className?: string }>; cls: string }> = {
    itinerary: { Icon: Sparkles, cls: 'bg-ai-accent/12 text-ai-accent' },
    client:    { Icon: Users, cls: 'bg-sky-500/12 text-sky-700' },
    payment:   { Icon: CreditCard, cls: 'bg-emerald-500/12 text-emerald-700' },
    booking:   { Icon: Map, cls: 'bg-amber-500/12 text-amber-700' },
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function OverviewScaffold() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiClient.getBusinessDashboard();
                if (!cancelled) setData(res.data);
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Could not load your dashboard.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const counts = data?.counts;
    const activities = data?.activities ?? [];

    return (
        <div className="space-y-5">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="Leads" icon={Inbox} value={counts?.leads} loading={loading}
                    hint={counts?.unreadLeads ? `${counts.unreadLeads} unread` : undefined} />
                <StatCard label="Clients" icon={Users} value={counts?.clients} loading={loading} />
                <StatCard label="Itineraries" icon={Map} value={counts?.itineraries} loading={loading} />
            </div>

            {/* Recent activity */}
            <div className="bg-ai-card rounded-2xl border border-black/8 p-5">
                <p className="text-sm font-bold text-ai-text">Recent activity</p>
                {loading ? (
                    <div className="flex items-center justify-center py-12 text-ai-muted"><Loader2 className="w-5 h-5 animate-spin" /></div>
                ) : error ? (
                    <p className="py-8 text-center text-sm text-red-600">{error}</p>
                ) : activities.length === 0 ? (
                    <div className="mt-3 rounded-xl border border-dashed border-black/10 py-10 text-center">
                        <p className="text-xs text-ai-muted">No activity yet. Generate an itinerary or add a client to get started.</p>
                    </div>
                ) : (
                    <ul className="mt-3 divide-y divide-black/6">
                        {activities.map((a) => {
                            const { Icon, cls } = ACTIVITY_ICON[a.type] ?? ACTIVITY_ICON.itinerary;
                            return (
                                <li key={a.id} className="flex items-center gap-3 py-2.5">
                                    <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${cls}`}><Icon className="w-4 h-4" /></span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-ai-text truncate">{a.title}</p>
                                        <p className="text-[11px] text-ai-muted truncate">{a.description}</p>
                                    </div>
                                    <span className="text-[11px] text-ai-muted shrink-0">{timeAgo(a.time)}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, icon: Icon, value, loading, hint }: {
    label: string; icon: ComponentType<{ className?: string }>; value?: number; loading: boolean; hint?: string;
}) {
    return (
        <div className="bg-ai-card rounded-2xl border border-black/8 p-5">
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ai-muted">{label}</p>
                <Icon className="w-4 h-4 text-ai-muted" />
            </div>
            {loading ? (
                <div className="mt-2 h-8 w-12 rounded-lg bg-black/5 animate-pulse" />
            ) : (
                <p className="text-3xl font-bold text-ai-text mt-1">{value ?? 0}</p>
            )}
            {hint && !loading && <p className="text-[11px] text-ai-accent font-semibold mt-0.5">{hint}</p>}
        </div>
    );
}

// ── Generic empty section ──
function SectionPlaceholder({ title, icon: Icon, blurb }: {
    title: string; icon: ComponentType<{ className?: string }>; blurb: string;
}) {
    return (
        <div className="bg-ai-card rounded-2xl border border-black/8 p-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-ai-accent/10 flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-ai-accent" />
            </div>
            <h2 className="text-xl font-bold text-ai-text">{title}</h2>
            <p className="text-sm text-ai-muted mt-1 max-w-sm">{blurb}</p>
            <span className="mt-5 inline-flex items-center px-3 py-1 rounded-full bg-black/5 text-[11px] font-semibold uppercase tracking-wider text-ai-muted">
                Coming next
            </span>
        </div>
    );
}
