import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { encodeAgentId, decodeAgentId } from '../utils/sharing';
import { ItinerariesSection } from '../components/dashboard/ItinerariesSection';
import { LeadsSection } from '../components/dashboard/LeadsSection';
import { apiClient } from '../services/api';
import {
    LayoutDashboard, Map, Users, CalendarCheck, Wallet, Megaphone,
    Settings, Menu, X, Plus, LogOut, Inbox,
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
    | 'bookings' | 'payments' | 'marketing' | 'settings';

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
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'payments', label: 'Payments', icon: Wallet },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
];

const SETTINGS_ITEM: NavItem = { id: 'settings', label: 'Settings', icon: Settings };

const SECTION_BLURB: Record<SectionId, string> = {
    overview: 'Snapshot of your business at a glance.',
    leads: 'Travellers who sent you an itinerary and want a callback.',
    itineraries: 'AI-generated plans and the branded links you share with clients.',
    clients: 'Your client list and their trip preferences.',
    bookings: 'Confirmed and upcoming trips.',
    payments: 'Payments received and pending.',
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

// ── Overview scaffold: layout intent, no real data yet ──
function OverviewScaffold() {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {['Bookings', 'Clients', 'Revenue', 'Itineraries'].map((label) => (
                    <div key={label} className="bg-ai-card rounded-2xl border border-black/8 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ai-muted">{label}</p>
                        <p className="text-3xl font-bold text-ai-text mt-1">—</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
                <PanelStub title="Revenue overview" hint="Chart goes here" className="h-64" />
                <PanelStub title="Recent activity" hint="Latest bookings & shares" className="h-64" />
            </div>
        </div>
    );
}

function PanelStub({ title, hint, className = '' }: { title: string; hint: string; className?: string }) {
    return (
        <div className={`bg-ai-card rounded-2xl border border-black/8 p-5 ${className}`}>
            <p className="text-sm font-bold text-ai-text">{title}</p>
            <div className="mt-3 h-[calc(100%-2rem)] rounded-xl border border-dashed border-black/10 flex items-center justify-center">
                <p className="text-xs text-ai-muted">{hint}</p>
            </div>
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
